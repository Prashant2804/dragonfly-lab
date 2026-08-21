import { esc } from '../templates/layout.mjs';
import { crumb, breadcrumbSchema, ctaBand } from '../templates/blocks.mjs';

/**
 * Updates feed. Add newest first. Keep entries short and factual — this page's
 * value is that it is honest and current, not that it is long.
 */
const updates = [
  {
    date: '2026-08-20', label: 'August 2026',
    h: 'One centimetre, sustained across a session',
    p: 'Logged a 53-point session at ±14 mm per point with corrections aged one second and a fixed carrier solution throughout. Single-reading fixes are easy; holding it across a working session is the part that matters.',
  },
  {
    date: '2026-06-25', label: 'June 2026',
    h: 'Rover and base station CAD complete',
    p: 'Parametric models for both units finished: 2.00 m rover with swappable battery module and marked ARP datum, and a tripod-mounted base. Open questions we are still working: detented hard stops at known pole heights, and weatherproof inter-module power contacts.',
  },
  {
    date: '2026-06-01', label: 'June 2026',
    h: 'Aerom Capture reaches working field workflow',
    p: 'The Android app now runs the core loop end to end — connect, base setup, NTRIP, collect, stake out, export. Roughly three-quarters of the way to the workflow we consider sellable.',
  },
  {
    date: '2026-05-01', label: 'May 2026',
    h: 'First 1 cm RTK FIX on our own hardware',
    p: 'HRMS 0.010 m, VRMS 0.010 m, 12 satellites, carrier FIXED. The central technical question — can this hardware stack actually reach survey grade — answered yes.',
  },
];

const roadmap = {
  shipping: ['RTK rover and base hardware', 'Aerom Capture field app (beta)', 'NTRIP client and caster', 'Point collection, codes, photos', 'Stakeout', 'Standard exports'],
  beta: ['Aerom Capture with pilot users', 'Indian CRS and datum handling', 'Fleet provisioning', 'Government deliverable formats'],
  next: ['Aerom Studio desktop PPK', 'Exportable quality reports', 'Tilt compensation (9-axis IMU)', 'NavIC support', 'Environmental sealing certification', 'Multipath and canopy validation'],
};

export default function company() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Company', href: '/company/' }];

  const feed = updates.map(u => `
    <article class="update">
      <time datetime="${u.date}">${esc(u.label)}</time>
      <div><h3>${esc(u.h)}</h3><p>${esc(u.p)}</p></div>
    </article>`).join('');

  const col = (title, items) =>
    `<div><h3>${esc(title)}</h3><ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`;

  const body = `
${crumb(trail)}

<section class="section section--tight"><div class="wrap">
  <p class="eyebrow">Company</p>
  <h1>Dragonfly</h1>
  <p class="lede" style="margin-top:18px">We are building survey-grade positioning that Indian surveyors and drone operators can actually afford to own — and that is built, supported and understood here rather than imported and hoped for.</p>
</div></section>

<section class="section section--tight"><div class="wrap">
  <div class="grid grid-2" style="gap:40px">
    <div>
      <h2 style="font-size:var(--step-2)">Where we are, honestly</h2>
      <div class="stack" style="margin-top:18px;color:var(--text-2)">
        <p>The hardware works. We have demonstrated approximately 1 cm RTK on our own receiver, our own antenna and our own software, and held it across a full logging session.</p>
        <p>The field app is in beta and runs the core survey workflow end to end. The desktop post-processing app is in development. Tilt compensation and NavIC are on the roadmap, not in your hands.</p>
        <p>We are pre-revenue and in a pilot programme, placing units with surveyors, drone operators and institutions who will run them on real work and tell us what breaks. We would rather be told that by ten users now than by two hundred later.</p>
      </div>
    </div>
    <div>
      <h2 style="font-size:var(--step-2)">What we believe</h2>
      <div class="stack" style="margin-top:18px;color:var(--text-2)">
        <p><strong style="color:var(--text)">Accuracy is table stakes.</strong> Every serious receiver in this market lands around a centimetre. Anyone competing on millimetres is competing on the wrong axis.</p>
        <p><strong style="color:var(--text)">Hardware gets us in; software keeps us in.</strong> The receiver module is available to anyone. What is not commoditised is the workflow from field to office, and being trustworthy about what the instrument is actually telling you.</p>
        <p><strong style="color:var(--text)">Say the gaps out loud.</strong> Tilt is not shipped. Sealing is not certified. Studio is not released. A company that hides those is a company that will hide worse things later.</p>
      </div>
    </div>
  </div>
</div></section>

<section class="section section--alt"><div class="wrap">
  <div class="section-head"><p class="eyebrow">Roadmap</p><h2>What is done, what is close, what is next</h2></div>
  <div class="roadmap">
    ${col('Shipping', roadmap.shipping)}
    ${col('In beta', roadmap.beta)}
    ${col('Next', roadmap.next)}
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head"><p class="eyebrow">Updates</p><h2>What has actually happened</h2>
  <p>Dated, specific, and posted whether the month went well or not.</p></div>
  ${feed}
</div></section>

${ctaBand({
    heading: 'Follow along, or join the pilot',
    body: 'If you survey land, fly mapping missions, or run an institutional survey programme, we want to hear from you — including if your answer is "not yet, but tell me when".',
  })}
`;

  return {
    url: '/company/',
    title: 'About Dragonfly — Building Aerom RTK GNSS in India',
    description: 'Who we are, exactly where the Aerom RTK GNSS system stands today, what is shipping, what is in beta and what is still on the roadmap. Updated as things change.',
    body,
    schema: [breadcrumbSchema(trail)],
  };
}
