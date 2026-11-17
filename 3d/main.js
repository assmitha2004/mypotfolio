import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import Lenis from 'lenis';

document.body.classList.remove('no-js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileQ = matchMedia('(max-width: 900px)');
let mobile = mobileQ.matches;

/* =================================================================== content */
const PROJECTS = [
  {
    id: 'payledger', name: 'PayLedger', sub: 'Digital wallet and payments platform',
    big: '0', bigText: 'deadlocks in 100 opposing transfers, down from 50',
    points: [
      'Double-entry ledger that stores money as integer paise',
      'SELECT FOR UPDATE row locks: 50 simultaneous ₹10 transfers from ₹100, exactly 10 accepted',
      'Idempotency keys so a retry never charges twice',
      '43 tests against real MySQL in CI, about 300 transfers a second',
    ],
    stack: 'React · Node.js · Express · MySQL · Docker',
    live: 'https://digital-wallet-coral-theta.vercel.app', code: 'https://github.com/assmitha2004/Digital_wallet'
  },
  {
    id: 'scheduling', name: 'Smart Scheduling', sub: 'Full-stack planning platform',
    big: '0.6 s', bigText: 'to schedule 1,000 dependent tasks with the Critical Path Method',
    points: [
      'Drag-and-drop calendar and Gantt timeline on a versioned REST API',
      'Cycle detection, topological sort and CPM; p95 latency under 27 ms',
      'No double-booking: optimistic versioning plus a PostgreSQL exclusion constraint',
      'Redis and BullMQ jobs with live Socket.IO updates; 135 tests in CI',
    ],
    stack: 'React · TypeScript · Node.js · PostgreSQL · Prisma · Redis',
    live: 'https://smart-scheduling-jet.vercel.app', code: 'https://github.com/assmitha2004/smart-scheduling'
  },
  {
    id: 'kural', name: 'Kural RAG', sub: 'Multilingual semantic search',
    big: '44 → 97', bigText: 'questions out of 100 with the right verse in the top 5',
    points: [
      'Ask in English, Tamil or Thanglish; get Thirukkural verses with a cited answer',
      'Hybrid search over 1,330 verses: hand-written BM25, embeddings and a reranker',
      'FastAPI service loads models once, caches results, keeps keys server-side',
      'Every citation is checked in code',
    ],
    stack: 'Next.js · React · TypeScript · Python · FastAPI',
    live: 'https://kural-rag.vercel.app', code: 'https://github.com/assmitha2004/kural-rag'
  }
];
let projIdx = 0;

/* =================================================================== project carousel (DOM) */
const projBody = document.getElementById('proj-body');
const dots = [...document.querySelectorAll('#dots i')];
function renderProject(i, animate = true) {
  const p = PROJECTS[i];
  const html = `
    <div class="count"><b>0${i + 1}</b> / 0${PROJECTS.length}</div>
    <h3>${p.name}</h3>
    <div class="sub">${p.sub}</div>
    <div class="big"><b>${p.big}</b><span>${p.bigText}</span></div>
    <ul>${p.points.map(x => `<li>${x}</li>`).join('')}</ul>
    <div class="stack">${p.stack}</div>
    <div class="links"><a class="cta" href="${p.live}">Open live app</a><a class="cta ghost" href="${p.code}">View code</a></div>`;
  dots.forEach((d, j) => d.classList.toggle('on', j === i));
  if (!animate || reduce) { projBody.innerHTML = html; return; }
  projBody.classList.add('out');
  setTimeout(() => { projBody.innerHTML = html; projBody.classList.remove('out'); }, 300);
}
renderProject(0, false);
document.getElementById('prev').addEventListener('click', () => { projIdx = (projIdx + PROJECTS.length - 1) % PROJECTS.length; renderProject(projIdx); });
document.getElementById('next').addEventListener('click', () => { projIdx = (projIdx + 1) % PROJECTS.length; renderProject(projIdx); });

/* =================================================================== smooth scroll, reveal, counters */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); lenis.scrollTo(t, { duration: 1.6 });
  }));
}
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

