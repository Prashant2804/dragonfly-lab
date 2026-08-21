/**
 * Offline still renderer.
 *
 * Renders the GLB models to transparent PNGs used as hero images and as the
 * poster for the interactive viewer. Run this whenever the CAD changes:
 *
 *   node scripts/render-stills.mjs
 *
 * Requires playwright + a chromium binary. It renders headlessly with
 * SwiftShader, so it works on a machine with no GPU.
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8912;

const SHOTS = [
  // A buyer's first question is "what IS it, and how big". So the hero shows the
  // WHOLE instrument, not a crop of the middle — an anonymous grey cylinder tells
  // them nothing. The stack close-up is still rendered, but as a secondary image.
  { model: 'aerom-rover', view: 'iso',   out: 'rover-hero.png',  w: 900, h: 1180 },
  { model: 'aerom-base',  view: 'iso',   out: 'base-hero.png',   w: 900, h: 1180 },
  { model: 'aerom-drone', view: 'iso',   out: 'drone-hero.png',  w: 1100, h: 900 },
  { model: 'aerom-rover', view: 'stack', out: 'rover-stack.png', w: 900, h: 1100 },
  { model: 'aerom-rover', view: 'front', out: 'rover-front.png', w: 700, h: 1180 },
  { model: 'aerom-base',  view: 'front', out: 'base-front.png',  w: 900, h: 1100 },
  { model: 'aerom-drone', view: 'front', out: 'drone-front.png', w: 1100, h: 760 },
  // social preview — every WhatsApp and LinkedIn share uses this
  { model: 'aerom-rover', view: 'og',    out: 'og-render.png',   w: 1200, h: 630 },
];

const PAGE = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
html,body{margin:0;height:100%;background:transparent;overflow:hidden}canvas{display:block;width:100vw;height:100vh}
</style></head><body><canvas id="c"></canvas>
<script type="module">
import * as THREE from '/vendor/three/three.module.js';
import { GLTFLoader } from '/vendor/three/addons/loaders/GLTFLoader.js';
const q = new URLSearchParams(location.search);
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, preserveDrawingBuffer:true});
renderer.setPixelRatio(2);
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(28, innerWidth/innerHeight, 0.01, 200);
scene.add(new THREE.HemisphereLight(0x9fb4c7, 0x0b0d0f, 1.15));
const k = new THREE.DirectionalLight(0xffffff, 2.5); k.position.set(3,5,4); scene.add(k);
const f = new THREE.DirectionalLight(0xbfd4e8, 0.95); f.position.set(-4,2,3); scene.add(f);
const r = new THREE.DirectionalLight(0xffb98a, 1.5); r.position.set(-2,3,-5); scene.add(r);
new GLTFLoader().load('/models/' + q.get('model') + '.glb', (g) => {
  const root = g.scene;
  root.scale.setScalar(0.001);
  // Models converted from the FreeCAD documents are Z-up; the newer STEP exports
  // come from a three.js writer and are already Y-up. Flip only when asked.
  if (q.get('up') === 'z') root.rotation.x = -Math.PI/2;
  scene.add(root);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const c = box.getCenter(new THREE.Vector3());
  root.position.x -= c.x; root.position.z -= c.z; root.position.y -= box.min.y;
  const cy = size.y / 2;
  const vFov = camera.fov * Math.PI/180;
  const hFov = 2 * Math.atan(Math.tan(vFov/2) * camera.aspect);
  const view = q.get('view');
  if (view === 'stack') {
    // frame just the top of the rover: battery, gateway box and antenna
    const top = size.y + 0.02, bottom = size.y - 0.40;
    const h = top - bottom, mid = (top + bottom) / 2;
    const d = Math.max((h/2)/Math.tan(vFov/2), 0.11/Math.tan(hFov/2)) * 1.10;
    camera.position.set(d*0.55, mid + h*0.06, d*0.62);
    camera.lookAt(0, mid, 0);
  } else if (view === 'og') {
    const d = Math.max((size.y/2)/Math.tan(vFov/2), (Math.hypot(size.x,size.z)/2)/Math.tan(hFov/2)) * 1.12;
    camera.position.set(d*0.7, cy, d*0.7);
    camera.lookAt(0, cy, 0);
  } else {
    const d = Math.max((size.y/2)/Math.tan(vFov/2), (Math.hypot(size.x,size.z)/2)/Math.tan(hFov/2)) * 1.16;
    if (view === 'front') camera.position.set(0, cy, d);
    else camera.position.set(d*0.60, cy, d*0.60);
    camera.lookAt(0, cy, 0);
  }
  renderer.render(scene, camera);
  window.__ready = true;
});
</script></body></html>`;

const MIME = { '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.html': 'text/html' };

const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(PAGE);
  }
  const file = path.join(root, 'public', url);
  if (!file.startsWith(path.join(root, 'public')) || !existsSync(file)) {
    res.writeHead(404); return res.end('not found');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
});

const { chromium } = await import('playwright').catch(async () => import(
  path.join(root, '../node_modules/playwright/index.js')
));

await new Promise((r) => server.listen(PORT, r));
await mkdir(path.join(root, 'static/img'), { recursive: true });

const browser = await chromium.launch({
  executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
         '--no-sandbox', '--disable-dev-shm-usage'],
});

for (const s of SHOTS) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('   [pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${PORT}/?model=${s.model}&view=${s.view}&up=${s.up || 'y'}`, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', { timeout: 30000 });
  await page.waitForTimeout(400);
  const buf = await page.screenshot({ omitBackground: true });
  const dest = path.join(root, 'static/img', s.out);
  await writeFile(dest, buf);
  console.log(`  ${s.out.padEnd(20)} ${(buf.length / 1024).toFixed(0).padStart(5)} KB`);
  await page.close();
}

await browser.close();
server.close();
console.log('\n  stills written to static/img — re-run `npm run build` to publish them\n');
