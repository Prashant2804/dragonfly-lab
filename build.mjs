/**
 * Static site build.
 *
 * Reads the page modules, renders them through the shared layout, and writes
 * plain HTML into /public. No client-side routing, no hydration, no framework
 * runtime — every page is a complete HTML document the crawler sees instantly.
 */
import { mkdir, writeFile, cp, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { layout } from './src/templates/layout.mjs';
import { site } from './src/data/site.mjs';
import { solutions } from './src/data/solutions.mjs';

import home from './src/pages/home.mjs';
import solutionPage from './src/pages/solution.mjs';
import product from './src/pages/product.mjs';
import pricing from './src/pages/pricing.mjs';
import software from './src/pages/software.mjs';
import compare from './src/pages/compare.mjs';
import company from './src/pages/company.mjs';
import { demo, solutionsIndex, notFound } from './src/pages/simple.mjs';
import { privacy, terms } from './src/pages/legal.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(root, 'public');

const pages = [
  home(),
  solutionsIndex(),
  ...solutions.map(solutionPage),
  product(),
  software(),
  compare(),
  pricing(),
  company(),
  demo(),
  privacy(),
  terms(),
  notFound(),
];

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
<rect width="24" height="24" fill="#0B0D0F"/>
<path d="M12 3 L14.2 9.8 L21 12 L14.2 14.2 L12 21 L9.8 14.2 L3 12 L9.8 9.8 Z" fill="#E65C20"/>
<circle cx="12" cy="12" r="1.9" fill="#0B0D0F"/></svg>`;

async function copyVendor() {
  // three.js is vendored so the site has zero third-party runtime dependencies
  const candidates = [
    path.join(root, 'node_modules/three'),
    path.join(root, '../node_modules/three'),
    path.join(root, '../cad/node_modules/three'),
  ];
  const three = candidates.find((c) => existsSync(c));
  if (!three) { console.warn('  ! three.js not found — the 3D viewer will not load'); return; }

  const dst = path.join(OUT, 'vendor/three');
  await mkdir(path.join(dst, 'addons/loaders'), { recursive: true });
  await mkdir(path.join(dst, 'addons/controls'), { recursive: true });
  await mkdir(path.join(dst, 'addons/utils'), { recursive: true });

  const files = [
    ['build/three.module.js', 'three.module.js'],
    ['build/three.core.js', 'three.core.js'],
    ['examples/jsm/loaders/GLTFLoader.js', 'addons/loaders/GLTFLoader.js'],
    ['examples/jsm/controls/OrbitControls.js', 'addons/controls/OrbitControls.js'],
    ['examples/jsm/utils/BufferGeometryUtils.js', 'addons/utils/BufferGeometryUtils.js'],
    ['examples/jsm/utils/SkeletonUtils.js', 'addons/utils/SkeletonUtils.js'],
  ];
  for (const [from, to] of files) {
    const src = path.join(three, from);
    if (!existsSync(src)) { console.warn(`  ! missing ${from}`); continue; }
    let code = await readFile(src, 'utf8');
    // rewrite bare specifiers to real paths so no import map is required
    code = code
      .replace(/from ['"]three['"]/g, `from '/vendor/three/three.module.js'`)
      .replace(/from ['"]\.\.\/utils\/([\w.]+)['"]/g, `from '/vendor/three/addons/utils/$1'`)
      .replace(/from ['"]\.\/three\.core\.js['"]/g, `from '/vendor/three/three.core.js'`);
    await writeFile(path.join(dst, to), code);
  }
}

/**
 * Content-Security-Policy, with a hash allow-list instead of 'unsafe-inline'.
 *
 * A static site cannot use nonces (there is no server generating a fresh value
 * per request), so the strong option is hashes. We know every inline script at
 * build time — the JSON-LD block and, if configured, the GA4/Clarity snippets —
 * so we hash each one and name it explicitly. Nothing else executes.
 *
 * script-src therefore contains NO 'unsafe-inline'. An injected <script> cannot
 * run even if an attacker manages to get one into the page.
 *
 * style-src does allow 'unsafe-inline', because the pages use inline style
 * attributes for one-off layout tweaks. That is a real but small concession:
 * CSS injection cannot execute code, and the alternative is several hundred
 * single-use utility classes. Worth revisiting if the site grows.
 *
 * frame-ancestors is NOT set here — it is ignored in a meta tag — so it lives
 * in vercel.json alongside the other response headers.
 */
function withCsp(html) {
  const hashes = [];
  const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    const digest = createHash('sha256').update(m[1], 'utf8').digest('base64');
    hashes.push(`'sha256-${digest}'`);
  }

  const policy = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `form-action 'self'`,
    `script-src 'self' ${[...new Set(hashes)].join(' ')} https://analytics.ahrefs.com https://www.googletagmanager.com https://www.clarity.ms`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `connect-src 'self' https://analytics.ahrefs.com https://*.google-analytics.com https://*.clarity.ms`,
    `media-src 'self'`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `frame-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  return html.replace('<!--CSP-->',
    `<meta http-equiv="Content-Security-Policy" content="${policy}">`);
}

function sitemap(urls) {
  const today = new Date().toISOString().slice(0, 10);
  const body = urls.map((u) => {
    const priority = u === '/' ? '1.0'
      : ['/pricing/', '/product/'].includes(u) ? '0.9'
      : u.startsWith('/solutions/') ? '0.8' : '0.7';
    return `  <url>
    <loc>${site.domain}${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u === '/company/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

async function build() {
  console.log('\nBuilding dragonflylab.in\n');
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  // static assets
  await cp(path.join(root, 'src/assets/styles.css'), path.join(OUT, 'styles.css'));
  await cp(path.join(root, 'src/assets/app.js'), path.join(OUT, 'app.js'));
  await cp(path.join(root, 'src/assets/viewer.js'), path.join(OUT, 'viewer.js'));
  if (existsSync(path.join(root, 'static'))) {
    await cp(path.join(root, 'static'), OUT, { recursive: true });
  }
  await writeFile(path.join(OUT, 'favicon.svg'), FAVICON);
  await copyVendor();

  const indexed = [];
  for (const p of pages) {
    const html = withCsp(layout(p));
    const file = p.outFile || path.join(p.url.replace(/^\/|\/$/g, ''), 'index.html');
    const dest = path.join(OUT, file);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, html);
    if (!p.noindex) indexed.push(p.url);
    const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
    console.log(`  ${p.url.padEnd(38)} ${String(kb).padStart(6)} KB   ${p.title.length} char title`);
  }

  await writeFile(path.join(OUT, 'sitemap.xml'), sitemap(indexed));
  await writeFile(path.join(OUT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`);

  console.log(`\n  ${indexed.length} indexable pages + 404, sitemap and robots written to /public\n`);
}

build().catch((e) => { console.error(e); process.exit(1); });