const statsEl = document.getElementById('stats');
const counted = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; counted.disconnect();
  if (reduce) return;
  statsEl.querySelectorAll('[data-count]').forEach(b => {
    const end = parseFloat(b.dataset.count), dec = +(b.dataset.dec || 0), pre = b.dataset.prefix || '';
    const t0 = performance.now(), dur = 1600;
    const step = now => { const k = Math.min(1, (now - t0) / dur), v = end * (1 - Math.pow(1 - k, 4)); b.textContent = pre + v.toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}), { threshold: 0.4 });
counted.observe(statsEl);

const sections = [...document.querySelectorAll('section[data-pose]')];
const indexLinks = [...document.querySelectorAll('#index a')];

/* =================================================================== loader */
let loaderDone = false;
function finishLoader() {
  if (loaderDone) return; loaderDone = true;
  const pct = document.getElementById('pct'), bar = document.getElementById('bar'), L = document.getElementById('loader');
  const t0 = performance.now(), dur = reduce ? 1 : 1100;
  const step = now => {
    const k = Math.min(1, (now - t0) / dur); const v = Math.round(100 * (1 - Math.pow(1 - k, 3)));
    pct.textContent = v; bar.style.width = v + '%';
    if (k < 1) requestAnimationFrame(step); else setTimeout(() => L.classList.add('done'), 150);
  };
  requestAnimationFrame(step);
}

/* =================================================================== renderer */
const canvas = document.getElementById('stage');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
catch (e) { document.documentElement.classList.add('nogl'); finishLoader(); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.6 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0c);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.03).texture;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(mobile ? 34 : 28, innerWidth / innerHeight, 0.05, 30);
const camD = new THREE.Vector3(0, 0.42, 2.6), lookD = new THREE.Vector3(0, 0.12, 0);
const camM = new THREE.Vector3(0, 0.62, 3.3), lookM = new THREE.Vector3(0, -0.28, 0);

/* =================================================================== studio floor + light */
const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.55 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const poolTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  const r = g.createRadialGradient(256, 256, 0, 256, 256, 256); r.addColorStop(0, 'rgba(255,255,255,.14)'); r.addColorStop(.5, 'rgba(255,255,255,.04)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 512, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const pool = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false }));
pool.rotation.x = -Math.PI / 2; pool.position.y = 0.001; scene.add(pool);

const key = new THREE.SpotLight(0xffffff, 26, 8, 0.42, 0.85, 1.6);
key.position.set(-1.1, 2.6, 1.4); key.castShadow = true;
key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); key.shadow.bias = -0.0002; key.shadow.radius = 8; key.shadow.camera.near = 0.5; key.shadow.camera.far = 6;
scene.add(key, key.target);
const rim = new THREE.SpotLight(0xff5a1f, 22, 7, 0.5, 0.9, 1.6);
rim.position.set(1.6, 1.1, -1.8); scene.add(rim, rim.target);
const fill = new THREE.DirectionalLight(0x9fb3ff, 0.35); fill.position.set(2, 1, 2); scene.add(fill);

/* =================================================================== laptop */
const spaceGrey = new THREE.MeshPhysicalMaterial({ color: 0x6c6f75, metalness: 1, roughness: 0.38, clearcoat: 0.15, clearcoatRoughness: 0.4 });
const darkGrey = new THREE.MeshStandardMaterial({ color: 0x2a2b2e, metalness: 0.8, roughness: 0.45 });
const keyMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.62, metalness: 0.1 });
const glassBlack = new THREE.MeshPhysicalMaterial({ color: 0x030303, roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03 });

const W = 0.312, D = 0.221, BH = 0.0105, LT = 0.0052;
const pivot = new THREE.Group(); scene.add(pivot);
const laptop = new THREE.Group(); pivot.add(laptop);

