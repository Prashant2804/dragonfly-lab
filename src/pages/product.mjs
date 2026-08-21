import { esc } from '../templates/layout.mjs';
import { crumb, breadcrumbSchema, faqBlock, faqSchema, ctaBand, specList, cards } from '../templates/blocks.mjs';
import { site } from '../data/site.mjs';
import { buyingBlock, buyingFaqs } from '../templates/blocks.mjs';

const faqs = [
  { q: 'How tall is the rover?', a: 'Two metres fully extended, on a telescoping pole that collapses to roughly a quarter of that for transport. The antenna reference point is marked on the pole so antenna height is a value you read, not a value you estimate.' },
  { q: 'Why a swappable battery?', a: 'Because a sealed battery that dies at 2pm costs you the afternoon. The battery is its own module between the pole and the gateway enclosure, so you carry a spare and change it in the field. It also let us keep the pole free to collapse, which a pole full of cells cannot do.' },
  { q: 'What is the Raspberry Pi doing in there?', a: 'It is the gateway: it reads the receiver over serial, streams telemetry to the field app over WebSocket, and relays RTCM corrections in both directions. Keeping that on a general-purpose computer rather than a fixed microcontroller is what lets the software side move quickly.' },
  { q: 'Is it weatherproof?', a: 'Environmental sealing and an ingress rating are part of the production build, not yet certified. We would rather tell you that than quote an IP number we have not tested to. It is one of the things the pilot programme exists to prove.' },
  { q: 'Can I use my own antenna or pole?', a: 'The pole uses a standard survey thread interface, so yes on the pole. On the antenna, the phase-centre offset is what the accuracy claim depends on, so a swap needs the replacement antenna\'s characterised offset entered in software. Talk to us before you do it.' },
];

const HOTSPOTS = [
  { id: 'antenna',  part: 'antenna',     title: 'GNSS antenna',        text: 'Sealed cylindrical radome over the antenna element. Its phase-centre offset is what the centimetre-level claim ultimately rests on, so it is characterised and stored in software rather than assumed.' },
  { id: 'pi',       part: 'gateway',             title: 'Gateway enclosure',   text: 'Raspberry Pi Zero 2 W and the u-blox ZED-X20P receiver, with a finned heatsink shell. Reads the receiver, streams telemetry to the field app, relays RTCM corrections.' },
  { id: 'battery',  part: 'battery_module', title: 'Swappable battery',   text: 'Its own module with a release ring and a four-segment charge indicator. Change packs mid-shift instead of losing the afternoon.' },
  { id: 'arp',      part: 'pole_collars',        title: 'ARP datum marker',    text: 'The antenna reference point, physically marked at the top of the pole. Antenna height is measured to a real datum — the single most common source of a whole survey being quietly wrong.' },
  { id: 'pole',     part: 'pole_mid',               title: 'Telescoping pole',    text: 'Segments with cam-lock collars, collapsing to roughly a quarter of the extended length. Detented hard stops at known heights are in development, because survey repeatability needs the extended height to be a known value.' },
  { id: 'tip',      part: 'survey_tip',               title: 'Survey tip',          text: 'Hardened point. Zero height datum for the whole stack — every offset above it is measured from here.' },
];

