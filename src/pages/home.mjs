import { esc } from '../templates/layout.mjs';
import { router, proofBlock, compareTable, faqBlock, faqSchema, ctaBand, cards } from '../templates/blocks.mjs';

const faqs = [
  { q: 'What exactly is Aerom?', a: 'A complete survey-grade RTK GNSS system: a rover, a base station, an Android field app called Aerom Capture, and a desktop post-processing app called Aerom Studio. It is built around the u-blox ZED-X20P receiver and designed, assembled and supported in India.' },
  { q: 'How accurate is it?', a: 'We have demonstrated approximately 1 cm horizontal and 1 cm vertical RTK on our own hardware, with 12 satellites and a fixed carrier solution. That is the same accuracy class as receivers costing far more — across this market published RTK accuracy sits around 7–8 mm + 1 ppm, and we do not claim to beat it. It is a demonstrated result under good sky view, not an all-conditions specification.' },
  { q: 'What does it cost?', a: 'We do not publish the price, because it is still moving as we finalise the production build and because the right configuration depends on whether you need a rover, a base, or both. Request the price sheet and we will send current figures the same working day.' },
  { q: 'Can I buy one today?', a: 'Not yet. Aerom is in its pilot programme — we are placing units with surveyors, drone operators and institutions who will use them on real jobs and tell us what breaks. If that sounds like you, that is exactly who we want to hear from.' },
  { q: 'Why buy from a new Indian company instead of an established brand?', a: 'For most buyers the honest answer today is: because of price, because it is built in India and therefore eligible where indigenous content is required, and because support is a phone call in your own time zone rather than an email to another continent. If you need a decade of field-proven track record right now, we do not have that yet and will not pretend otherwise.' },
  { q: 'Does it support NavIC?', a: 'NavIC is on our roadmap, not shipping today. We list it as a roadmap item rather than a feature because it is not yet in your hands.' },
];

export default function home() {
  const body = `
<section class="hero"><div class="wrap">
  <div class="hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">Aerom by Dragonfly</p>
      <h1>Survey‑grade RTK.<br>Built in India.</h1>
      <p class="lede">A complete RTK GNSS system — rover, base station, field app and desktop post-processing — designed for Indian surveyors and drone operators, at a price that does not require a finance committee.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="/demo/">Request a demo<span class="btn__arrow">→</span></a>
        <a class="btn btn--ghost btn--lg" href="/product/">See the hardware</a>
      </div>
    </div>
    <div class="hero__stage">
      <img src="/img/base-hero.png" width="900" height="1180" alt="The Aerom base station: a survey tripod with levelling tribrach carrying the receiver, gateway, swappable battery module and a white ground-plane GNSS antenna." fetchpriority="high" decoding="async">
      <div class="dim" aria-hidden="true"><i></i><span>1.44 m</span><i></i></div>
    </div>
  </div>
  <div class="trust">
    <span><span class="dot"></span><b>1 cm RTK FIX</b> demonstrated on our own hardware</span>
    <span><b>u-blox ZED-X20P</b> all-band receiver</span>
    <span><b>Designed &amp; assembled in India</b></span>
    <span><b>NavIC</b> on the roadmap</span>
  </div>
</div></section>

${router('Jump straight to your work')}

<section class="section"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Why this exists</p>
    <h2>Precision positioning in India is priced for the few.</h2>
  </div>
  ${cards([
    { h: 'Priced out', p: 'Imported premium receivers land at ₹15–25 lakh. The surveyors who would use one every single day are exactly the ones who cannot justify it.' },
    { h: 'Imported and unsupported', p: 'When an imported unit misbehaves on site, support is an email to another continent and a wait measured in weeks.' },
    { h: 'Software that ignores India', p: 'Wrong datum, wrong projection, an export the department rejects. The receiver was never the hard part — the workflow was.' },
  ])}
</div></section>

${proofBlock()}

<section class="section section--alt"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">The system</p>
    <h2>Not a board on a stick. A working system.</h2>
    <p>Hardware gets us in the door. The software is what keeps the job moving.</p>
  </div>
  <div class="grid grid-3">
    <a class="card card--visual" href="/product/">
      <img src="/img/rover-front.png" width="700" height="1180" alt="The Aerom rover on its telescoping survey pole." loading="lazy" decoding="async">
      <h3>Rover</h3><p>2.0 m telescoping pole, swappable battery, marked ARP datum, flat phone mount.</p></a>
    <a class="card card--visual" href="/product/">
      <img src="/img/base-front.png" width="900" height="1100" alt="The Aerom base station on a survey tripod." loading="lazy" decoding="async">
      <h3>Base station</h3><p>Set once. Feeds corrections to as many rovers as your crew runs.</p></a>
    <a class="card card--visual" href="/solutions/drone-mapping/">
      <img src="/img/drone-front.png" width="1100" height="760" alt="The Aerom module mounted on a survey drone." loading="lazy" decoding="async">
      <h3>On the drone</h3><p>The same receiver and gateway, mounted on the airframe for RTK and PPK mapping.</p></a>
  </div>
  <div class="grid grid-2" style="margin-top:20px">
    <a class="card" href="/software/"><h3>Aerom Capture</h3><p>Android field app: connect, collect, stake out, export — fix state in plain language, works offline.</p></a>
    <a class="card" href="/software/"><h3>Aerom Studio</h3><p>Desktop PPK post-processing, with an exportable quality report you can hand to a client.</p></a>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Where we compete</p>
    <h2>Everyone hits about a centimetre. The difference is everything else.</h2>
    <p>Here is the market as honestly as we can draw it, including the row where we currently lose.</p>
  </div>
  ${compareTable()}
  <p style="margin-top:28px"><a class="btn btn--ghost" href="/compare/">The full comparison, with reasoning<span class="btn__arrow">→</span></a></p>
</div></section>

<section class="section section--alt"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">The moat</p>
    <h2>Hardware gets us in. Software and support keep us in.</h2>
  </div>
  ${cards([
    { h: 'Built in India', p: 'Designed and assembled domestically — which matters commercially, and matters again where government procurement requires indigenous content.' },
    { h: 'Support you can actually reach', p: 'Same country, same working day, same language. When a site is stalled, that is the only specification that counts.' },
    { h: 'Indian workflows, natively', p: 'The coordinate systems, datums and deliverable formats Indian survey work actually runs on — not a generic export you have to fix by hand.' },
    { h: 'A trust layer, not just a number', p: 'Fix state in plain English, correction age alongside it, and audit metadata stored against every point you record.' },
    { h: 'NavIC on the roadmap', p: 'Aligned with national positioning infrastructure as it matures.' },
    { h: 'Priced to be bought', p: 'The accuracy class of instruments costing many times more, at a price a working surveyor can actually justify.' },
  ])}
</div></section>

${faqBlock(faqs, 'Straight answers')}

${ctaBand({
    heading: 'Join the pilot programme',
    body: 'We are placing units with surveyors, drone operators and institutions who will use them on real jobs. Tell us what you survey and we will arrange a demo and send the price sheet.',
  })}
`;

  return {
    url: '/',
    title: 'Aerom — Survey-Grade RTK GNSS Receiver, Built in India',
    description: 'Survey-grade RTK GNSS for Indian surveyors and drone operators. Rover, base, field app and PPK software. 1 cm demonstrated, built in India.',
    body,
    schema: [faqSchema(faqs)],
  };
}