const base = new THREE.Mesh(new RoundedBoxGeometry(W, BH, D, 6, 0.0048), spaceGrey);
base.position.y = BH / 2; laptop.add(base);
const well = new THREE.Mesh(new RoundedBoxGeometry(0.284, 0.0006, 0.118, 2, 0.0003), new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.7 }));
well.position.set(0, BH + 0.00005, -0.03); laptop.add(well);
const keyGeo = new RoundedBoxGeometry(0.0168, 0.0012, 0.0158, 2, 0.0012);
const rows = [14, 14, 13, 12, 11];
const keys = new THREE.InstancedMesh(keyGeo, keyMat, rows.reduce((a, b) => a + b, 0) + 12);
const m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(); let ki = 0;
const pitch = 0.0195, z0 = -0.082;
for (let c = 0; c < 12; c++) { m4.compose(new THREE.Vector3(-0.1335 + c * 0.0243, BH + 0.0006, z0), q0, new THREE.Vector3(1.2, 1, 0.55)); keys.setMatrixAt(ki++, m4); }
rows.forEach((n, r) => {
  const rowW = 0.273, kw = rowW / n;
  for (let c = 0; c < n; c++) {
    m4.compose(new THREE.Vector3(-rowW / 2 + kw * (c + .5), BH + 0.0006, z0 + 0.017 + r * pitch), q0, new THREE.Vector3((kw - 0.0027) / 0.0168, 1, 1));
    keys.setMatrixAt(ki++, m4);
  }
});
keys.count = ki; laptop.add(keys);
const space = new THREE.Mesh(new RoundedBoxGeometry(0.098, 0.0012, 0.0158, 2, 0.0012), keyMat);
space.position.set(0, BH + 0.0006, z0 + 0.017 + 5 * pitch); laptop.add(space);
const pad = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.0004, 0.074, 3, 0.0002), new THREE.MeshPhysicalMaterial({ color: 0x8f9297, metalness: 0.9, roughness: 0.22, clearcoat: 0.6 }));
pad.position.set(0, BH + 0.0001, 0.068); laptop.add(pad);
const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.23, 24), darkGrey);
hinge.rotation.z = Math.PI / 2; hinge.position.set(0, BH - 0.001, -D / 2 + 0.003); laptop.add(hinge);
const lid = new THREE.Group(); lid.position.set(0, BH + 0.0004, -D / 2 + 0.0015); laptop.add(lid);
const lidShell = new THREE.Mesh(new RoundedBoxGeometry(W, LT, D - 0.002, 6, 0.0026), spaceGrey);
lidShell.position.set(0, LT / 2, (D - 0.002) / 2); lid.add(lidShell);
const face = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.004, D - 0.006), glassBlack);
face.rotation.x = Math.PI / 2; face.position.set(0, -0.00005, (D - 0.002) / 2); lid.add(face);

const SW = 1600, SH = 1000;
const scrCanvas = document.createElement('canvas'); scrCanvas.width = SW; scrCanvas.height = SH;
const sg = scrCanvas.getContext('2d');
const screenTex = new THREE.CanvasTexture(scrCanvas); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });
const scrW = W - 0.022;
const screen = new THREE.Mesh(new THREE.PlaneGeometry(scrW, scrW * SH / SW), screenMat);
screen.rotation.x = Math.PI / 2; screen.position.set(0, -0.0003, (D - 0.002) / 2 + 0.003); lid.add(screen);
const screenLight = new THREE.PointLight(0xbfd2ff, 0, 0.6, 2); screenLight.position.set(0, 0.09, 0.02); laptop.add(screenLight);
[[-.13, -.09], [.13, -.09], [-.13, .09], [.13, .09]].forEach(([x, z]) => { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.0012, 20), keyMat); f.position.set(x, -0.0006, z); laptop.add(f); });
laptop.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
screen.castShadow = false;
laptop.scale.setScalar(2);

