import { esc } from './layout.mjs';
import { site, useCases, proof } from '../data/site.mjs';
import { competitors, compareRows, defaultOrder, verifiedOn } from '../data/compare.mjs';
import { commerce } from '../data/commerce.mjs';

/* ---------------- use-case router ---------------- */
export function router(label = 'Find your use case') {
  const cards = useCases.filter(u => u.id !== 'other').map(u => `
    <a class="router__card" href="${u.href}">
      <strong>${esc(u.label)}</strong>
      <span>${esc(u.short)}</span>
      <em>See how it works →</em>
    </a>`).join('');
  return `<section class="router"><div class="wrap router__in">
    <p class="router__label">${esc(label)}</p>
    <div class="router__grid">${cards}</div>
  </div></section>`;
}

/* ---------------- proof block ---------------- */
export function proofBlock() {
  return `<section class="section proof" id="proof"><div class="wrap">
    <div class="section-head">
      <p class="eyebrow">The measurement</p>
      <h2>One centimetre, on our own hardware.</h2>
      <p>Not a datasheet number borrowed from a chip vendor. This is our receiver, our antenna, our software, in the field.</p>
    </div>
    <div class="proof__panel">
      <div class="proof__readout">
        <span class="proof__chip"><span class="dot"></span>RTK FIX &middot; Q=${proof.q}</span>
        <div class="readout">
          <div><b>${esc(proof.hrms)}</b><span>HRMS</span></div>
          <div><b>${esc(proof.vrms)}</b><span>VRMS</span></div>
          <div><b>${proof.sats}</b><span>Satellites</span></div>
          <div><b>${esc(proof.carrier)}</b><span>Carrier</span></div>
        </div>
        <p class="proof__note">${esc(proof.note)}</p>
      </div>
      <div class="proof__aside">
        <h3>And it holds across a job, not just a moment</h3>
        <p>A ${proof.pointsLogged}-point session logged at <span class="num">${esc(proof.perPoint)}</span> per point with corrections aged <span class="num">${esc(proof.correctionAge)}</span>. Every point stores its fix state, satellite count, accuracy and antenna height, so the observation is defensible months later.</p>
        <p style="color:var(--muted);font-size:var(--step--1)">We have not yet published consistency figures under canopy or dense urban multipath. That validation is in progress and we will publish it when it exists.</p>
      </div>
    </div>
  </div></section>`;
}

/* ---------------- comparison table ---------------- */
export function compareTable(order = defaultOrder, opts = {}) {
  const cols = order.map(k => competitors[k]);
  const head = cols.map(c =>
    `<th scope="col"${c.key === 'aerom' ? ' class="is-us"' : ''}>${esc(c.name)}<small>${esc(c.tier)}</small></th>`
  ).join('');

  const body = compareRows.map(row => {
    const cells = cols.map(c => {
      const v = c[row.key];
      let out;
      if (row.type === 'bool') {
        out = v ? '<span class="yes">Yes</span>' : '<span class="no">No</span>';
        if (row.key === 'tilt' && c.key === 'aerom') out = '<span class="no">Roadmap</span>';
      } else {
        out = esc(v);
      }
      return `<td${c.key === 'aerom' ? ' class="is-us"' : ''}>${out}</td>`;
    }).join('');
    return `<tr><th scope="row">${esc(row.label)}</th>${cells}</tr>`;
  }).join('');

  return `<div class="cmp-scroll"><table class="cmp">
    <thead><tr><th scope="col"><span class="visually-hidden">Criterion</span></th>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table></div>
  <p class="cmp-note"><strong>Accuracy is table stakes.</strong> Published RTK accuracy across this market sits around 7–8&nbsp;mm + 1&nbsp;ppm horizontal, and we do not claim to beat it. We claim you should not have to pay ₹20&nbsp;lakh for it. Note also the tilt-compensation row — that one is not in our favour yet, and we would rather you read it here than discover it later.</p>
  <p class="cmp-note" style="margin-top:8px">Indicative Indian street prices and published specifications, verified ${esc(verifiedOn)}. Prices move; ask us for current figures. ${opts.extraNote || ''}</p>`;
}

/* ---------------- FAQ + schema ---------------- */
export function faqBlock(items, heading = 'Questions surveyors actually ask') {
  const html = items.map(f => `
    <details>
      <summary>${esc(f.q)}</summary>
      <p>${esc(f.a)}</p>
    </details>`).join('');
  return `<section class="section section--alt"><div class="wrap">
    <div class="section-head"><p class="eyebrow">FAQ</p><h2>${esc(heading)}</h2></div>
    <div class="faq">${html}</div>
  </div></section>`;
}

export function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbSchema(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name, item: site.domain + t.href,
    })),
  };
}

export function crumb(trail) {
  const parts = trail.map((t, i) =>
    i === trail.length - 1 ? `<span aria-current="page">${esc(t.name)}</span>`
                           : `<a href="${t.href}">${esc(t.name)}</a>`
  ).join('<span>/</span>');
  return `<div class="wrap crumb">${parts}</div>`;
}