export default function product() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Product', href: '/product/' }];

  const chips = HOTSPOTS.map(h =>
    `<button class="chip" type="button" data-focus="${esc(h.part)}" data-hotspot="${esc(h.id)}">${esc(h.title)}</button>`).join('');

  const body = `
${crumb(trail)}

<section class="section section--tight"><div class="wrap">
  <p class="eyebrow">The hardware</p>
  <h1>Three modules, one pole, no mystery box.</h1>
  <p class="lede" style="margin-top:18px">Spin it, take it apart, and look at what is actually inside. This is the real CAD model, not an illustration.</p>
</div></section>

<section class="section section--tight"><div class="wrap">
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:32px;align-items:start">
    <div class="viewer" data-viewer data-models='{"rover":"/models/aerom-rover.glb","base":"/models/aerom-base.glb","drone":"/models/aerom-drone.glb"}'>
      <img class="viewer__poster" src="/img/rover-hero.png" width="900" height="1180" alt="The Aerom rover, a 2-metre telescoping survey pole carrying a swappable battery module, gateway enclosure and GNSS antenna." decoding="async">
      <p class="viewer__hint" data-viewer-hint>drag to rotate</p>
      <div class="viewer__ui">
        <button class="chip" type="button" data-model-switch="rover" aria-pressed="true">Rover</button>
        <button class="chip" type="button" data-model-switch="base" aria-pressed="false">Base station</button>
        <button class="chip" type="button" data-model-switch="drone" aria-pressed="false">On a drone</button>
        <button class="chip" type="button" data-explode aria-pressed="false">Exploded view</button>
      </div>
    </div>
    <div>
      <h2 style="font-size:var(--step-2)">Look inside</h2>
      <p style="color:var(--text-2);margin-top:14px">Pick a module and the model will take you to it.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:20px">${chips}</div>

      <div style="margin-top:32px" data-hotspot-detail>
        <div class="card">
          <h3>Start anywhere</h3>
          <p>Choose a module above, or drag the model directly. On the base station the tripod, tribrach and antenna behave the same way.</p>
        </div>
      </div>
    </div>
  </div>
  <p style="color:var(--muted);font-size:var(--step--1);margin-top:20px">The 3D model loads only after the page is interactive, and only on devices that can render it — on anything else you get the still image above and nothing is lost.</p>
</div></section>

<section class="section section--alt"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Rover</p>
    <h2>Aerom Rover</h2>
    <p>The unit that walks the site. Two metres extended, collapsing for transport, with the battery as its own swappable module.</p>
  </div>
  ${specList([
    ['Receiver', 'u-blox ZED-X20P, all-band multi-constellation'],
    ['Demonstrated RTK', '~1 cm horizontal, ~1 cm vertical, carrier FIXED'],
    ['Gateway', 'Raspberry Pi Zero 2 W, serial to receiver, WebSocket telemetry'],
    ['Extended height', '2.00 m to the top of the antenna'],
    ['Pole', 'Telescoping segments with cam-lock collars'],
    ['Antenna reference', 'Marked ARP datum at the pole top'],
    ['Power', 'Swappable battery module, 4-segment charge indicator'],
    ['Phone mount', 'Flat cradle, screen facing the operator, clear of the collars'],
    ['Corrections', 'NTRIP client and caster, RTCM3 in and out'],
    ['Environmental rating', 'Not yet certified — production build'],
  ])}
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Base station</p>
    <h2>Aerom Base</h2>
    <p>Set once, feed the whole crew. The same gateway and battery modules as the rover, on a survey tripod with a tribrach.</p>
  </div>
  ${specList([
    ['Receiver', 'u-blox ZED-X20P, all-band multi-constellation'],
    ['Antenna', 'Ground-plane antenna under a sealed radome'],
    ['Mount', 'Survey tripod with levelling tribrach and centring plate'],
    ['Height', '1.44 m at working extension'],
    ['Setup', 'Over a known point, or averaged in fix'],
    ['Corrections out', 'RTCM3 over NTRIP, serial or Wi-Fi'],
    ['Raw logging', 'Full-session raw observations for PPK'],
    ['Rovers supported', 'Multiple rovers from one base'],
    ['Power', 'Same swappable battery module as the rover'],
  ])}
</div></section>

<section class="section section--alt"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Design decisions</p>
    <h2>Why it is shaped like this</h2>
  </div>
  ${cards([
    { h: 'The battery is a module, not a compartment', p: 'Putting cells in the pole would have blocked the pole from collapsing. Making the battery its own module solved both problems at once and made hot-swapping possible.' },
    { h: 'The ARP is physically marked', p: 'Antenna height entered wrong is one of the most common ways a survey goes quietly wrong. A marked datum turns a guess into a reading.' },
    { h: 'The phone sits flat and clear', p: 'Mounted in the middle of a segment, away from every cam collar, with the screen square to the operator. Small decision, all day long.' },
    { h: 'The IMU belongs on the antenna', p: 'Tilt compensation only works if the inertial sensor is rigid with the antenna, not with a phone that moves in its cradle. That is why tilt is a roadmap item done properly rather than a shipped item done badly.' },
  ])}
</div></section>

${buyingBlock({ box: 'rover' })}

${faqBlock([...faqs, ...buyingFaqs], 'About the hardware, and about buying it')}

${ctaBand({ heading: 'Want to hold one?', body: 'Aerom is in its pilot programme. Tell us what you survey and we will arrange a demonstration and send the full specification and price sheet.' })}
`;

  return {
    url: '/product/',
    title: 'Aerom RTK GNSS Rover & Base Station — Specifications',
    description: 'Explore the Aerom rover and base station in 3D. u-blox ZED-X20P receiver, swappable battery, marked ARP datum, 2 m telescoping pole. Full specifications.',
    body,
    schema: [
      breadcrumbSchema(trail),
      faqSchema([...faqs, ...buyingFaqs]),
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Aerom RTK GNSS System',
        brand: { '@type': 'Brand', name: 'Aerom' },
        manufacturer: { '@id': site.domain + '/#org' },
        description: 'Survey-grade RTK GNSS rover and base station built in India, based on the u-blox ZED-X20P receiver.',
        url: site.domain + '/product/',
        category: 'GNSS survey equipment',
      },
    ],
    scripts: `<script type="module" src="/viewer.js"></script>
<script id="hotspot-data" type="application/json">${JSON.stringify(HOTSPOTS)}</script>`,
  };
}