/* =================================================================== screen UIs */
const F = (w, s, fam) => `${w} ${s}px ${fam === 'mono' ? '"JetBrains Mono", Menlo, Consolas, monospace' : '"Archivo", "Helvetica Neue", Arial, sans-serif'}`;
const SIG = '#FF5A1F';
function rr(x, y, w, h, r, fill, stroke) {
  sg.beginPath(); if (sg.roundRect) sg.roundRect(x, y, w, h, r); else sg.rect(x, y, w, h);
  if (fill) { sg.fillStyle = fill; sg.fill(); } if (stroke) { sg.strokeStyle = stroke; sg.lineWidth = 2; sg.stroke(); }
}
function chrome(title) {
  sg.fillStyle = '#111214'; sg.fillRect(0, 0, SW, SH);
  sg.fillStyle = '#1b1c1f'; sg.fillRect(0, 0, SW, 64);
  [['#ff5f57', 0], ['#febc2e', 1], ['#28c840', 2]].forEach(([c, i]) => { sg.fillStyle = c; sg.beginPath(); sg.arc(36 + i * 30, 32, 9, 0, Math.PI * 2); sg.fill(); });
  sg.fillStyle = '#8e8e93'; sg.font = F(600, 22); sg.textAlign = 'center'; sg.fillText(title, SW / 2, 40); sg.textAlign = 'left';
}
const SCREENS = {
  boot() {
    sg.fillStyle = '#050506'; sg.fillRect(0, 0, SW, SH);
    sg.fillStyle = '#F2F0EB'; sg.font = F(800, 120); sg.textAlign = 'center'; sg.fillText('AG', SW / 2, SH / 2 + 30); sg.textAlign = 'left';
    sg.fillStyle = SIG; sg.fillRect(SW / 2 - 60, SH / 2 + 80, 120, 6);
  },
  code() {
    chrome('transfer.ts — payledger');
    sg.fillStyle = '#16171a'; sg.fillRect(0, 64, 300, SH - 64);
    sg.font = F(500, 22, 'mono');
    [['payledger', '#c7c7cc', 0], ['src', '#c7c7cc', 1], ['ledger.ts', '#8e8e93', 2], ['transfer.ts', '#F2F0EB', 2], ['wallet.ts', '#8e8e93', 2], ['tests', '#c7c7cc', 1], ['transfer.test.ts', '#8e8e93', 2]].forEach(([t, c, d], i) => {
      if (t === 'transfer.ts') { sg.fillStyle = 'rgba(255,90,31,.16)'; sg.fillRect(0, 96 + i * 44 - 30, 300, 44); }
      sg.fillStyle = c; sg.fillText(t, 24 + d * 24, 96 + i * 44);
    });
    const K = '#ff7b72', S = '#a5d6ff', C = '#7d8590', T = '#e6edf3', Fn = '#d2a8ff', Y = '#ffa657';
    const L = [
      [[C, '// Move money atomically. Locks are taken in id order']],
      [[C, '// so two opposing transfers can never deadlock.']],
      [[K, 'export async function '], [Fn, 'transfer'], [T, '(from, to, paise, key) {']],
      [[T, '  '], [K, 'return '], [T, 'db.'], [Fn, 'transaction'], [T, '(async (tx) => {']],
      [[T, '    '], [K, 'if '], [T, '(await tx.'], [Fn, 'seen'], [T, '(key)) '], [K, 'return '], [T, 'tx.'], [Fn, 'replay'], [T, '(key);']],
      [[T, '    '], [K, 'const '], [T, '[a, b] = [from, to].'], [Fn, 'sort'], [T, '();']],
      [[T, '    '], [K, 'const '], [T, 'rows = '], [K, 'await '], [T, 'tx.'], [Fn, 'query'], [T, '(']],
      [[S, '      `SELECT id, balance FROM wallets']],
      [[S, '       WHERE id IN (?, ?) ORDER BY id FOR UPDATE`'], [T, ', [a, b]);']],
      [[T, '    '], [K, 'if '], [T, '(rows.'], [Fn, 'get'], [T, '(from).balance < paise)']],
      [[T, '      '], [K, 'throw new '], [Y, 'InsufficientFunds'], [T, '();']],
      [[T, '    '], [K, 'await '], [T, 'tx.'], [Fn, 'post'], [T, '({ debit: from, credit: to, paise });']],
      [[T, '    '], [K, 'await '], [T, 'tx.'], [Fn, 'remember'], [T, '(key);']],
      [[T, '  });']],
      [[T, '}']],
    ];
    L.forEach((line, i) => {
      const y = 130 + i * 50; sg.fillStyle = '#484f58'; sg.font = F(500, 24, 'mono'); sg.textAlign = 'right'; sg.fillText(String(i + 1), 370, y); sg.textAlign = 'left';
      let x = 400; line.forEach(([c, t]) => { sg.fillStyle = c; sg.fillText(t, x, y); x += sg.measureText(t).width; });
    });
    sg.fillStyle = '#1b1c1f'; sg.fillRect(0, SH - 44, SW, 44);
    sg.fillStyle = '#30D158'; sg.font = F(600, 20, 'mono'); sg.fillText('✓ 43 tests passing', 24, SH - 15);
    sg.fillStyle = '#8e8e93'; sg.fillText('TypeScript · main', SW - 260, SH - 15);
  },
  dashboard() {
    chrome('Sprint analytics');
    sg.fillStyle = '#F2F0EB'; sg.font = F(800, 46); sg.fillText('Weekly Focus', 60, 140);
    sg.fillStyle = '#8e8e93'; sg.font = F(500, 22); sg.fillText('Sprint progress, open defects and testing status, live from Jira', 60, 180);
    ['Sprint progress', 'Open defects', 'Testing status'].forEach((t, i) => {
      const x = 60 + i * 500; rr(x, 220, 470, 170, 18, '#1a1b1e');
      sg.fillStyle = '#8e8e93'; sg.font = F(600, 22); sg.fillText(t, x + 28, 262);
      const fl = [.72, .35, .86][i], col = ['#0A84FF', SIG, '#30D158'][i];
      rr(x + 28, 310, 414, 16, 8, '#2a2b2f'); rr(x + 28, 310, 414 * fl, 16, 8, col);
      for (let k = 0; k < 6; k++) rr(x + 28 + k * 70, 345, 54, 18, 4, k < Math.round(fl * 6) ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.06)');
    });
    rr(60, 420, 960, 500, 18, '#1a1b1e');
    sg.fillStyle = '#c7c7cc'; sg.font = F(700, 24); sg.fillText('Burndown', 90, 470);
    sg.strokeStyle = 'rgba(255,255,255,.08)'; sg.lineWidth = 1; for (let k = 0; k < 6; k++) { sg.beginPath(); sg.moveTo(90, 520 + k * 70); sg.lineTo(990, 520 + k * 70); sg.stroke(); }
    sg.strokeStyle = 'rgba(255,255,255,.25)'; sg.setLineDash([10, 10]); sg.lineWidth = 3; sg.beginPath(); sg.moveTo(90, 520); sg.lineTo(990, 870); sg.stroke(); sg.setLineDash([]);
    const pts = [[90, 520], [220, 545], [350, 600], [480, 610], [610, 690], [740, 740], [870, 800], [990, 860]];
    const grd = sg.createLinearGradient(0, 520, 0, 900); grd.addColorStop(0, 'rgba(10,132,255,.25)'); grd.addColorStop(1, 'rgba(10,132,255,0)');
    sg.fillStyle = grd; sg.beginPath(); pts.forEach(([x, y], k) => k ? sg.lineTo(x, y) : sg.moveTo(x, y)); sg.lineTo(990, 900); sg.lineTo(90, 900); sg.closePath(); sg.fill();
    sg.strokeStyle = '#0A84FF'; sg.lineWidth = 5; sg.beginPath(); pts.forEach(([x, y], k) => k ? sg.lineTo(x, y) : sg.moveTo(x, y)); sg.stroke();
    rr(1050, 420, 490, 500, 18, '#1a1b1e');
    sg.fillStyle = '#c7c7cc'; sg.font = F(700, 24); sg.fillText('Bugs by status', 1080, 470);
    [['Open', .45, SIG], ['In progress', .7, '#FFD60A'], ['In test', .55, '#0A84FF'], ['Closed', .92, '#30D158']].forEach(([l, v, c], k) => {
      sg.fillStyle = '#8e8e93'; sg.font = F(500, 20); sg.fillText(l, 1080, 540 + k * 90);
      rr(1080, 556 + k * 90, 420, 18, 9, '#2a2b2f'); rr(1080, 556 + k * 90, 420 * v, 18, 9, c);
    });
    sg.fillStyle = '#48484a'; sg.font = F(500, 16); sg.fillText('Illustrative recreation', SW - 230, SH - 20);
  },
  payledger() {
    chrome('PayLedger — concurrency test');
    sg.fillStyle = '#F2F0EB'; sg.font = F(800, 48); sg.fillText('Double-spend test', 60, 150);
    sg.fillStyle = '#8e8e93'; sg.font = F(500, 24); sg.fillText('50 simultaneous ₹10 transfers from a ₹100 wallet', 60, 192);
    rr(60, 240, 700, 680, 22, '#1a1b1e');
    for (let i = 0; i < 50; i++) { const x = 120 + (i % 10) * 62, y = 300 + Math.floor(i / 10) * 62; sg.beginPath(); sg.arc(x, y, 22, 0, Math.PI * 2); if (i < 10) { sg.fillStyle = '#30D158'; sg.fill(); } else { sg.strokeStyle = 'rgba(255,255,255,.22)'; sg.lineWidth = 3; sg.stroke(); } }
    sg.fillStyle = '#c7c7cc'; sg.font = F(600, 24); sg.fillText('● accepted   ○ rejected: insufficient funds', 100, 650);
    sg.fillStyle = '#F2F0EB'; sg.font = F(800, 64); sg.fillText('10 / 50', 100, 760);
    sg.fillStyle = '#8e8e93'; sg.font = F(500, 24); sg.fillText('accepted with SELECT … FOR UPDATE', 100, 806);
    [['Wallet balance', '₹0.00', '#F2F0EB'], ['Money created', '₹0', '#30D158'], ['Ledger', 'Balanced', '#30D158'], ['Deadlocks', '0 / 100', '#30D158']].forEach(([l, v, c], k) => {
      const y = 240 + k * 172; rr(800, y, 740, 150, 22, '#1a1b1e');
      sg.fillStyle = '#8e8e93'; sg.font = F(600, 24); sg.fillText(l, 840, y + 56);
      sg.fillStyle = c; sg.font = F(800, 54); sg.fillText(v, 840, y + 118);
    });
  },
  scheduling() {
    chrome('Smart Scheduling — timeline');
    sg.fillStyle = '#F2F0EB'; sg.font = F(800, 48); sg.fillText('Critical path', 60, 150);
    sg.fillStyle = '#8e8e93'; sg.font = F(500, 24); sg.fillText('1,000 dependent tasks scheduled in 0.6 s · p95 under 27 ms', 60, 192);
    rr(60, 230, SW - 120, 690, 22, '#1a1b1e');
    const tasks = [['Design', 0, 3, 1], ['API', 3, 4, 1], ['Database', 3, 2, 0], ['Frontend', 7, 5, 1], ['Tests', 7, 3, 0], ['Review', 10, 2, 0], ['Launch', 12, 1, 1]];
    const x0 = 300, unit = (SW - 120 - 300 - 40) / 13;
    for (let d = 0; d <= 13; d++) { sg.strokeStyle = 'rgba(255,255,255,.06)'; sg.lineWidth = 1; sg.beginPath(); sg.moveTo(x0 + d * unit, 260); sg.lineTo(x0 + d * unit, 890); sg.stroke(); }
    tasks.forEach(([n, s, d, crit], i) => {
      const y = 290 + i * 86;
      sg.fillStyle = '#c7c7cc'; sg.font = F(600, 24); sg.fillText(n, 100, y + 34);
      rr(x0 + s * unit, y, d * unit - 8, 48, 10, crit ? SIG : 'rgba(255,255,255,.22)');
      sg.fillStyle = crit ? '#0B0B0C' : '#F2F0EB'; sg.font = F(700, 20, 'mono'); sg.fillText(d + 'd', x0 + s * unit + 16, y + 32);
    });
    sg.fillStyle = SIG; sg.font = F(600, 22); sg.fillText('■ zero slack', SW - 260, 210);
  },
  kural() {
    chrome('Kural RAG');
    sg.fillStyle = '#F2F0EB'; sg.font = F(800, 48); sg.fillText('Ask the Thirukkural', 60, 150);
    rr(60, 200, SW - 120, 92, 46, '#1a1b1e', 'rgba(255,255,255,.12)');
    sg.fillStyle = '#c7c7cc'; sg.font = F(500, 30); sg.fillText('Which kural opens the Thirukkural?', 120, 258);
    rr(SW - 250, 214, 160, 64, 32, SIG); sg.fillStyle = '#0B0B0C'; sg.font = F(800, 24); sg.fillText('Search', SW - 213, 255);
    rr(60, 330, 900, 590, 22, '#1a1b1e');
    sg.fillStyle = SIG; sg.font = F(700, 22, 'mono'); sg.fillText('KURAL 1 · CITED', 100, 390);
    sg.fillStyle = '#F2F0EB'; sg.font = F(700, 34);
    ['As the letter A is the first', 'of all letters, so the eternal', 'God is first in the world.'].forEach((t, i) => sg.fillText(t, 100, 460 + i * 52));
    sg.fillStyle = '#8e8e93'; sg.font = F(500, 22); sg.fillText('Chapter 1 · The Praise of God', 100, 650);
    sg.fillStyle = '#30D158'; sg.font = F(600, 22, 'mono'); sg.fillText('✓ citation verified in code', 100, 700);
    rr(1000, 330, 540, 590, 22, '#1a1b1e');
    sg.fillStyle = '#c7c7cc'; sg.font = F(700, 24); sg.fillText('Right verse in top 5', 1040, 390);
    [['Before', 44, 'rgba(255,255,255,.3)'], ['Hybrid search', 97, SIG]].forEach(([l, v, c], k) => {
      const y = 470 + k * 190; sg.fillStyle = '#8e8e93'; sg.font = F(500, 22); sg.fillText(l, 1040, y);
      sg.fillStyle = '#F2F0EB'; sg.font = F(800, 60); sg.fillText(v + '/100', 1040, y + 76);
      rr(1040, y + 100, 460, 16, 8, '#2a2b2f'); rr(1040, y + 100, 460 * v / 100, 16, 8, c);
    });
  },
  tests() {
    chrome('zsh — ~/projects');
    sg.font = F(500, 26, 'mono');
    const L = [['$ npm test --prefix payledger', '#79c0ff'], ['  ✓ transfer rejects insufficient funds', '#30D158'], ['  ✓ 50 concurrent transfers → 10 accepted', '#30D158'], ['  ✓ opposing transfers never deadlock', '#30D158'], ['  ✓ retry with same key charges once', '#30D158'], ['  Tests: 43 passed', '#F2F0EB'], ['', ''], ['$ npm test --prefix smart-scheduling', '#79c0ff'], ['  ✓ detects dependency cycles', '#30D158'], ['  ✓ critical path for 1,000 tasks', '#30D158'], ['  ✓ stale write returns 409', '#30D158'], ['  Tests: 135 passed', '#F2F0EB'], ['', ''], ['$ █', '#F2F0EB']];
    L.forEach(([t, c], i) => { sg.fillStyle = c; sg.fillText(t, 60, 130 + i * 56); });
  },
  contact() {
    sg.fillStyle = '#0B0B0C'; sg.fillRect(0, 0, SW, SH);
    sg.textAlign = 'center';
    sg.fillStyle = '#8e8e93'; sg.font = F(600, 28, 'mono'); sg.fillText('OPEN TO SDE-1 ROLES', SW / 2, 380);
    sg.fillStyle = '#F2F0EB'; sg.font = F(800, 64); sg.fillText('asmithagopichander@gmail.com', SW / 2, 500);
    sg.fillStyle = '#8e8e93'; sg.font = F(500, 30); sg.fillText('linkedin.com/in/asmitha-a-g  ·  github.com/assmitha2004', SW / 2, 660);
    sg.textAlign = 'left'; sg.fillStyle = SIG; sg.fillRect(SW / 2 - 80, 560, 160, 6);
  }
};
let curScreen = '', screenFade = 1;
function setScreen(name) {
  if (name === curScreen) return;
  curScreen = name; screenFade = reduce ? 1 : 0;
  SCREENS[name](); screenTex.needsUpdate = true;
}
setScreen('boot');