/* ---------------- lead form ---------------- */
export function leadForm({ id = 'lead', intent = 'demo', useCase = '', heading, sub, cta = 'Request a demo' } = {}) {
  const opts = useCases.map(u =>
    `<option value="${u.id}"${u.id === useCase ? ' selected' : ''}>${esc(u.label)}</option>`).join('');
  return `<form class="form" data-lead-form id="${esc(id)}" novalidate>
    ${heading ? `<h3 style="font-size:var(--step-2)">${esc(heading)}</h3>` : ''}
    ${sub ? `<p style="color:var(--text-2)">${esc(sub)}</p>` : ''}
    <input type="hidden" name="intent" value="${esc(intent)}">
    <input type="hidden" name="sourcePage" value="">
    <input type="hidden" name="referrer" value="">
    <input type="hidden" name="utm" value="">
    <input type="hidden" name="startedAt" value="">
    <div class="hp" aria-hidden="true"><label>Do not fill this in<input type="text" name="company_website" tabindex="-1" autocomplete="off"></label></div>

    <div class="field">
      <label for="${id}-use">What do you do? <span class="req">*</span></label>
      <select id="${id}-use" name="useCase" required>${opts}</select>
    </div>
    <div class="form__row">
      <div class="field"><label for="${id}-name">Name <span class="req">*</span></label><input id="${id}-name" name="name" type="text" required autocomplete="name" maxlength="120"></div>
      <div class="field"><label for="${id}-email">Email <span class="req">*</span></label><input id="${id}-email" name="email" type="email" required autocomplete="email" inputmode="email" maxlength="160"></div>
    </div>

    <details class="form__more">
      <summary>Add a few details so we can prepare properly <span>optional</span></summary>
      <div class="form__more-in">
        <div class="form__row">
          <div class="field"><label for="${id}-org">Organisation</label><input id="${id}-org" name="organisation" type="text" autocomplete="organization" maxlength="160"></div>
          <div class="field"><label for="${id}-phone">Phone / WhatsApp</label><input id="${id}-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="40"></div>
        </div>
        <div class="field"><label for="${id}-city">City / Country</label><input id="${id}-city" name="city" type="text" autocomplete="address-level2" maxlength="120"></div>
        <div class="field"><label for="${id}-msg">What are you trying to solve?</label><textarea id="${id}-msg" name="message" rows="3" maxlength="2000"></textarea></div>
      </div>
    </details>

    <label class="check">
      <input type="checkbox" name="marketingConsent" value="yes">
      <span>Also send me occasional Aerom product updates. Roughly monthly, and you can stop any time.</span>
    </label>

    <button class="btn btn--primary btn--lg btn--block" type="submit">${esc(cta)}<span class="btn__arrow">→</span></button>
    <p class="form__status" role="status" aria-live="polite" data-form-status></p>
    <p class="form__note">
      We use your details only to reply to this enquiry — we do not sell them or pass them to advertisers.
      See our <a href="/privacy/">privacy policy</a>; you can ask us to delete your data at any time.
      A person replies within one working day, usually faster.
    </p>
  </form>`;
}

/* ---------------- CTA band ---------------- */
export function ctaBand({ heading, body, useCase = '', intent = 'demo', cta } = {}) {
  return `<section class="section cta" id="contact"><div class="wrap cta__grid">
    <div>
      <p class="eyebrow">Next step</p>
      <h2>${esc(heading || 'See it work on your own site')}</h2>
      <p class="lede" style="margin-top:16px">${esc(body || 'Aerom is in its pilot programme. Tell us what you survey and we will arrange a demo, answer specification questions, and send the price sheet.')}</p>
      <p style="color:var(--muted);font-size:var(--step--1);margin-top:20px">Prefer email? <a href="mailto:${esc(site.email)}" style="color:var(--brand)">${esc(site.email)}</a></p>
    </div>
    <div class="formcard">${leadForm({ id: 'cta', intent, useCase, cta })}</div>
  </div></section>`;
}

/* ---------------- misc small blocks ---------------- */
export const cards = (items) => `<div class="grid grid-3">${items.map(i =>
  `<div class="card"><h3>${esc(i.h)}</h3><p>${esc(i.p)}</p></div>`).join('')}</div>`;

export const numbered = (items) => `<ol class="numbered">${items.map(i =>
  `<li><div><h3>${esc(i.h)}</h3><p>${esc(i.p)}</p></div></li>`).join('')}</ol>`;

export const specList = (rows) => `<dl class="specs">${rows.map(([k, v]) =>
  `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;


/* ---------------- buying, support and logistics ----------------
   The four questions a procurement buyer asks before accuracy:
   what's in the box, when do I get it, what if it breaks, who trains my crew. */
export function buyingBlock({ box = 'rover' } = {}) {
  const items = (box === 'base' ? commerce.boxBase : commerce.boxRover)
    .map((i) => `<li>${esc(i)}</li>`).join('');
  return `<section class="section section--alt" id="buying"><div class="wrap">
    <div class="section-head">
      <p class="eyebrow">Buying &amp; support</p>
      <h2>What you actually get, and what happens afterwards</h2>
      <p>The questions that decide a purchase are rarely about accuracy. They are about delivery, warranty and who picks up the phone at 4pm on a Thursday.</p>
    </div>
    <div class="grid grid-2" style="align-items:start">
      <div class="card">
        <h3>In the box</h3>
        <ul class="gate__list" style="margin-top:14px">${items}</ul>
      </div>
      <div>
        <dl class="specs">
          <div><dt>Lead time</dt><dd>${esc(commerce.leadTime)}</dd></div>
          <div><dt>Warranty</dt><dd>${commerce.warrantyMonths} months against manufacturing defects</dd></div>
          <div><dt>Service turnaround</dt><dd>${esc(commerce.serviceTurnaround)}</dd></div>
          <div><dt>Support hours</dt><dd>${esc(commerce.supportHours)}</dd></div>
          <div><dt>How you reach us</dt><dd>${esc(commerce.supportChannels)}</dd></div>
          <div><dt>Training</dt><dd>${esc(commerce.training)}</dd></div>
        </dl>
        <p style="color:var(--muted);font-size:var(--step--1);margin-top:16px">
          Full warranty and service terms come with the quotation. Read them before you buy — from us or from anyone.
        </p>
      </div>
    </div>
  </div></section>`;
}

export const buyingFaqs = commerce.faqs;
