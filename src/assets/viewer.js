/**
 * Product page 3D viewer.
 *
 * Loads only after first paint, only when WebGL is available, and only when the
 * viewer is actually scrolled into view. If any of that fails the poster image
 * stays put and the page is unaffected — the 3D is an enhancement, never a
 * dependency, because Core Web Vitals decide our search rankings.
 */
import * as THREE from '/vendor/three/three.module.js';
import { GLTFLoader } from '/vendor/three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from '/vendor/three/addons/controls/OrbitControls.js';

const el = document.querySelector('[data-viewer]');
if (el) init(el);

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (_) { return false; }
}

function init(host) {
  if (!hasWebGL()) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // still allow it, but never auto-spin
  }

  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); boot(host); }
  }, { rootMargin: '200px' });
  io.observe(host);
}

function boot(host) {
  const hotspots = JSON.parse(document.getElementById('hotspot-data')?.textContent || '[]');
  const detail = document.querySelector('[data-hotspot-detail]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  host.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 200);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minDistance = 0.35;
  controls.maxDistance = 14;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.65;

  scene.add(new THREE.HemisphereLight(0x9fb4c7, 0x0b0d0f, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 5, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xbfd4e8, 0.9); fill.position.set(-4, 2, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffb98a, 1.4); rim.position.set(-2, 3, -5); scene.add(rim);

  const loader = new GLTFLoader();
  const models = {};              // key -> { root, size, home, parts: Map }
  let active = null;
  let exploded = false;

  // The set of models is declared on the element, so adding one (the drone) is
  // a markup change rather than a code change.
  const srcs = host.dataset.models
    ? JSON.parse(host.dataset.models)
    : { rover: host.dataset.model, base: host.dataset.altModel };

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function frame(m) {
    const vFov = camera.fov * Math.PI / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const dV = (m.size.y / 2) / Math.tan(vFov / 2);
    const dH = (Math.hypot(m.size.x, m.size.z) / 2) / Math.tan(hFov / 2);
    const d = Math.max(dV, dH) * 1.18;
    camera.position.set(d * 0.66, m.centreY, d * 0.66);
    controls.target.set(0, m.centreY, 0);
    controls.minDistance = d * 0.18;
    controls.maxDistance = d * 2.2;
    controls.update();
  }

  function load(key) {
    if (models[key]) return Promise.resolve(models[key]);
    return new Promise((resolve, reject) => {
      loader.load(srcs[key], (gltf) => {
        const root = gltf.scene;
        root.scale.setScalar(0.001);          // CAD is millimetres
        // Models converted from the FreeCAD documents are Z-up; the STEP exports
        // come from a three.js writer and are already Y-up. Opt in per element.
        if (host.dataset.up === 'z') root.rotation.x = -Math.PI / 2;

        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const centre = box.getCenter(new THREE.Vector3());
        root.position.x -= centre.x;
        root.position.z -= centre.z;
        root.position.y -= box.min.y;

        const parts = new Map();
        root.traverse((o) => {
          if (!o.isMesh) return;
          o.userData.home = o.position.clone();
          const b = new THREE.Box3().setFromObject(o);
          o.userData.centre = b.getCenter(new THREE.Vector3());
          parts.set(o.name, o);
        });

        const m = { root, size, centreY: size.y / 2, parts };
        models[key] = m;
        resolve(m);
      }, undefined, reject);
    });
  }

  function show(key) {
    return load(key).then((m) => {
      if (active) scene.remove(active.root);
      active = m;
      scene.add(m.root);
      applyExplode(exploded, true);
      resize();
      frame(m);
      host.classList.add('is-live');
      return m;
    });
  }

  function applyExplode(on, instant) {
    if (!active) return;
    const spread = Math.max(active.size.x, active.size.z) * 0.9 + 0.06;
    active.parts.forEach((o) => {
      const c = o.userData.centre;
      const dir = new THREE.Vector3(c.x, 0, c.z);
      if (dir.lengthSq() < 1e-9) dir.set(1, 0, 0.35);
      dir.normalize();
      const target = on
        ? o.userData.home.clone().add(new THREE.Vector3(dir.x * spread, 0, dir.z * spread))
        : o.userData.home.clone();
      o.userData.target = target;
      if (instant) o.position.copy(target);
    });
  }

  function focusPart(name) {
    if (!active) return;
    const o = active.parts.get(name);
    if (!o) return;
    const b = new THREE.Box3().setFromObject(o);
    const c = b.getCenter(new THREE.Vector3());
    const r = Math.max(b.getSize(new THREE.Vector3()).length(), 0.08);
    controls.autoRotate = false;
    camTarget = { pos: new THREE.Vector3(c.x + r * 1.6, c.y + r * 0.5, c.z + r * 1.6), look: c.clone() };
  }

  let camTarget = null;

  /* ---- UI wiring ---- */
  host.querySelectorAll('[data-model-switch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.modelSwitch;
      host.querySelectorAll('[data-model-switch]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn)));
      camTarget = null;
      show(key);
    });
  });

  const explodeBtn = host.querySelector('[data-explode]');
  if (explodeBtn) explodeBtn.addEventListener('click', () => {
    exploded = !exploded;
    explodeBtn.setAttribute('aria-pressed', String(exploded));
    explodeBtn.textContent = exploded ? 'Assembled view' : 'Exploded view';
    applyExplode(exploded, false);
  });

  document.querySelectorAll('[data-focus]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-focus]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      focusPart(btn.dataset.focus);
      const h = hotspots.find((x) => x.id === btn.dataset.hotspot);
      if (h && detail) {
        detail.innerHTML =
          `<div class="card"><h3>${h.title}</h3><p>${h.text}</p></div>`;
      }
    });
  });

  const hint = host.querySelector('[data-viewer-hint]');
  let interacted = false;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    camTarget = null;
    if (!interacted && hint) { hint.style.opacity = '0'; interacted = true; }
  });

  addEventListener('resize', () => { resize(); if (active) frame(active); }, { passive: true });

  let running = true;
  const vis = new IntersectionObserver((e) => { running = e[0].isIntersecting; });
  vis.observe(host);

  function tick() {
    requestAnimationFrame(tick);
    if (!running) return;
    if (active) {
      active.parts.forEach((o) => {
        if (o.userData.target) o.position.lerp(o.userData.target, 0.12);
      });
    }
    if (camTarget) {
      camera.position.lerp(camTarget.pos, 0.09);
      controls.target.lerp(camTarget.look, 0.09);
      if (camera.position.distanceTo(camTarget.pos) < 0.004) camTarget = null;
    }
    controls.update();
    renderer.render(scene, camera);
  }

  resize();
  show('rover').then(tick).catch((err) => {
    console.warn('[viewer] model failed to load, keeping poster', err);
    host.classList.remove('is-live');
    canvas.remove();
  });
}
