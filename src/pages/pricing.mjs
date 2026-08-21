import { crumb, breadcrumbSchema, faqBlock, faqSchema } from '../templates/blocks.mjs';
import { leadForm } from '../templates/blocks.mjs';

/**
 * The gated price page.
 *
 * This page is deliberately built to RANK for price intent while not publishing
 * a number. That is not a trick: the price genuinely is still moving, and the
 * right configuration differs by buyer. The page answers everything around the
 * question honestly, and the number itself is what you get for a 30-second form.
 */

const faqs = [
  { q: 'Why do you not publish the price?', a: 'Two honest reasons. Aerom is pre-production, so the number is still moving as we finalise the build and the bill of materials — publishing a figure we then have to change would be worse than not publishing one. And the right configuration genuinely differs: a drone operator usually needs a base, a survey firm usually needs a rover and a base, an institution buying twenty units is a different conversation again. Ask and you get current figures the same working day.' },
  { q: 'Roughly where does it sit?', a: 'Well below imported premium receivers, which land at ₹15–25 lakh in India, and below the Chinese-origin units that sell here at ₹3–8 lakh. We are not trying to be the cheapest thing on the market — that is a race we would lose to Shenzhen scale, and it usually means cutting the software and support that make the instrument worth owning.' },
  { q: 'What drives the cost of an RTK GNSS receiver?', a: 'Mostly four things: the receiver module itself and how many frequency bands and constellations it tracks; the antenna, whose phase-centre stability is what accuracy actually rests on; the enclosure, power and environmental engineering; and the software and support wrapped around it. On imported units, customs duty and the dealer margin add a substantial layer on top — which is a large part of why a domestically built receiver can cost meaningfully less at the same accuracy class.' },
  { q: 'Is there a software subscription?', a: 'Basic software ships with the receiver at no extra cost — connect, base and rover setup, corrections, collection, stakeout and standard exports. A paid Pro tier adds post-processing, cloud sync, CAD import, government deliverable formats and advanced reporting. Pro pricing is on the price sheet, and it is set below the roughly ₹21,000 per user per year that Emlid charges for the comparable tier.' },
  { q: 'Do you offer institutional or bulk pricing?', a: 'Yes. Programmes buying multiple units, and universities and research groups, are handled separately. Say so in the form and we will send terms for that rather than single-unit pricing.' },
  { q: 'Can I buy one today?', a: 'Not yet — Aerom is in its pilot programme, placing units with users who will run them on real jobs and tell us what breaks. The price sheet includes when general availability is expected.' },
];

export default function pricing() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Pricing', href: '/pricing/' }];

  const body = `
${crumb(trail)}

<section class="section"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Pricing</p>
    <h1>What does a survey-grade RTK GNSS receiver cost?</h1>
    <p>The short version: far less than the ₹15–25 lakh you were quoted for an imported premium unit, and less than the ₹3–8 lakh Chinese-origin receivers sell for in India. The exact figure depends on your configuration — here is how to get it.</p>
  </div>

  <div class="gate">
    <div class="gate__teaser">
      <p class="eyebrow">Aerom, complete system</p>
      <p class="gate__blur" aria-hidden="true">₹0,00,000</p>
      <p style="color:var(--text-2);margin-top:12px">Sent to you the same working day.</p>
      <ul class="gate__list">
        <li>Rover, base station and complete-system pricing</li>
        <li>Aerom Pro subscription pricing</li>
        <li>Full specification sheet</li>
        <li>Institutional and multi-unit terms</li>
        <li>Expected general availability</li>
      </ul>
      <p style="color:var(--muted);font-size:var(--step--1);margin-top:22px">One email from us with the numbers. You are not joining a mailing list.</p>
    </div>
    <div class="formcard">
      ${leadForm({
        id: 'price',
        intent: 'price_sheet',
        heading: 'Get the Aerom price sheet',
        sub: 'Thirty seconds. We send current pricing, the full specification, and availability.',
        cta: 'Send me the price sheet',
      })}
    </div>
  </div>
</div></section>

<section class="section section--alt"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Context</p>
    <h2>What the Indian market actually charges</h2>
    <p>So you can judge our number against something real when it arrives.</p>
  </div>
  <div class="cmp-scroll"><table class="cmp">
    <thead><tr>
      <th scope="col">Class</th><th scope="col">Typical India price</th>
      <th scope="col">Horizontal RTK</th><th scope="col">What you are paying for</th>
    </tr></thead>
    <tbody>
      <tr><th scope="row">Premium imported<br><span class="mono" style="color:var(--muted)">Trimble, Leica, Topcon</span></th>
        <td>₹15–25 L</td><td>~8 mm + 1 ppm</td><td>Brand, dealer network, correction services, ruggedisation, decades of field record</td></tr>
      <tr><th scope="row">Chinese volume<br><span class="mono" style="color:var(--muted)">CHC, Hi-Target, South</span></th>
        <td>₹3–8 L</td><td>~8 mm + 1 ppm</td><td>Scale manufacturing, local dealers, improving software</td></tr>
      <tr><th scope="row">Disruptor<br><span class="mono" style="color:var(--muted)">Emlid Reach</span></th>
        <td>~₹2 L</td><td>~7 mm + 1 ppm</td><td>Strong software, small footprint, support from Europe</td></tr>
      <tr><th scope="row" style="color:var(--text)">Aerom</th>
        <td class="is-us">On request</td><td class="is-us">~1 cm demonstrated</td>
        <td class="is-us">Built in India, direct support, Indian workflows, no import duty layer</td></tr>
    </tbody>
  </table></div>
  <p class="cmp-note">Indicative Indian street prices, verified August 2026. Accuracy figures are the manufacturers' published RTK specifications; ours is a demonstrated result on our own hardware under good sky view, not an all-conditions specification. We do not claim better accuracy than the incumbents — nobody in this market meaningfully does.</p>
</div></section>

${faqBlock(faqs, 'About pricing')}
`;

  return {
    url: '/pricing/',
    title: 'RTK GNSS Receiver Price in India — What It Costs | Aerom',
    description: 'What a survey-grade RTK GNSS receiver costs in India, what drives the price, and how Aerom compares to Trimble, CHC and Emlid. Request the Aerom price sheet.',
    body,
    schema: [breadcrumbSchema(trail), faqSchema(faqs)],
  };
}
