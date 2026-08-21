/**
 * Social preview card.
 *
 * Every page's og:image points at /img/og-default.png. Without it, every
 * WhatsApp and LinkedIn share renders a broken card — and in the Indian survey
 * market, WhatsApp groups are the distribution channel. So this is not a nicety.
 *
 *   node scripts/render-og.mjs
 */
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8913;

const CARD = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0B0D0F;overflow:hidden;
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#E9ECEF;
  display:grid;grid-template-columns:1.15fr 0.85fr;position:relative}
.glow{position:absolute;inset:0;background:radial-gradient(60% 70% at 78% 55%,#E65C2022,transparent 70%)}
.l{padding:64px 0 64px 72px;display:flex;flex-direction:column;justify-content:center;position:relative}
.brand{display:flex;align-items:center;gap:12px;font-size:26px;font-weight:660;letter-spacing:-.02em;margin-bottom:38px}
.brand svg{width:30px;height:30px}
.brand span{color:#737E87;font-weight:450;font-size:20px}
h1{font-size:62px;line-height:1.05;letter-spacing:-.03em;font-weight:640;margin-bottom:22px}
p{font-size:24px;line-height:1.45;color:#A7B0B8;max-width:20ch}
.strip{display:flex;gap:26px;margin-top:40px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:17px;color:#8B939B}
.strip b{color:#35C46A;font-weight:500}
.r{position:relative;display:flex;align-items:center;justify-content:center;padding:30px 40px 30px 0}
.r img{max-height:560px;width:auto;object-fit:contain}
</style></head><body>
<div class="glow"></div>
<div class="l">
  <div class="brand">
    <svg viewBox="0 0 24 24"><path d="M12 2 L14.4 9.6 L22 12 L14.4 14.4 L12 22 L9.6 14.4 L2 12 L9.6 9.6 Z" fill="#E65C20"/><circle cx="12" cy="12" r="2.1" fill="#0B0D0F"/></svg>
    Dragonfly <span>/ Aerom</span>
  </div>
  <h1>Survey-grade RTK.<br>Built in India.</h1>
  <p>Rover, base station, field app and post-processing.</p>
  <div class="strip"><span><b>1 cm</b> demonstrated</span><span>u-blox ZED-X20P</span></div>
</div>
<div class="r"><img src="/img/base-hero.png" alt=""></div>
</body></html>`;

const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(CARD);
  }
  const file = path.join(root, 'static', url);
  if (!file.startsWith(path.join(root, 'static')) || !existsSync(file)) {
    res.writeHead(404); return res.end('nope');
  }
  res.writeHead(200, { 'Content-Type': 'image/png' });
  res.end(await readFile(file));
});

const { chromium } = await import('playwright').catch(() =>
  import(path.join(root, '../node_modules/playwright/index.js')));

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch({
  executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const buf = await page.screenshot();
await writeFile(path.join(root, 'static/img/og-default.png'), buf);
console.log(`  og-default.png  ${(buf.length / 1024).toFixed(0)} KB`);
await browser.close();
server.close();
