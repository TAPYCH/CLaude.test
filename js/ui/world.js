// Scene view: background, camera, hotspots, Lana / NPC / pet actors.
import { renderLana } from '../art/character.js';
import { renderPet } from '../art/pets.js';
import { SCENES } from '../data/scenes.js';
import { S, mood } from '../core/state.js';
import { currentQuest } from '../core/progress.js';
import { dayPhase, season, weatherOf } from '../core/time.js';
import { el, $ } from './dom.js';
import { sfx } from '../audio.js';

const LANA_H = 440; // world units
const LANA_W = (LANA_H * 200) / 450;
const WALK_SPEED = 430; // units per second

export const world = {
  root: null,
  inner: null,
  scene: null,
  scale: 1,
  camX: 0,
  camTarget: null,
  lana: null,
  lanaX: 1000,
  facing: 1,
  walking: null,
  pet: null,
  petX: 0,
  expr: 'neutral',
  exprOverride: null,
  outfitKey: '',
  phaseName: '',
  onHotspot: null,
  onPet: null,
  onFloor: null,
  dragging: false,
  follow: true,
  camV: 0,
  walkV: 0,
  holdWalk: false,
  pointerX: 0,
};

export function mountWorld(container, handlers) {
  Object.assign(world, handlers);
  world.root = el('<div id="world"></div>');
  container.appendChild(world.root);
  setupDrag();
  buildEdges();
  window.addEventListener('resize', layout);
}

export function loadScene(id, x = null) {
  const sc = SCENES[id];
  world.scene = sc;
  world.root.innerHTML = '';
  world.inner = el(`<div class="world-inner">
      <div class="bg"></div>
      <div class="tint"></div>
      <div class="weather"></div>
      <div class="hotspots"></div>
    </div>`);
  world.root.appendChild(world.inner);
  world.lanaX = x ?? S.x ?? sc.spawn;
  if (world.lanaX < 80 || world.lanaX > sc.width - 80) world.lanaX = sc.spawn;
  world.phaseName = '';
  paintBackground(true);
  buildHotspots();
  buildNpcs();
  buildLana();
  buildPet();
  buildWeather();
  layout();
  centerCamera(true);
  world.follow = false;
  world.camV = 0;
}

function paintBackground(force = false) {
  const sc = world.scene;
  const ph = dayPhase(S.minutes);
  const key = ph.name + season(S.day);
  if (!force && key === world.phaseName) return;
  world.phaseName = key;
  $('.bg', world.inner).innerHTML = `<svg viewBox="0 0 ${sc.width} 1000" preserveAspectRatio="xMinYMin slice">${sc.paint({ phase: ph.name, season: season(S.day), S })}</svg>`;
}

function updateTint() {
  const ph = dayPhase(S.minutes);
  const t = $('.tint', world.inner);
  if (!t) return;
  const indoor = world.scene.indoor !== false;
  const a = ph.dark * (indoor ? 0.32 : 0.5);
  const col = ph.name === 'sunset' || ph.name === 'dawn' ? `rgba(255,150,110,${0.18 + a})` : `rgba(40,40,120,${a})`;
  t.style.background = col;
}

function buildWeather() {
  const box = $('.weather', world.inner);
  box.innerHTML = '';
  const se = season(S.day);
  if (world.scene.indoor !== false) return;
  const wx = weatherOf(S.day, world.scene.city);
  world.weatherKey = S.day;
  if (wx === 'rain') {
    for (let i = 0; i < 70; i++) {
      const f = document.createElement('u');
      Object.assign(f.style, { left: Math.random() * 110 - 5 + '%', animationDuration: 0.5 + Math.random() * 0.35 + 's', animationDelay: -Math.random() * 2 + 's', opacity: 0.4 + Math.random() * 0.5 });
      box.appendChild(f);
    }
    box.style.background = 'rgba(60,70,110,.18)';
    return;
  }
  box.style.background = '';
  if (wx === 'snow') {
    for (let i = 0; i < 50; i++) {
      const f = document.createElement('i');
      const s = 3 + Math.random() * 6;
      Object.assign(f.style, { left: Math.random() * 100 + '%', width: s + 'px', height: s + 'px', animationDuration: 5 + Math.random() * 6 + 's', animationDelay: -Math.random() * 10 + 's' });
      f.style.setProperty('--dx', (Math.random() * 60 - 20) + 'px');
      box.appendChild(f);
    }
  } else if (se === 'autumn' && world.scene.city === 'moscow') {
    const cols = ['#ff9a3c', '#f2c14e', '#e76f51', '#ffb347'];
    for (let i = 0; i < 14; i++) {
      const f = document.createElement('b');
      Object.assign(f.style, { left: Math.random() * 100 + '%', background: cols[i % 4], animationDuration: 7 + Math.random() * 6 + 's', animationDelay: -Math.random() * 12 + 's' });
      f.style.setProperty('--dx', (Math.random() * -160) + 'px');
      box.appendChild(f);
    }
  }
}