/* =================================================================== poses: [x, y, z, rotY, rotX, lidOpen] */
const POSES_D = {
  hero:     [0.5, 0.0, 0.25, -0.8, 0.0, 0.22],
  about:    [0.5, 0.0, 0.0, -0.46, 0.0, 1.92],
  work:     [0.52, 0.0, 0.05, -0.32, 0.0, 1.92],
  projects: [0.46, 0.0, 0.1, -0.2, 0.0, 1.92],
  how:      [-0.5, 0.0, 0.0, 0.5, 0.0, 1.92],
  contact:  [0.0, 0.0, -1.6, 0.5, 0.0, 0.04],
};
const POSES_M = {
  hero:     [0.0, 0.0, -0.1, -0.7, 0.0, 0.22],
  about:    [0.0, 0.0, -0.2, -0.35, 0.0, 1.92],
  work:     [0.0, 0.0, -0.2, -0.2, 0.0, 1.92],
  projects: [0.0, 0.0, -0.2, 0.0, 0.0, 1.92],
  how:      [0.0, 0.0, -0.2, 0.35, 0.0, 1.92],
  contact:  [0.0, 0.0, -1.6, 0.5, 0.0, 0.04],
};
const SCREEN_FOR = { hero: 'boot', about: 'code', work: 'dashboard', projects: null, how: 'tests', contact: 'contact' };
const cur = [...(mobile ? POSES_M : POSES_D).hero];
const tmp = new Array(6);
const smooth = t => t * t * (3 - 2 * t);
function scrollState() {
  const mid = scrollY + innerHeight * 0.5;
  const centers = sections.map(s => s.offsetTop + s.offsetHeight / 2);
  let i = 0;
  while (i < centers.length - 1 && mid > centers[i + 1]) i++;
  const j = Math.min(i + 1, centers.length - 1);
  let f = j === i ? 0 : (mid - centers[i]) / (centers[j] - centers[i]);
  return { i, j, f: Math.max(0, Math.min(1, f)) };
}

