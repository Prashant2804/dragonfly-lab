import { crumb, breadcrumbSchema, faqBlock, faqSchema, ctaBand, compareTable, cards } from '../templates/blocks.mjs';
import { competitors, verifiedOn } from '../data/compare.mjs';

const faqs = [
  { q: 'Is Aerom more accurate than Trimble or Leica?', a: 'No, and anyone telling you their receiver is meaningfully more accurate than a Trimble is selling you something. Published RTK accuracy across this market sits around 7–8 mm + 1 ppm horizontal. Aerom has demonstrated approximately 1 cm on its own hardware, which puts it in the same class. The differences that decide a purchase are price, procurement eligibility, support, and whether the software fits the way you work.' },
  { q: 'What is the best alternative to Emlid Reach in India?', a: 'Emlid is the closest thing to a philosophical peer we have — affordable, software-forward, well regarded. The case for Aerom over Emlid in India is specific: built domestically, so eligible where indigenous content is required; supported in your time zone and language; and built around Indian coordinate systems and deliverable formats rather than a generic international export. Emlid has the stronger track record today and ships tilt compensation, which we do not.' },
  { q: 'Why not just buy a CHC or Hi-Target receiver?', a: 'Plenty of Indian surveyors do, and they are decent instruments — those vendors proved this market exists. Two things push the other way. In government, defence-adjacent and drone procurement, indigenous-content requirements increasingly rule them out. And support at distance, plus software built for a different market, is a real cost that does not show up on the quote. We are not going to win on price against Shenzhen scale, and we do not try to.' },
  { q: 'What does Aerom not do yet?', a: 'Tilt compensation is not shipped — you level the pole. NavIC is on the roadmap, not in your hands. Aerom Studio, the desktop post-processing app, is in development. Environmental sealing is not yet certified. And we have not published FIX consistency figures under canopy or dense urban multipath, because we have not finished validating them. That is the honest list.' },
];

export default function compare() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Compare', href: '/compare/' }];

  const tiers = [
    { h: 'Premium incumbents', p: `${competitors.premium.name} and Topcon. Together they hold the majority of high-precision revenue. Their moat is genuine: dealer networks, correction services, software ecosystems, ruggedness proven over decades. Their weakness is that they are priced for a small fraction of the people who need this accuracy.` },
    { h: 'Chinese volume leaders', p: `${competitors.chinese.name} and South Surveying. These are the real competitor by volume — tens of thousands of units a year, sold across Asia at 30–50% below Western prices. They proved a large low-cost market exists. In India they are the cost-conscious surveyor's default today.` },
    { h: 'The disruptor', p: `${competitors.emlid.name}. Cyprus-based, crowdfunding origin, strong software. The closest peer to what we are trying to be, and small by volume compared with the Chinese vendors. Where they are weak is that nothing about them is built for India specifically.` },
    { h: 'Us', p: 'Early, unproven in the field compared with any of the above, and built domestically. The bet is that in India, a receiver that is built here, supported here and shaped around how work is actually delivered here beats a slightly more established one that is none of those things.' },
  ];

  const body = `
${crumb(trail)}

<section class="section section--tight"><div class="wrap">
  <p class="eyebrow">Comparison</p>
  <h1>The market, drawn honestly.</h1>
  <p class="lede" style="margin-top:18px">Including the parts that do not flatter us. A comparison table where one company wins every row is a marketing asset, not information — and every surveyor reading it knows that.</p>
</div></section>

<section class="section section--tight"><div class="wrap">
  ${compareTable()}
</div></section>

<section class="section section--alt"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Four tiers</p>
    <h2>Who is actually in this market</h2>
    <p>Most comparisons pit one product against one rival. That is not what the market looks like from inside it.</p>
  </div>
  ${cards(tiers)}
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">The uncomfortable part</p>
    <h2>Where Aerom loses today</h2>
  </div>
  <div class="grid grid-2">
    <div class="card"><h3>Tilt compensation</h3><p>Shipped by Trimble, Leica, CHC and Emlid. Not by us. You level the pole. It is on the roadmap and being done properly — the inertial sensor has to be rigid with the antenna, not with a phone in a cradle — but today it is a gap and it is a real one.</p></div>
    <div class="card"><h3>Track record</h3><p>Trimble has decades of field history. We have a demonstrated 1 cm fix, a pilot programme and a small team. If your purchase decision requires a proven ten-year record, that is a reasonable requirement and we do not meet it yet.</p></div>
    <div class="card"><h3>Correction network</h3><p>The incumbents run global correction services. We do not. You use your own base, a commercial NTRIP service, or a CORS network.</p></div>
    <div class="card"><h3>Certified ruggedness</h3><p>MIL-STD and IP ratings on premium units are tested and certified. Our environmental sealing is part of the production build and not yet certified, and we will not quote a number we have not tested to.</p></div>
  </div>
</div></section>

<section class="section section--alt"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">The case for us</p>
    <h2>Where Aerom wins</h2>
  </div>
  ${cards([
    { h: 'Price, at the same accuracy class', p: 'The accuracy is comparable across this entire market. The prices are not. That gap is the whole opening.' },
    { h: 'Procurement eligibility', p: 'Indian government drone and survey procurement increasingly requires indigenous content. A domestically built receiver is eligible where imported ones are not.' },
    { h: 'Support that is actually reachable', p: 'Same country, same working day, same language. When a site is stalled this outranks every specification on the sheet.' },
    { h: 'Indian workflows as a first-class concern', p: 'Coordinate systems, datums and deliverable formats built for Indian work rather than adapted from a generic international export.' },
  ])}
  <p class="cmp-note" style="margin-top:28px">All competitor figures verified ${verifiedOn} from manufacturers' published specifications and indicative Indian street prices. If you believe anything on this page is out of date or unfair to a competitor, tell us and we will correct it — an inaccurate comparison damages us more than it damages them.</p>
</div></section>

${faqBlock(faqs, 'The questions behind the table')}

${ctaBand({ heading: 'Judge it against what you already use', body: 'The most useful demo is on a site you know, against control you have already measured. Tell us what you run today and we will arrange exactly that.' })}
`;

  return {
    url: '/compare/',
    title: 'Aerom vs Trimble, CHC and Emlid — Honest Comparison',
    description: 'How Aerom compares to Trimble, Leica, CHC, Hi-Target and Emlid Reach on accuracy, India price, support and procurement — including where Aerom currently loses.',
    body,
    schema: [breadcrumbSchema(trail), faqSchema(faqs)],
  };
}
