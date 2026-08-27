/**
 * Pre-deploy verification.
 *
 * Renders every built page in a real browser and asserts the things that
 * silently break SEO or the lead flow:
 *   - no console errors or failed requests
 *   - exactly one <h1>, a title, a description, a canonical
 *   - valid JSON-LD
 *   - every internal link resolves to a real page
 *   - every <img> has alt text and explicit dimensions (stops layout shift)
 *   - the lead API validates and rejects spam
 *
 * Exits non-zero if anything fails, so it can gate a deploy.
 *
 *   npm run check
 */
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4173;
const base = `http://127.0.0.1:${PORT}`;

let failures = 0;
const fail = (page, msg) => { failures++; console.log(`  ✗ ${page}  ${msg}`); };
const pass = (msg) => console.log(`  ✓ ${msg}`);

async function collectPages(dir = path.join(root, 'public'), prefix = '') {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (['vendor', 'models', 'img'].includes(e.name)) continue;
      out.push(...await collectPages(path.join(dir, e.name), `${prefix}/${e.name}`));
    } else if (e.name === 'index.html') {
      out.push(`${prefix}/`);
    }
  }
  return out.sort();
}

/* ------------------------- lead API unit checks ------------------------- */
async function checkApi() {
  const { default: handler } = await import('../api/lead.js');
  const call = (body) => new Promise((resolve) => {
    const res = {
      status(c) { this._c = c; return this; },
      json(o) { resolve({ code: this._c || 200, body: o }); return this; },
      setHeader() {}, end() { resolve({ code: this._c || 200, body: null }); },
    };
    handler({ method: 'POST', body }, res);
  });

  const cases = [
    { name: 'rejects missing name',   body: { email: 'a@b.com' },                      expect: (r) => r.code === 400 },
    { name: 'rejects bad email',      body: { name: 'A', email: 'nope' },              expect: (r) => r.code === 400 },
    { name: 'swallows honeypot hits', body: { name: 'A', email: 'a@b.com', company_website: 'x' }, expect: (r) => r.code === 200 && r.body.ok === true },
    { name: 'swallows instant submits', body: { name: 'A', email: 'a@b.com', startedAt: String(Date.now()) }, expect: (r) => r.code === 200 && r.body.ok === true },
    { name: 'errors when no sink is configured', body: { name: 'A', email: 'a@b.com' }, expect: (r) => r.code === 500 && r.body.ok === false },
  ];

  for (const c of cases) {
    const r = await call(c.body);
    if (c.expect(r)) pass(`api: ${c.name}`);
    else fail('/api/lead', `${c.name} — got ${r.code} ${JSON.stringify(r.body)}`);
  }
}

