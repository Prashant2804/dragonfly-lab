import { site, nav, useCases } from '../data/site.mjs';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const abs = (p) => site.domain + p;

const LOGO = `<svg class="logo__mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M12 2 L14.4 9.6 L22 12 L14.4 14.4 L12 22 L9.6 14.4 L2 12 L9.6 9.6 Z" fill="#E65C20"/>
  <circle cx="12" cy="12" r="2.1" fill="#0B0D0F"/></svg>`;

function header(current) {
  const items = nav.map((n) => {
    const active = current === n.href || (n.children && current.startsWith('/solutions/'));
    if (!n.children) {
      return `<a href="${n.href}"${active ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`;
    }
    const mega = n.children.map((c) =>
      `<a href="${c.href}"><strong>${esc(c.label)}</strong><span>${esc(c.blurb)}</span></a>`).join('');
    return `<div class="nav__item" data-nav-item>
      <button type="button" data-nav-toggle aria-expanded="false">${esc(n.label)}
        <svg class="nav__caret" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.2 6 8.2 10 4.2" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
      </button>
      <div class="mega">${mega}</div>
    </div>`;
  }).join('');

  return `<header class="hdr" data-header>
  <div class="wrap hdr__in">
    <a class="logo" href="/" aria-label="${esc(site.company)} home">${LOGO}<span>${esc(site.company)}</span><span class="logo__sub">/ ${esc(site.product)}</span></a>
    <nav class="nav" aria-label="Main">${items}</nav>
    <a class="btn btn--primary hdr__cta" href="/demo/">Request a demo</a>
    <button class="btn btn--ghost burger" type="button" data-burger aria-expanded="false" aria-label="Menu">Menu</button>
  </div>
</header>`;
}

function footer() {
  const sol = nav.find((n) => n.children).children
    .map((c) => `<li><a href="${c.href}">${esc(c.label)}</a></li>`).join('');
  return `<footer class="ftr">
  <div class="wrap">
    <div class="ftr__grid">
      <div>
        <a class="logo" href="/">${LOGO}<span>${esc(site.company)}</span></a>
        <p style="color:var(--muted);font-size:var(--step--1);margin-top:12px;max-width:26ch">${esc(site.tagline)}</p>
      </div>
      <div><h4>Solutions</h4><ul>${sol}</ul></div>
      <div><h4>Product</h4><ul>
        <li><a href="/product/">Hardware</a></li>
        <li><a href="/software/">Software</a></li>
        <li><a href="/compare/">Compare</a></li>
        <li><a href="/pricing/">Pricing</a></li>
      </ul></div>
      <div><h4>Company</h4><ul>
        <li><a href="/company/">About &amp; updates</a></li>
        <li><a href="/demo/">Request a demo</a></li>
        <li><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
      </ul></div>
      <div><h4>Legal</h4><ul>
        <li><a href="/privacy/">Privacy policy</a></li>
        <li><a href="/terms/">Terms of use</a></li>
      </ul></div>
    </div>
    <div class="ftr__base">
      <span>© ${site.founded}–${new Date().getFullYear()} ${esc(site.legalName)}. ${esc(site.city)}.</span>
      <span class="mono">Aerom is a product of ${esc(site.company)}.</span>
    </div>
    <p class="ftr__legal">
      Product specifications are preliminary and subject to change. Accuracy figures described as demonstrated are
      results measured on our own hardware under good sky view, not guaranteed performance specifications.
      Third-party product names and trademarks are the property of their respective owners and are used only for
      identification and comparison; we are not affiliated with or endorsed by any of them.
      See our <a href="/terms/">terms of use</a>.
    </p>
  </div>
</footer>`;
}

/**
 * Two secondary conversion points, both deliberately restrained.
 *
 * The sticky bar is mobile-only and hides itself once the visitor reaches the
 * real form, so there are never two competing calls to action on screen. The
 * corner card appears once, past 55% scroll depth, only if the visitor has not
 * reached a form, and stays dismissed for the session.
 *
 * Neither appears on pages that ARE the conversion — /demo/ and /pricing/ — or
 * on the legal pages, where nudging someone reading a privacy policy would be
 * both annoying and slightly tasteless.
 */
function conversionUi(p) {
  const suppressed = ['/demo/', '/pricing/', '/privacy/', '/terms/', '/404/'];
  if (suppressed.includes(p.url)) return '';

  return `<div class="stickycta" data-sticky-cta aria-hidden="false">
  <a class="btn btn--ghost" href="/pricing/">Price sheet</a>
  <a class="btn btn--primary" href="/demo/">Request a demo</a>
</div>

<aside class="nudge" data-nudge aria-label="Get the price sheet">
  <button class="nudge__close" type="button" data-nudge-close aria-label="Dismiss">&times;</button>
  <h4>Still reading?</h4>
  <p>Most people who get this far want the number. We will send the price sheet and full specification — one email, same working day.</p>
  <a class="btn btn--primary btn--block" href="/pricing/">Get the price sheet<span class="btn__arrow">→</span></a>
</aside>`;
}

/**
 * @param {object} p
 * @param {string} p.url         path with trailing slash, e.g. '/solutions/drone-mapping/'
 * @param {string} p.title       <title> — keep under ~60 chars
 * @param {string} p.description meta description — keep under ~155 chars
 * @param {string} p.body        page HTML
 * @param {object[]} [p.schema]  extra JSON-LD objects
 * @param {string} [p.bodyClass]
 * @param {boolean} [p.noindex]
 */
export function layout(p) {
  const canonical = abs(p.url);
  const ogImage = abs('/img/og-default.png');

  const baseSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': abs('/#org'),
      name: site.legalName,
      url: site.domain,
      email: site.email,
      slogan: site.tagline,
      foundingDate: String(site.founded),
      address: { '@type': 'PostalAddress', addressLocality: 'New Delhi', addressCountry: 'IN' },
      brand: { '@type': 'Brand', name: site.product },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': abs('/#website'),
      url: site.domain,
      name: `${site.company} — ${site.product}`,
      publisher: { '@id': abs('/#org') },
      inLanguage: 'en-IN',
    },
  ];
  const schema = [...baseSchema, ...(p.schema || [])];

  const analytics = [
    site.ahrefsKey
      ? `<script src="https://analytics.ahrefs.com/analytics.js" data-key="${esc(site.ahrefsKey)}" async></script>`
      : '',
    site.ga4Id
      ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.ga4Id)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(site.ga4Id)}')</script>`
      : '',
    site.clarityId
      ? `<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${esc(site.clarityId)}")</script>`
      : '',
  ].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${canonical}">
${p.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">'}
<meta name="theme-color" content="#0B0D0F">
<link rel="alternate" hreflang="en" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.company)} — ${esc(site.product)}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${ogImage}">

<!--CSP-->
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
${analytics}
</head>
<body${p.bodyClass ? ` class="${p.bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
${header(p.url)}
<main id="main">
${p.body}
</main>
${conversionUi(p)}
${footer()}
<script src="/app.js" defer></script>
${p.scripts || ''}
</body>
</html>`;
}

export { useCases };