function buildHotspots() {
  const box = $('.hotspots', world.inner);
  box.innerHTML = '';
  for (const h of world.scene.hotspots) {
    const b = el(`<button class="hotspot ${h.npc ? 'npc-hs' : ''}" aria-label="${h.label}" data-id="${h.id}">${h.icon}<span class="hs-label">${h.label}</span></button>`);
    b.style.left = `${(h.x / world.scene.width) * 100}%`;
    b.style.top = `${h.y / 10}%`;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      sfx('tap');
      world.onHotspot && world.onHotspot(h, b.getBoundingClientRect());
    });
    box.appendChild(b);
  }
}

function buildNpcs() {
  for (const n of world.scene.npcs || []) {
    const node = el(`<div class="actor npc" data-npc="${n.id}"><div class="actor-flip">${renderLana({ outfit: n.outfit, expr: n.expr || 'happy' })}</div></div>`);
    node.dataset.x = n.x;
    node.dataset.h = (n.h || 1) * LANA_H;
    if (n.flip) node.classList.add('face-left');
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const h = world.scene.hotspots.find((hh) => hh.id === n.hotspot);
      if (h) world.onHotspot && world.onHotspot(h, node.getBoundingClientRect());
    });
    world.inner.appendChild(node);
  }
}

function buildLana() {
  world.lana = el(`<div class="actor lana"><div class="overhead"><svg class="plumbob" viewBox="0 0 26 42"><defs><linearGradient id="pbG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".4" stop-color="var(--plumb,#5ee08a)"/><stop offset="1" stop-color="var(--plumb,#5ee08a)"/></linearGradient></defs><path d="M13,0 L26,21 L13,42 L0,21 Z" fill="url(#pbG)" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="M13,0 L13,42 M0,21 L26,21" stroke="#fff" stroke-opacity=".5" stroke-width="1"/></svg></div><div class="actor-flip"></div></div>`);
  world.inner.appendChild(world.lana);
  world.outfitKey = '';
  refreshLana(true);
}

export function refreshLana(force = false) {
  if (!world.lana) return;
  const expr = world.exprOverride || exprFromNeeds();
  const key = JSON.stringify(S.outfit) + expr;
  if (!force && key === world.outfitKey) return;
  world.outfitKey = key;
  world.expr = expr;
  $('.actor-flip', world.lana).innerHTML = renderLana({ outfit: S.outfit, expr });
}

function exprFromNeeds() {
  const m = mood();
  if (S.needs.energy < 18) return 'tired';
  if (m > 72) return 'happy';
  if (m > 45) return 'neutral';
  if (m > 28) return 'tired';
  return 'sad';
}

export function setExpression(expr, ms = 2200) {
  world.exprOverride = expr;
  refreshLana();
  clearTimeout(world._exprT);
  if (ms)
    world._exprT = setTimeout(() => {
      world.exprOverride = null;
      refreshLana();
    }, ms);
}

const ANIM_CLASSES = ['busy', 'joy', 'wave', 'rest', 'away'];
export function lanaAnim(cls, ms = 0) {
  if (!world.lana) return;
  const node = world.lana;
  for (const c of [...node.classList]) if (ANIM_CLASSES.includes(c) || c.startsWith('pose-') || c.startsWith('idle-')) node.classList.remove(c);
  if (cls) node.classList.add(cls);
  world.idleT = 0;
  if (ms) setTimeout(() => node.classList.remove(cls), ms);
}