/* ------------------------------ page checks ----------------------------- */
async function run() {
  console.log('\nChecking build\n');
  await checkApi();
  console.log('');

  const pages = await collectPages();
  const server = await startServer(PORT);

  const pw = await import('playwright').catch(() =>
    import(path.join(root, '../node_modules/playwright/index.js')));
  const browser = await pw.chromium.launch({
    executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
           '--no-sandbox', '--disable-dev-shm-usage'],
  });

  const known = new Set(pages.map((p) => p.replace(/\/$/, '') || '/'));
  const shotDir = path.join(root, 'screenshots');
  await mkdir(shotDir, { recursive: true });

  for (const url of pages) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('console', (m) => {
      const t = m.text();
      if (m.type() === 'error' && !/Failed to load resource/.test(t)) errors.push(t);
    });
    page.on('pageerror', (e) => errors.push('JS: ' + e.message));
    // only our own origin counts: third-party analytics failing (offline CI,
    // an ad blocker, a sandbox with no egress) is not a defect in the site
    const ours = (u) => u.startsWith(base);
    page.on('response', (r) => { if (r.status() >= 400 && ours(r.url())) errors.push(`HTTP ${r.status()} ${r.url()}`); });
    page.on('requestfailed', (r) => { if (ours(r.url())) errors.push(`request failed ${r.url()}`); });

    // Catch CSP violations directly. Some blocked resources (notably JSON-LD,
    // which never executes) do not always surface as console errors, so we
    // listen for the real event instead of inferring it.
    await page.addInitScript(() => {
      window.__csp = [];
      document.addEventListener('securitypolicyviolation', (e) => {
        window.__csp.push(`${e.violatedDirective} blocked ${e.blockedURI || 'inline'}`);
      });
    });

    await page.goto(base + url, { waitUntil: 'networkidle', timeout: 30000 });
    const cspViolations = await page.evaluate(() => window.__csp || []);
    cspViolations.forEach((v) => fail(url, 'CSP: ' + v));

    const info = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
      og: !!document.querySelector('meta[property="og:title"]'),
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
      imgs: [...document.querySelectorAll('img')].map((i) => ({
        src: i.getAttribute('src'), alt: i.getAttribute('alt'),
        w: i.getAttribute('width'), h: i.getAttribute('height'),
      })),
      forms: document.querySelectorAll('[data-lead-form]').length,
      csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || '',
    }));

    const name = url;
    if (errors.length) errors.forEach((e) => fail(name, e));
    if (!info.title) fail(name, 'missing <title>');
    else if (info.title.length > 62) fail(name, `title ${info.title.length} chars (>62)`);
    if (!info.desc) fail(name, 'missing meta description');
    else if (info.desc.length > 165) fail(name, `description ${info.desc.length} chars (>165)`);
    if (!info.canonical) fail(name, 'missing canonical');
    if (info.h1.length !== 1) fail(name, `${info.h1.length} <h1> elements (want exactly 1)`);
    if (!info.og) fail(name, 'missing Open Graph tags');
    if (!info.csp) fail(name, 'missing Content-Security-Policy');
    else if (/script-src[^;]*'unsafe-inline'/.test(info.csp)) fail(name, "CSP allows 'unsafe-inline' scripts");

    for (const raw of info.jsonld) {
      try { JSON.parse(raw); } catch (e) { fail(name, 'invalid JSON-LD: ' + e.message); }
    }
    for (const href of new Set(info.links)) {
      const clean = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
      if (clean.startsWith('/api')) continue;
      if (/\.(css|js|png|svg|glb|xml|txt|webp|jpg)$/.test(clean)) continue;
      if (!known.has(clean)) fail(name, `dead internal link → ${href}`);
    }
    for (const img of info.imgs) {
      if (img.alt === null || img.alt.trim() === '') fail(name, `image without alt: ${img.src}`);
      if (!img.w || !img.h) fail(name, `image without width/height: ${img.src}`);
    }

    if (!errors.length) pass(`${name}  ${info.title.length}ch title · ${info.desc.length}ch desc · ${info.forms} form(s)`);

    if (url === '/' || url === '/product/' || url === '/pricing/') {
      await page.waitForTimeout(url === '/product/' ? 3500 : 400);
      await page.screenshot({ path: path.join(shotDir, (url === '/' ? 'home' : url.replace(/\//g, '')) + '.png'), fullPage: false });
    }
    await page.close();
  }

  // does the 3D viewer actually come alive?
  const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(base + '/product/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(4000);
  const live = await p.evaluate(() => document.querySelector('[data-viewer]')?.classList.contains('is-live'));
  if (live) pass('3D viewer initialised and swapped in'); else fail('/product/', '3D viewer never became live');
  await p.close();

  /* ------------------------- mobile menu ------------------------------
   * This regressed once and nothing caught it: the nav panel collapsed to a
   * ~36px sliver because .hdr's backdrop-filter makes it the containing block
   * for `position: fixed` descendants, so the panel's `inset` resolved against
   * the 62px header instead of the viewport. Visually the menu button "did
   * nothing" while the scroll lock still applied — the page looked frozen.
   *
   * Every assertion below is a symptom of that bug or of the follow-on fixes.
   * If one fails, read src/assets/styles.css's @media (max-width: 780px) block
   * before changing this test.
   * ------------------------------------------------------------------- */
  const m = await browser.newPage({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true,
  });
  await m.goto(base + '/', { waitUntil: 'networkidle' });

  const burger = m.locator('[data-burger]');
  if (await burger.isVisible()) pass('mobile: burger visible at 390px');
  else fail('/', 'mobile: burger not visible at 390px');

  await burger.tap();
  await m.waitForTimeout(350);

  const box = await m.locator('.hdr .nav').boundingBox();
  // The bug produced height ~36. Anything under half the viewport means the
  // panel is collapsing again rather than covering the screen.
  if (box && box.height > 500 && box.width > 300) {
    pass(`mobile: open menu covers the screen (${Math.round(box.width)}x${Math.round(box.height)})`);
  } else {
    fail('/', `mobile: open menu is ${box ? `${Math.round(box.width)}x${Math.round(box.height)}` : 'not rendered'} — expected to fill the viewport below the header`);
  }

  const tap = await m.locator('.hdr .nav a').first().boundingBox();
  if (tap && tap.height >= 50) pass(`mobile: nav tap targets ${Math.round(tap.height)}px`);
  else fail('/', `mobile: nav tap target only ${Math.round(tap?.height || 0)}px (want >= 50)`);

  if (await m.evaluate(() => document.body.style.overflow) === 'hidden') pass('mobile: scroll locked while menu open');
  else fail('/', 'mobile: scroll not locked while menu open');

  // Tapping a link must both navigate and release the lock. Leaving
  // overflow:hidden behind is what made the page feel permanently frozen.
  await m.locator('.hdr .nav a').first().tap();
  await m.waitForTimeout(700);
  if (await m.evaluate(() => document.body.style.overflow) !== 'hidden') pass('mobile: scroll lock released after tapping a link');
  else fail('/', 'mobile: scroll lock survived a nav link tap');

  await m.locator('[data-burger]').tap();
  await m.waitForTimeout(250);
  await m.keyboard.press('Escape');
  await m.waitForTimeout(250);
  if (await m.evaluate(() => document.querySelector('[data-header]')?.getAttribute('data-menu')) === 'closed') {
    pass('mobile: Escape closes the menu');
  } else {
    fail('/', 'mobile: Escape did not close the menu');
  }
  await m.close();

  /* --------------------- cache-busting of assets ----------------------
   * vercel.json serves CSS/JS `immutable` for a year. That is only safe while
   * the filename carries a content hash — otherwise a shipped fix never reaches
   * a returning visitor's phone, which is exactly how the mobile-menu fix above
   * stayed invisible in production after it was deployed.
   * -------------------------------------------------------------------- */
  const homeHtml = await readFile(path.join(root, 'public/index.html'), 'utf8');
  const hashed = /(?:href|src)="\/(?:styles|app)\.[a-f0-9]{10}\.(?:css|js)"/g;
  const bare = /(?:href|src)="\/(?:styles\.css|app\.js|viewer\.js)"/;
  if ((homeHtml.match(hashed) || []).length >= 2 && !bare.test(homeHtml)) {
    pass('assets are content-hashed (immutable caching is safe)');
  } else {
    fail('/', 'assets are NOT content-hashed — immutable caching in vercel.json will pin stale CSS/JS on returning visitors for a year');
  }

  await browser.close();
  server.close();

  console.log(failures ? `\n  ${failures} problem(s) found\n` : '\n  all checks passed\n');
  process.exit(failures ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
