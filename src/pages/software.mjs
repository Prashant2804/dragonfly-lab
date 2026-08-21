import { crumb, breadcrumbSchema, faqBlock, faqSchema, ctaBand, cards, numbered } from '../templates/blocks.mjs';

const faqs = [
  { q: 'What does the free software include?', a: 'Everything needed to do a job: connect to the receiver, set up as base or rover, take NTRIP corrections, collect points with codes and attributes, stake out, and export in standard formats. We do not cripple the basics to force an upgrade.' },
  { q: 'What is in Aerom Pro?', a: 'Post-processing, cloud sync between field and office, CAD import, government deliverable formats, advanced stakeout and reporting. It is the office half of the workflow rather than a paywall around the field half.' },
  { q: 'Does the field app work offline?', a: 'Yes. Collection, stakeout and logging all work without a network connection — which matters, because a great deal of Indian survey work happens where there is no usable signal. Cloud sync catches up when you are back in range.' },
  { q: 'What is Aerom Studio built on?', a: 'RTKLIB does the GNSS processing. That is deliberate and it is the same choice Emlid made for Emlid Studio — a proven, scrutinised engine is worth far more here than a novel one we wrote ourselves. Our work is the workflow, the quality reporting and the coordinate handling around it.' },
  { q: 'Which platforms does it run on?', a: 'Aerom Capture is an Android app. Aerom Studio is desktop and is being built cross-platform. Studio is in development and is not yet in users\' hands.' },
];

export default function software() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Software', href: '/software/' }];

  const body = `
${crumb(trail)}

<section class="section section--tight"><div class="wrap">
  <p class="eyebrow">Software</p>
  <h1>The part that decides whether the day goes well.</h1>
  <p class="lede" style="margin-top:18px">Every receiver in this market lands around a centimetre. What separates a good field day from a bad one is whether the software tells you the truth, and whether the file you export is the file your client can open.</p>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Aerom Capture &middot; Android &middot; in beta</p>
    <h2>The field app</h2>
    <p>Connect, set up, collect, stake out, export. Built so that a surveyor who has never seen it can complete a job on the first day.</p>
  </div>
  ${cards([
    { h: 'Fix state in plain language', p: 'RTK Fix, Float and Single stated as words, with correction age next to them. Not a colour you have to remember the meaning of.' },
    { h: 'Point collection with evidence', p: 'Codes, attributes and photos against each point, plus the fix state, satellite count and accuracy stored automatically.' },
    { h: 'Base and rover setup', p: 'Over a known point or averaged in fix, with antenna height entered against the marked ARP datum.' },
    { h: 'NTRIP corrections', p: 'Connect to a commercial or CORS caster, or take corrections from your own Aerom base.' },
    { h: 'Stakeout', p: 'Load design points, navigate to them, record the delta between design and as-built.' },
    { h: 'Works offline', p: 'Full collection and stakeout without a network. Sync when you are back in range.' },
  ])}
</div></section>

<section class="section section--alt"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Aerom Studio &middot; desktop &middot; in development</p>
    <h2>The office app</h2>
    <p>Post-processing for the flights and sessions where you logged raw data rather than working in real time.</p>
  </div>
  ${numbered([
    { h: 'Import', p: 'Raw observations from the rover and base, converted to RINEX.' },
    { h: 'Process', p: 'Static and kinematic PPK, powered by RTKLIB — a proven engine rather than one we invented.' },
    { h: 'Inspect', p: 'Fix, float and single shown per epoch, with ambiguity ratio and fix percentage. No hiding a bad solution behind a green tick.' },
    { h: 'Report', p: 'An exportable quality report you can hand to a client — the thing the nearest comparable tool does not give you.' },
    { h: 'Export', p: 'Corrected positions, geotags, and the coordinate reference system your deliverable requires.' },
  ])}
  <p style="color:var(--muted);font-size:var(--step--1);margin-top:26px">Aerom Studio is in development and is not yet in users' hands. It is listed here because it is part of the system you would be buying into, not because you can download it today.</p>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Where we draw the line</p>
    <h2>Free tier and Pro tier</h2>
  </div>
  <div class="grid grid-2">
    <div class="card">
      <h3>Ships with every receiver</h3>
      <p style="margin-bottom:14px">Everything you need to complete a survey.</p>
      <ul class="gate__list">
        <li>Base and rover setup</li><li>NTRIP corrections</li><li>Point collection, codes, attributes, photos</li>
        <li>Stakeout</li><li>Standard exports</li><li>Offline operation</li>
      </ul>
    </div>
    <div class="card" style="border-color:var(--brand)">
      <h3>Aerom Pro</h3>
      <p style="margin-bottom:14px">The office half of the workflow.</p>
      <ul class="gate__list">
        <li>PPK post-processing in Aerom Studio</li><li>Exportable quality reports</li>
        <li>Cloud sync between field and office</li><li>CAD import</li>
        <li>Government deliverable formats</li><li>Advanced stakeout and reporting</li>
      </ul>
      <p style="color:var(--muted);font-size:var(--step--1);margin-top:16px">Priced below the comparable Emlid tier. Figures are on the price sheet.</p>
    </div>
  </div>
</div></section>

${faqBlock(faqs, 'About the software')}

${ctaBand({ heading: 'See the software on real data', body: 'We will walk you through the field app and, where relevant, process one of your own logs so you can judge it against work you already know the answer to.' })}
`;

  return {
    url: '/software/',
    title: 'Aerom Capture & Studio — RTK Field App and PPK Software',
    description: 'Aerom Capture is the Android RTK field app: collect, stake out, export, offline. Aerom Studio is desktop PPK post-processing with an exportable quality report.',
    body,
    schema: [breadcrumbSchema(trail), faqSchema(faqs)],
  };
}