/** Show an item in Lana's hands during an action (emoji prop + motion style). */
export function setProp(emoji, kind = 'phone') {
  if (!world.lana) return;
  const old = world.lana.querySelector('.prop');
  if (old) old.remove();
  if (!emoji) return;
  world.lana.appendChild(el(`<div class="prop p-${kind}">${emoji}</div>`));
}

export function cameraFlash() {
  const f = el('<div class="flash"></div>');
  document.getElementById('app').appendChild(f);
  setTimeout(() => f.remove(), 500);
}

export function heartsAt(x, y, n = 4, icon = '❤️') {
  if (!world.inner) return;
  for (let i = 0; i < n; i++) {
    const h = el(`<div class="heart-pop">${icon}</div>`);
    h.style.left = x * world.scale + (Math.random() - 0.5) * 30 + 'px';
    h.style.top = y * world.scale + 'px';
    h.style.animationDelay = i * 0.12 + 's';
    h.style.setProperty('--dx', (Math.random() - 0.5) * 60 + 'px');
    world.inner.appendChild(h);
    setTimeout(() => h.remove(), 1600);
  }
}

const IDLE = ['idle-stretch', 'idle-look', 'idle-sway', 'idle-wave', 'idle-heel', 'idle-look', 'idle-sway'];
const IDLE_MS = { 'idle-stretch': 1900, 'idle-look': 2700, 'idle-sway': 2500, 'idle-wave': 2200, 'idle-heel': 1300 };
function idleVariety(dt) {
  const node = world.lana;
  if (!node || world.walking) return;
  if ([...node.classList].some((c) => c.startsWith('pose-') || ANIM_CLASSES.includes(c) || c.startsWith('idle-'))) {
    world.idleT = 0;
    return;
  }
  world.idleT = (world.idleT || 0) + dt;
  if (world.idleT > 7 + Math.random() * 6) {
    world.idleT = 0;
    const c = IDLE[Math.floor(Math.random() * IDLE.length)];
    node.classList.add(c);
    setTimeout(() => node.classList.remove(c), IDLE_MS[c]);
  }
}

function dustPuff(x) {
  if (!world.inner) return;
  for (const dx of [-14, 14]) {
    const d = el('<div class="dust"></div>');
    d.style.left = (x + dx * 2) * world.scale + 'px';
    d.style.top = (world.scene.floor - 4) * world.scale + 'px';
    d.style.setProperty('--dx', (world.facing > 0 ? -12 : 12) + 'px');
    world.inner.appendChild(d);
    setTimeout(() => d.remove(), 650);
  }
}

function buildPet() {
  world.pet = null;
  const p = S.pets.find((pp) => pp.id === S.activePet) || S.pets[0];
  if (!p) return;
  world.pet = el(`<div class="actor pet" data-type="${p.type}"><div class="actor-flip">${renderPet(p.type)}</div></div>`);
  world.petX = world.lanaX - 160;
  world.pet.addEventListener('click', (e) => {
    e.stopPropagation();
    world.onPet && world.onPet(p, world.pet.getBoundingClientRect());
  });
  world.inner.appendChild(world.pet);
}
export function rebuildPet() {
  if (world.pet) world.pet.remove();
  buildPet();
  layout();
}

// ---------------------------------------------------------------- layout & camera
export function layout() {
  if (!world.inner || !world.scene) return;
  const vh = world.root.clientHeight;
  world.scale = vh / 1000;
  world.inner.style.width = world.scene.width * world.scale + 'px';
  const s = world.scale;
  const floor = world.scene.floor;
  const place = (node, x, hUnits, wUnits) => {
    node.style.height = hUnits * s + 'px';
    node.style.width = wUnits * s + 'px';
    node.style.left = (x - wUnits / 2) * s + 'px';
    node.style.top = (floor - hUnits) * s + 'px';
    node.style.bottom = 'auto';
  };
  if (world.lana) {
    place(world.lana, world.lanaX, LANA_H, LANA_W);
    world.lana.style.left = '0px';
    world.lana.style.transform = `translate3d(${(world.lanaX - LANA_W / 2) * s}px,0,0)`;
    world.lana.style.setProperty('--s', ((LANA_H * s) / 420).toFixed(3));
  }
  for (const n of world.inner.querySelectorAll('.actor.npc')) {
    const h = +n.dataset.h;
    place(n, +n.dataset.x, h, (h * 200) / 450);
    n.style.top = (floor - 20 - h) * s + 'px';
  }
  if (world.pet) {
    place(world.pet, world.petX, 135, 148);
    world.pet.style.left = '0px';
    world.pet.style.transform = `translate3d(${(world.petX - 74) * s}px,0,0)`;
  }
  applyCamera();
}