/* =================================================================== post */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.16, 0.5, 0.97));
composer.addPass(new OutputPass());

/* =================================================================== loop */
const mouse = new THREE.Vector2();
addEventListener('pointermove', e => mouse.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5), { passive: true });
const clock = new THREE.Clock();
let firstFrame = true;
function frame(time) {
  if (lenis) lenis.raf(time);
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  const P = mobile ? POSES_M : POSES_D;
  const { i, j, f } = scrollState();
  const a = P[sections[i].dataset.pose], b = P[sections[j].dataset.pose], e = smooth(f);
  for (let k = 0; k < 6; k++) tmp[k] = a[k] + (b[k] - a[k]) * e;
  const k = reduce ? 1 : 1 - Math.pow(0.002, dt);
  for (let q = 0; q < 6; q++) cur[q] += (tmp[q] - cur[q]) * k;

  const sway = reduce ? 0 : 1;
  pivot.position.set(cur[0], cur[1] + Math.sin(t * 0.8) * 0.006 * sway, cur[2]);
  pivot.rotation.set(cur[4] + mouse.y * 0.05 * sway, cur[3] + (mouse.x * 0.12 + Math.sin(t * 0.35) * 0.02) * sway, 0);
  lid.rotation.x = -cur[5];

  const nearIdx = f < 0.5 ? i : j, near = sections[nearIdx].dataset.pose;
  setScreen(near === 'projects' ? PROJECTS[projIdx].id : SCREEN_FOR[near]);
  screenFade = Math.min(1, screenFade + dt * 3);
  const open = Math.min(1, cur[5] / 1.9);
  screenMat.color.setScalar(0.78 * screenFade * (0.3 + 0.7 * open));
  screenLight.intensity = 0.06 * open * screenFade;
  indexLinks.forEach(l => l.classList.toggle('on', l.dataset.for === sections[nearIdx].id));

  camera.position.copy(mobile ? camM : camD); camera.lookAt(mobile ? lookM : lookD);
  key.target.position.set(pivot.position.x, 0, pivot.position.z);
  rim.target.position.set(pivot.position.x, 0.2, pivot.position.z);
  pool.position.set(pivot.position.x, 0.001, pivot.position.z);

  composer.render();
  if (firstFrame) { firstFrame = false; finishLoader(); }
  requestAnimationFrame(frame);
}

addEventListener('resize', () => {
  mobile = mobileQ.matches;
  camera.aspect = innerWidth / innerHeight; camera.fov = mobile ? 34 : 28; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
});
if (document.fonts) document.fonts.ready.then(() => { const c = curScreen; curScreen = ''; setScreen(c); });
requestAnimationFrame(frame);
