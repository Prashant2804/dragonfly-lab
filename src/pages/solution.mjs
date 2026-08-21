import { esc } from '../templates/layout.mjs';
import {
  compareTable, faqBlock, faqSchema, ctaBand, cards, numbered, specList,
  crumb, breadcrumbSchema, router,
} from '../templates/blocks.mjs';
import { compareSets } from '../data/compare.mjs';
import { buyingBlock, buyingFaqs } from '../templates/blocks.mjs';

// Each use case gets its own hero subject, so the four pages are visually
// distinguishable and each one shows the configuration that buyer would order.
const HERO = {
  drone:        { img: 'drone-hero', cls: 'hero__stage--wide', w: 1100, h: 900,
                  alt: 'The Aerom module mounted on a survey drone: quadcopter airframe carrying the receiver, gateway and antenna stack.' },
  survey:       { img: 'rover-hero', cls: '', w: 900, h: 1180,
                  alt: 'The Aerom rover: a 2-metre telescoping survey pole with a marked ARP datum, swappable battery module, gateway enclosure and GNSS antenna.' },
  construction: { img: 'base-hero',  cls: '', w: 900, h: 1180,
                  alt: 'The Aerom base station on a survey tripod, feeding RTK corrections to a site crew.' },
  government:   { img: 'base-hero',  cls: '', w: 900, h: 1180,
                  alt: 'The Aerom base station on a survey tripod with levelling tribrach and ground-plane antenna.' },
};

export default function solutionPage(s) {
  const url = `/solutions/${s.slug}/`;
  const trail = [
    { name: 'Home', href: '/' },
    { name: 'Solutions', href: '/solutions/' },
    { name: s.navLabel, href: url },
  ];

  const body = `
${crumb(trail)}

<section class="hero"><div class="wrap">
  <div class="hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">${esc(s.hero.eyebrow)}</p>
      <h1>${esc(s.hero.h1)}</h1>
      <p class="lede">${esc(s.hero.sub)}</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="#contact">Request a demo<span class="btn__arrow">→</span></a>
        <a class="btn btn--ghost btn--lg" href="/pricing/">Get the price sheet</a>
      </div>
    </div>
    <div class="hero__stage ${HERO[s.id].cls}">
      <img src="/img/${HERO[s.id].img}.png" width="${HERO[s.id].w}" height="${HERO[s.id].h}" alt="${esc(HERO[s.id].alt)}" fetchpriority="high" decoding="async">
      ${s.id === 'survey' ? '<div class="dim" aria-hidden="true"><i></i><span>2.00 m</span><i></i></div>' : ''}
    </div>
  </div>
</div></section>

<nav class="subnav" data-subnav aria-label="On this page"><div class="wrap subnav__in">
  <a href="#problem">The problem</a>
  <a href="#workflow">Workflow</a>
  <a href="#features">What you get</a>
  <a href="#specs">Specs</a>
  <a href="#compare">Comparison</a>
  <a href="#buying">Buying &amp; support</a>
  <a href="#contact">Talk to us</a>
</div></nav>

<section class="section" id="problem"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">The problem</p>
    <h2>Your day today</h2>
  </div>
  ${cards(s.pains)}
</div></section>

<section class="section section--alt" id="workflow"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">The workflow</p>
    <h2>How the job runs with Aerom</h2>
  </div>
  ${numbered(s.workflow)}
  <p style="margin-top:34px;display:flex;flex-wrap:wrap;gap:12px;align-items:center">
    <a class="btn btn--ghost" href="/pricing/">Skip ahead — get the price sheet<span class="btn__arrow">→</span></a>
    <span style="color:var(--muted);font-size:var(--step--1)">One email, same working day.</span>
  </p>
</div></section>

<section class="section" id="features"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">What you get</p>
    <h2>Built around this job, not a generic feature list</h2>
  </div>
  ${cards(s.features)}
</div></section>

<section class="section section--alt" id="specs"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Specifications</p>
    <h2>The numbers that matter here</h2>
    <p>The full specification sheet goes out with the price sheet — these are the lines that decide this particular job.</p>
  </div>
  ${specList(s.specs)}
</div></section>

<section class="section" id="compare"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Comparison</p>
    <h2>How Aerom stacks up for ${esc(s.navLabel.toLowerCase())}</h2>
    <p>Accuracy is broadly the same across this market. We have put the differences that actually decide a purchase side by side, including the one where we currently lose.</p>
  </div>
  ${compareTable(compareSets[s.id])}
</div></section>

${buyingBlock({ box: s.id === 'drone' ? 'base' : 'rover' })}

${faqBlock([...s.faq, ...buyingFaqs])}

${ctaBand({
    heading: `Talk to us about ${s.navLabel.toLowerCase()}`,
    body: s.id === 'government'
      ? 'Aerom is in its pilot programme. Tell us about the programme, the tender requirement or the research application and we will send documentation and arrange a demonstration.'
      : 'Aerom is in its pilot programme. Tell us about your work and we will arrange a demo, answer specification questions, and send the price sheet.',
    useCase: s.id,
    intent: 'demo',
    cta: s.id === 'government' ? 'Request documentation' : 'Request a demo',
  })}

${router('Other use cases')}
`;

  return {
    url,
    title: s.seo.title,
    description: s.seo.description,
    bodyClass: 'has-subnav',
    body,
    schema: [breadcrumbSchema(trail), faqSchema([...s.faq, ...buyingFaqs])],
  };
}