function viewWidthUnits() {
  return world.root.clientWidth / world.scale;
}

function clampCam(x) {
  const vw = viewWidthUnits();
  const W = world.scene.width;
  if (vw >= W) return (W - vw) / 2;
  return Math.max(0, Math.min(W - vw, x));
}

export function centerCamera(instant = false) {
  const target = clampCam(world.lanaX - viewWidthUnits() / 2);
  if (instant) {
    world.camX = target;
    applyCamera();
  } else world.camTarget = target;
}

function applyCamera() {
  world.camX = clampCam(world.camX);
  world.inner.style.transform = `translate3d(${-world.camX * world.scale}px,0,0)`;
  if (world.edges) {
    const max = world.scene.width - viewWidthUnits();
    world.edges[0].classList.toggle('on', world.camX > 20);
    world.edges[1].classList.toggle('on', world.camX < max - 20);
  }
}

/** Edge chevrons: show there is more room and walk Lana that way. */
function buildEdges() {
  world.edges = [-1, 1].map((dir) => {
    const b = el(`<button class="world-edge ${dir < 0 ? 'l' : 'r'}" aria-label="${dir < 0 ? 'Идти влево' : 'Идти вправо'}"><span>${dir < 0 ? '‹' : '›'}</span></button>`);
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const vw = viewWidthUnits();
      const x = Math.max(90, Math.min(world.scene.width - 90, world.lanaX + dir * vw * 0.7));
      world.onFloor && world.onFloor(x);
    });
    b.addEventListener('pointerdown', (e) => e.stopPropagation());
    world.root.parentNode.appendChild(b);
    return b;
  });
}

export function worldToScreen(x, y) {
  return { x: (x - world.camX) * world.scale, y: y * world.scale };
}

export function lanaScreenPos() {
  return worldToScreen(world.lanaX, world.scene.floor - LANA_H - 20);
}

function setupDrag() {
  // Gestures: drag = look around (with inertia) · tap = walk there · hold = keep walking towards the finger.
  let startX = 0;
  let startCam = 0;
  let moved = false;
  let down = false;
  let lastX = 0;
  let lastT = 0;
  let vel = 0;
  let holdTimer = 0;
  const destAt = (clientX) => {
    const rect = world.root.getBoundingClientRect();
    return Math.max(90, Math.min(world.scene.width - 90, world.camX + (clientX - rect.left) / world.scale));
  };
  world.root.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.hotspot, .actor.pet, .actor.npc')) return;
    if (e.button != null && e.button > 0) return;
    down = true;
    moved = false;
    startX = lastX = e.clientX;
    lastT = performance.now();
    vel = 0;
    startCam = world.camX;
    world.camV = 0;
    world.pointerX = e.clientX;
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
      if (!down || moved) return;
      world.holdWalk = true;
      world.onFloor && world.onFloor(destAt(world.pointerX));
    }, 280);
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    world.pointerX = e.clientX;
    if (world.holdWalk) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 9) {
      moved = true;
      clearTimeout(holdTimer);
      world.dragging = true;
      world.follow = false;
      world.root.classList.add('dragging');
      world.camTarget = null;
    }
    if (moved) {
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      vel = vel * 0.6 + ((-(e.clientX - lastX) / world.scale) / dt) * 1000 * 0.4;
      lastX = e.clientX;
      lastT = now;
      world.camX = startCam - dx / world.scale;
      applyCamera();
    }
  });
  const end = (e) => {
    if (!down) return;
    down = false;
    clearTimeout(holdTimer);
    world.root.classList.remove('dragging');
    if (world.holdWalk) {
      world.holdWalk = false;
      // ease to a stop just ahead instead of freezing mid-step
      if (world.walking && world.walking.retarget) world.walking.retarget(world.lanaX + world.facing * 50);
      return;
    }
    if (moved) {
      world.camV = performance.now() - lastT < 80 ? Math.max(-2600, Math.min(2600, vel)) : 0;
      setTimeout(() => (world.dragging = false), 30);
      return;
    }
    world.dragging = false;
    if (e.type === 'pointerup' && e.target.closest && e.target.closest('#world') && !e.target.closest('.hotspot, .actor.pet, .actor.npc')) {
      const x = destAt(e.clientX);
      const ripple = el('<div class="tap-ripple"></div>');
      ripple.style.left = x * world.scale + 'px';
      ripple.style.top = (world.scene.floor - 40) * world.scale + 'px';
      world.inner.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
      world.onFloor && world.onFloor(x);
    }
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
}

