/**
 * POST /api/lead — the only backend endpoint on the site.
 *
 * Fans a submitted lead out to every configured destination:
 *   1. Google Sheet   (your live lead database — downloads as .xlsx any time)
 *   2. Apollo.io      (so it lands in the CRM and can enter a sequence)
 *   3. Email          (instant notification, because speed of reply is the whole game)
 *
 * Every destination is optional and configured by environment variable. A lead
 * is only reported as accepted if at least one destination actually stored it —
 * we would rather show the visitor an error and have them email us than quietly
 * drop an enquiry.
 *
 * No npm dependencies: the Google service-account JWT is signed with node:crypto
 * and everything else is fetch. That keeps cold starts fast.
 *
 * ---------------------------------------------------------------------------
 * Environment variables (set in Vercel → Project → Settings → Environment Variables)
 * ---------------------------------------------------------------------------
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL   xxx@yyy.iam.gserviceaccount.com
 *   GOOGLE_PRIVATE_KEY             the full -----BEGIN PRIVATE KEY----- block
 *   GOOGLE_SHEET_ID                the long id from the sheet's URL
 *   GOOGLE_SHEET_TAB               optional, defaults to "Leads"
 *   APOLLO_API_KEY                 optional
 *   RESEND_API_KEY                 optional
 *   NOTIFY_EMAIL                   where notifications go
 *   NOTIFY_FROM                    verified sender, e.g. leads@dragonflylab.in
 * ---------------------------------------------------------------------------
 */

import crypto from 'node:crypto';

const SHEET_HEADERS = [
  'Timestamp (IST)', 'Intent', 'Use case', 'Name', 'Organisation', 'Email',
  'Phone', 'City / Country', 'Message', 'Marketing consent', 'Source page',
  'Referrer', 'UTM',
];

/**
 * Neutralise spreadsheet formula injection.
 *
 * We append with valueInputOption=RAW, so Sheets itself stores "=IMPORTXML(...)"
 * as text. But the moment you export the sheet to CSV and open it in Excel or
 * LibreOffice, a leading =, +, -, @, tab or CR is interpreted as a formula and
 * runs — which is exactly what the user asked for when they said "send it to me
 * via Excel". Prefixing with an apostrophe makes the cell unambiguously text
 * everywhere, and the apostrophe is not displayed.
 */
const deFormula = (v) =>
  typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;

const USE_CASES = ['drone', 'survey', 'construction', 'government', 'other'];
const INTENTS = ['demo', 'price_sheet', 'newsletter'];

/* ------------------------------- helpers ------------------------------- */

// strip control characters (including the newlines a bot could use to inject
// an extra row into the sheet), collapse whitespace, then cap the length
const clean = (v, max = 500) =>
  typeof v === 'string'
    ? v.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
    : '';

const looksLikeEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

function istTimestamp() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium',
  }).format(new Date());
}

/* --------------------------- Google Sheets ----------------------------- */

function base64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function googleAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const signature = base64url(
    crypto.createSign('RSA-SHA256').update(`${header}.${claim}`).sign(key)
  );

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`Google token ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

/**
 * Accept either a bare spreadsheet ID or a pasted Google Sheets URL.
 *
 * Setting this up means copying a value out of the browser, and the thing that is
 * actually on the clipboard is usually the whole URL:
 *   https://docs.google.com/spreadsheets/d/<ID>/edit?gid=0#gid=0
 * Feeding that to the API produces `404 Requested entity was not found` — which
 * reads like "the sheet is missing" and sends you looking in the wrong place.
 * Pull the ID out instead of failing on a mistake that takes one regex to absorb.
 */
function normaliseSheetId(raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  const m = v.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (m) return m[1];
  return v.replace(/^\/+|\/+$/g, '');
}

async function appendToSheet(lead) {
  const sheetId = normaliseSheetId(process.env.GOOGLE_SHEET_ID);
  if (!sheetId) {
    console.warn('[lead] sheet skipped: GOOGLE_SHEET_ID is not set in this environment');
    return { skipped: true };
  }

  const token = await googleAccessToken();
  if (!token) {
    // Reached when the service-account email or private key is missing, or the
    // key is malformed. Say which, because the alternative is a silent no-op.
    console.warn('[lead] sheet skipped: no Google access token —',
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'GOOGLE_SERVICE_ACCOUNT_EMAIL is unset'
        : !process.env.GOOGLE_PRIVATE_KEY ? 'GOOGLE_PRIVATE_KEY is unset'
          : 'GOOGLE_PRIVATE_KEY is set but did not produce a token (check the full PEM block and the \\n escapes)');
    return { skipped: true };
  }

  const tab = process.env.GOOGLE_SHEET_TAB || 'Leads';
  const row = [
    lead.timestamp, lead.intent, lead.useCase, lead.name, lead.organisation,
    lead.email, lead.phone, lead.city, lead.message, lead.marketingConsent,
    lead.sourcePage, lead.referrer, lead.utm,
  ].map(deFormula);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}` +
    `/values/${encodeURIComponent(tab + '!A:M')}:append` +
    `?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [row] }),
  });
  if (!res.ok) {
    const body = (await res.text()).slice(0, 300);
    // Translate the two API errors that actually happen in setup into the action
    // that fixes them, so the log line is the answer rather than the start of a hunt.
    const hint =
      res.status === 404
        ? ` — the service account cannot see a spreadsheet with id "${sheetId}". Either GOOGLE_SHEET_ID is wrong, or the sheet has not been shared with ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'the service account'} as Editor (Google returns 404, not 403, for a file the caller has no access to at all).`
        : res.status === 400
          ? ` — check that a tab named "${tab}" exists in the spreadsheet (GOOGLE_SHEET_TAB is case-sensitive).`
          : '';
    throw new Error(`Sheets ${res.status}: ${body}${hint}`);
  }
  return { ok: true };
}

/* ------------------------------- Apollo -------------------------------- */

async function pushToApollo(lead) {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) return { skipped: true };

  const [first, ...rest] = lead.name.split(/\s+/);
  const res = await fetch('https://api.apollo.io/api/v1/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      first_name: first || lead.name,
      last_name: rest.join(' ') || '',
      email: lead.email,
      organization_name: lead.organisation || undefined,
      title: undefined,
      direct_phone: lead.phone || undefined,
      present_raw_address: lead.city || undefined,
      label_names: ['dragonflylab.in', `intent:${lead.intent}`, `usecase:${lead.useCase}`],
    }),
  });
  if (!res.ok) throw new Error(`Apollo ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return { ok: true };
}

