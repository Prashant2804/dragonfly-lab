import { esc } from '../templates/layout.mjs';
import { crumb, breadcrumbSchema, leadForm, router } from '../templates/blocks.mjs';
import { site } from '../data/site.mjs';
import { solutions } from '../data/solutions.mjs';

/* ------------------------- /demo/ ------------------------- */
export function demo() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Request a demo', href: '/demo/' }];
  const body = `
${crumb(trail)}
<section class="section"><div class="wrap">
  <div class="gate">
    <div>
      <p class="eyebrow">Pilot programme</p>
      <h1>Request a demo</h1>
      <div class="stack" style="margin-top:20px;color:var(--text-2);max-width:46ch">
        <p>Aerom is not yet generally available. We are placing units with surveyors, drone operators and institutions who will run them on real jobs and tell us honestly what works and what does not.</p>
        <p>Tell us what you survey and we will arrange a demonstration, answer specification questions directly, and send the price sheet.</p>
      </div>
      <div style="margin-top:32px;border-top:1px solid var(--line);padding-top:24px">
        <h2 style="font-size:var(--step-1)">What happens next</h2>
        <ul class="gate__list" style="margin-top:14px">
          <li>We reply within one working day, usually faster</li>
          <li>A short call to understand the work you do</li>
          <li>A demonstration — ideally on a site you already have control on</li>
          <li>Price sheet and full specification</li>
        </ul>
      </div>
      <p style="color:var(--muted);font-size:var(--step--1);margin-top:26px">Or email <a href="mailto:${esc(site.email)}" style="color:var(--brand)">${esc(site.email)}</a> directly.</p>
    </div>
    <div class="formcard">${leadForm({ id: 'demo', intent: 'demo', cta: 'Request a demo' })}</div>
  </div>
</div></section>`;

  return {
    url: '/demo/',
    title: 'Request an Aerom Demo — Join the Pilot Programme',
    description: 'Request a demonstration of the Aerom RTK GNSS system. We reply within one working day with a demo, specifications and current pricing.',
    body,
    schema: [breadcrumbSchema(trail)],
  };
}

/* ------------------------- /solutions/ ------------------------- */
export function solutionsIndex() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Solutions', href: '/solutions/' }];
  const cards = solutions.map(s => `
    <a class="card" href="/solutions/${s.slug}/">
      <p class="eyebrow" style="margin-bottom:8px">${esc(s.hero.eyebrow)}</p>
      <h3>${esc(s.hero.h1)}</h3>
      <p style="margin-top:10px">${esc(s.hero.sub)}</p>
      <p style="color:var(--brand);font-family:var(--mono);font-size:var(--step--1);margin-top:16px">Read more →</p>
    </a>`).join('');

  const body = `
${crumb(trail)}
<section class="section section--tight"><div class="wrap">
  <p class="eyebrow">Solutions</p>
  <h1>Pick the work you actually do.</h1>
  <p class="lede" style="margin-top:18px">The same system, described in the terms of your job — with a comparison at the bottom of each page against the instruments you are actually choosing between.</p>
</div></section>
<section class="section section--tight"><div class="wrap">
  <div class="grid grid-2">${cards}</div>
</div></section>`;

  return {
    url: '/solutions/',
    title: 'RTK GNSS for Surveying, Drone Mapping & Construction | Aerom',
    description: 'Aerom RTK GNSS for land surveying, drone and UAV mapping, construction and infrastructure, and government or institutional survey programmes.',
    body,
    schema: [breadcrumbSchema(trail)],
  };
}

/* ------------------------- 404 ------------------------- */
export function notFound() {
  const body = `
<section class="section"><div class="wrap" style="max-width:640px">
  <p class="eyebrow">404</p>
  <h1>That page is not here.</h1>
  <p class="lede" style="margin-top:18px">It may have moved, or it may never have existed. Either way, here is where most people are going.</p>
</div></section>
${router('Try one of these')}
<section class="section section--tight"><div class="wrap">
  <a class="btn btn--primary btn--lg" href="/">Back to the homepage<span class="btn__arrow">→</span></a>
</div></section>`;

  return {
    url: '/404/',
    outFile: '404.html',
    title: 'Page not found | Aerom',
    description: 'That page could not be found.',
    noindex: true,
    body,
  };
}