// ---------------------------------------------------------------- walking
/** Walk to x with smooth acceleration/braking. A floor walk can be re-targeted while moving. */
export function walkTo(x) {
  if (world.walking && world.walking.retarget && world.walking.free && world.holdWalk) {
    world.walking.retarget(x);
    return world.walking.promise;
  }
  if (world.walking) world.walking.cancel();
  if (Math.abs(x - world.lanaX) < 8) return Promise.resolve(true);
  let dest = x;
  const face = () => {
    const f = dest < world.lanaX ? -1 : 1;
    if (f !== world.facing) {
      world.facing = f;
      world.lana.classList.toggle('face-left', f < 0);
    }
  };
  face();
  world.lana.classList.add('walking');
  world.follow = true;
  world.camTarget = null;
  lanaAnim(null);
  let resolveFn;
  const promise = new Promise((resolve) => (resolveFn = resolve));
  let cancelled = false;
  let stepAcc = 0;
  let v = world.walkV || 0;
  const w = {
    free: true,
    promise,
    cancel() {
      cancelled = true;
      world.walkV = 0;
      resolveFn(false);
    },
    retarget(nx) {
      dest = Math.max(90, Math.min(world.scene.width - 90, nx));
      if (Math.abs(dest - world.lanaX) > 4) face();
    },
    update(dt) {
      if (cancelled) return true;
      const remaining = dest - world.lanaX;
      const dir = Math.sign(remaining);
      if (dir && dir !== world.facing) face();
      // accelerate, then brake so she stops exactly on the spot
      v = Math.min(WALK_SPEED, v + WALK_SPEED * 6 * dt);
      v = Math.min(v, Math.sqrt(2 * WALK_SPEED * 5 * Math.abs(remaining)) + 40);
      const d = v * dt;
      stepAcc += d;
      if (stepAcc > 120) {
        stepAcc = 0;
        sfx('step');
        if (world.scene.indoor === false) dustPuff(world.lanaX);
      }
      if (Math.abs(remaining) <= Math.max(d, 1.5)) {
        if (world.holdWalk) return false; // finger still down: wait for a new target
        world.lanaX = dest;
        world.walkV = 0;
        world.lana.classList.remove('walking');
        S.x = dest;
        resolveFn(true);
        return true;
      }
      world.lanaX += dir * d;
      return false;
    },
  };
  world.walking = w;
  return promise.finally(() => {
    if (world.lana && world.walking !== w) return;
    if (world.lana) world.lana.classList.remove('walking');
  });
}