/* -------------------------------- Email -------------------------------- */

async function notifyByEmail(lead) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.NOTIFY_FROM;
  if (!apiKey || !to || !from) {
    console.warn('[lead] email skipped: missing',
      [!apiKey && 'RESEND_API_KEY', !to && 'NOTIFY_EMAIL', !from && 'NOTIFY_FROM'].filter(Boolean).join(', '));
    return { skipped: true };
  }

  // Resend will only send FROM a domain you have verified. A gmail.com (or any
  // other free-provider) sender is rejected 403 no matter how valid the API key
  // is — you cannot verify a domain you do not control. Fail early and say so.
  const fromDomain = (from.match(/@([^>\s]+)/) || [])[1] || '';
  if (/^(gmail|googlemail|yahoo|outlook|hotmail|live|icloud|proton(mail)?)\./.test(`${fromDomain}.`)) {
    throw new Error(
      `Resend will not send from ${fromDomain}: NOTIFY_FROM must be an address at a domain verified in Resend ` +
      `(e.g. leads@dragonflylab.in after verifying dragonflylab.in at https://resend.com/domains). ` +
      `NOTIFY_EMAIL — where the notification is delivered — can stay a Gmail address.`
    );
  }

  const label = lead.intent === 'price_sheet' ? 'PRICE SHEET' : 'DEMO';
  const rows = [
    ['Use case', lead.useCase], ['Name', lead.name], ['Organisation', lead.organisation],
    ['Email', lead.email], ['Phone', lead.phone], ['City', lead.city],
    ['Message', lead.message], ['Marketing opt-in', lead.marketingConsent],
    ['Page', lead.sourcePage], ['Referrer', lead.referrer],
    ['UTM', lead.utm], ['Time (IST)', lead.timestamp],
  ].filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#666;vertical-align:top">${k}</td><td style="padding:6px 0"><b>${escapeHtml(v)}</b></td></tr>`)
    .join('');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from, to: [to], reply_to: lead.email,
      subject: `[${label}] ${lead.name}${lead.organisation ? ' — ' + lead.organisation : ''} (${lead.useCase})`,
      html: `<div style="font:14px/1.6 system-ui,sans-serif">
        <p style="margin:0 0 14px">New ${label.toLowerCase()} enquiry from dragonflylab.in</p>
        <table style="border-collapse:collapse">${rows}</table>
        <p style="margin:18px 0 0;color:#888;font-size:12px">Reply to this email to answer them directly.</p>
      </div>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return { ok: true };
}

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');


/* --------------------------- abuse protection --------------------------- */

/**
 * Best-effort rate limiting.
 *
 * Serverless instances do not share memory, so this is a per-instance counter,
 * not a global one. Under load Vercel may run several instances and an attacker
 * could get a few times the nominal limit through. It is still worth having: it
 * stops the trivial case (one script hammering the endpoint), it costs nothing,
 * and it needs no extra infrastructure.
 *
 * If the form ever gets seriously abused, move this to Vercel KV or Upstash for
 * a shared counter — the interface below is deliberately easy to swap.
 */
const WINDOW_MS = 10 * 60 * 1000;   // 10 minutes
const MAX_PER_IP = 5;
const MAX_ENTRIES = 5000;           // hard cap so a spoofed-IP flood cannot grow this unbounded
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  for (const [k, times] of hits) {
    const live = times.filter((t) => now - t < WINDOW_MS);
    if (live.length) hits.set(k, live); else hits.delete(k);
  }
  if (hits.size > MAX_ENTRIES) hits.clear();

  const times = hits.get(ip) || [];
  if (times.length >= MAX_PER_IP) return true;
  times.push(now);
  hits.set(ip, times);
  return false;
}

function clientIp(req) {
  const fwd = req.headers?.['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  if (Array.isArray(fwd) && fwd.length) return String(fwd[0]).split(',')[0].trim();
  return req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

/**
 * Only accept submissions that came from our own pages.
 *
 * Browsers always send Origin on a cross-origin POST, so this blocks a form on
 * someone else's site posting into our endpoint. It is not a defence against a
 * direct scripted request (which can set any Origin it likes) — the rate limit
 * and the honeypot cover that case. Requests with no Origin at all are allowed
 * through, because some privacy tools strip the header from same-origin posts
 * and we would rather not lose a real enquiry.
 */
const ALLOWED_HOSTS = [
  'dragonflylab.in', 'www.dragonflylab.in',
  'localhost', '127.0.0.1',
];

function originAllowed(req) {
  const origin = req.headers?.origin;
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    if (ALLOWED_HOSTS.includes(host)) return true;
    // Vercel preview deployments: <project>-<hash>-<scope>.vercel.app
    return /\.vercel\.app$/.test(host);
  } catch {
    return false;
  }
}

/* ------------------------------- handler ------------------------------- */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!originAllowed(req)) {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({
      ok: false,
      error: 'Too many submissions from this connection. Please email us directly.',
    });
  }

  let raw = req.body;
  if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = {}; } }
  if (!raw || typeof raw !== 'object') raw = {};

  // --- spam gates -------------------------------------------------------
  // 1. honeypot: a field hidden from humans, irresistible to naive bots
  if (clean(raw.company_website)) {
    return res.status(200).json({ ok: true });   // pretend success, store nothing
  }
  // 2. timing: a human cannot read the form and fill it in under 2.5 seconds
  const started = Number(raw.startedAt);
  if (Number.isFinite(started) && started > 0 && Date.now() - started < 2500) {
    return res.status(200).json({ ok: true });
  }

  // --- validation -------------------------------------------------------
  const lead = {
    timestamp: istTimestamp(),
    intent: INTENTS.includes(raw.intent) ? raw.intent : 'demo',
    useCase: USE_CASES.includes(raw.useCase) ? raw.useCase : 'other',
    name: clean(raw.name, 120),
    organisation: clean(raw.organisation, 160),
    email: clean(raw.email, 160).toLowerCase(),
    phone: clean(raw.phone, 40),
    city: clean(raw.city, 120),
    message: clean(raw.message, 2000),
    // Replying to an enquiry someone sent us rests on their voluntary provision
    // of the data (DPDP) and on pre-contractual steps / legitimate interest
    // (GDPR). Sending unrelated marketing does NOT — that needs this opt-in,
    // so it is recorded per lead and must be honoured.
    marketingConsent: raw.marketingConsent === 'yes' ? 'yes' : 'no',
    sourcePage: clean(raw.sourcePage, 200),
    referrer: clean(raw.referrer, 300),
    utm: clean(raw.utm, 500),
  };

  if (!lead.name) return res.status(400).json({ ok: false, error: 'Name is required' });
  if (!looksLikeEmail(lead.email)) return res.status(400).json({ ok: false, error: 'A valid email is required' });

  // --- fan out ----------------------------------------------------------
  const results = await Promise.allSettled([
    appendToSheet(lead),
    pushToApollo(lead),
    notifyByEmail(lead),
  ]);

  const names = ['sheet', 'apollo', 'email'];
  const stored = [];
  const failed = [];
  const skipped = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      if (r.value?.skipped) skipped.push(names[i]); else stored.push(names[i]);
    } else {
      failed.push(names[i]);
      console.error(`[lead] ${names[i]} failed:`, r.reason?.message || r.reason);
    }
  });

  if (stored.length === 0) {
    // Nothing captured it. Say so rather than losing the enquiry silently.
    // Deliberately no email or name in the log line — server logs are retained
    // by the platform and are a weaker place to hold personal data than the
    // access-controlled systems this endpoint is meant to write to.
    console.error('[lead] NOT STORED — no destination accepted it', { skipped, failed, intent: lead.intent });
    return res.status(500).json({
      ok: false,
      error: 'We could not record that. Please email us directly and we will pick it up.',
    });
  }

  if (failed.length) console.warn('[lead] partial delivery', { stored, failed, skipped });
  return res.status(200).json({ ok: true, stored });
}

export { SHEET_HEADERS };