export function updateWorld(dt) {
  if (!world.scene) return;
  if (world.walking && world.walking.update(dt)) world.walking = null;
  // hold-to-walk: keep steering towards the finger as the camera moves
  if (world.holdWalk && world.walking && world.walking.retarget) {
    const rect = world.root.getBoundingClientRect();
    world.walking.retarget(world.camX + (world.pointerX - rect.left) / world.scale);
  }
  // camera: explicit target → follow Lana while she walks (looking ahead) → inertia after a swipe
  if (!world.dragging) {
    const vw = viewWidthUnits();
    let target = world.camTarget;
    if (target == null && world.follow) {
      // keep settling after she stops; a user swipe (follow=false) is never fought
      const lead = world.facing * vw * (vw < 700 ? 0.16 : 0.1);
      target = world.lanaX - vw / 2 + lead;
    }
    if (target != null) {
      target = clampCam(target);
      const k = 1 - Math.exp(-dt * (world.camTarget != null ? 6 : 3.2));
      world.camX += (target - world.camX) * k;
      if (world.camTarget != null && Math.abs(target - world.camX) < 0.5) world.camTarget = null;
      world.camV = 0;
      if (!world.walking && Math.abs(target - world.camX) < 0.3) world.follow = false;
      applyCamera();
    } else if (world.camV) {
      world.camX += world.camV * dt;
      world.camV *= Math.exp(-dt * 4.5);
      if (Math.abs(world.camV) < 8) world.camV = 0;
      const before = world.camX;
      applyCamera();
      if (world.camX !== before) world.camV = 0; // hit the edge
    }
  }
  // pet follows
  if (world.pet) {
    const want = world.lanaX - world.facing * 170;
    const diff = want - world.petX;
    if (Math.abs(diff) > 40) {
      world.petX += Math.sign(diff) * Math.min(Math.abs(diff), (WALK_SPEED + 40) * dt);
      world.pet.classList.toggle('face-left', diff < 0);
      world.pet.classList.add('hop');
    } else world.pet.classList.remove('hop');
  }
  // positions
  const s = world.scale;
  // compositor-only movement (no layout per frame)
  if (world.lana) world.lana.style.transform = `translate3d(${((world.lanaX - LANA_W / 2) * s).toFixed(1)}px,0,0)`;
  if (world.pet) world.pet.style.transform = `translate3d(${((world.petX - 74) * s).toFixed(1)}px,0,0)`;
  // mood colour of the plumbob
  if (world.lana) {
    const m = mood();
    const col = m > 66 ? '#5ee08a' : m > 40 ? '#ffd23d' : m > 22 ? '#ff9a3c' : '#ff4f6a';
    world.lana.style.setProperty('--plumb', col);
  }
  idleVariety(dt);
  paintBackground();
  updateTint();
  if (world.weatherKey !== S.day) buildWeather();
  refreshLana();
  markQuestTarget();
}

let questKey = '';
function markQuestTarget() {
  const q = currentQuest();
  // point the edge chevron towards an off-screen quest target
  if (world.edges) {
    let dir = 0;
    if (q && q.target && q.target.scene === world.scene.id) {
      const hs = world.scene.hotspots.find((h) => h.id === q.target.hotspot);
      if (hs) {
        const vw = viewWidthUnits();
        if (hs.x < world.camX + 40) dir = -1;
        else if (hs.x > world.camX + vw - 40) dir = 1;
      }
    }
    world.edges[0].classList.toggle('quest', dir < 0);
    world.edges[1].classList.toggle('quest', dir > 0);
  }
  const key = (q ? q.id : '') + world.scene.id;
  if (key === questKey) return;
  questKey = key;
  world.inner.querySelectorAll('.hotspot.quest-target').forEach((h) => h.classList.remove('quest-target'));
  if (q && q.target && q.target.scene === world.scene.id) {
    const h = world.inner.querySelector(`.hotspot[data-id="${q.target.hotspot}"]`);
    if (h) h.classList.add('quest-target');
  }
}

export function setOverhead({ thought = null, progress = null } = {}) {
  if (!world.lana) return;
  const oh = $('.overhead', world.lana);
  let th = $('.thought', world.lana);
  if (thought) {
    if (!th) {
      th = el('<div class="thought"></div>');
      world.lana.appendChild(th);
    }
    if (th.textContent !== thought) th.textContent = thought;
  } else if (th) th.remove();
  let pr = $('.act-progress', world.lana);
  if (progress != null) {
    if (!pr) {
      pr = el('<div class="act-progress"><i></i></div>');
      world.lana.appendChild(pr);
    }
    pr.firstChild.style.width = Math.round(progress * 100) + '%';
    oh.style.opacity = '0';
  } else {
    if (pr) pr.remove();
    oh.style.opacity = '';
  }
}

export function hideHotspots(hide) {
  world.root && world.root.classList.toggle('hotspots-hidden', hide);
}
