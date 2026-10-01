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
};

export function mountWorld(container, handlers) {
  Object.assign(world, handlers);
  world.root = el('<div id="world"></div>');
  container.appendChild(world.root);
  setupDrag();
  window.addEventListener('resize', layout);
  requestAnimationFrame(blinkLoop);
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

export function lanaAnim(cls, ms = 0) {
  if (!world.lana) return;
  world.lana.classList.remove('busy', 'joy', 'wave', 'rest', 'away');
  if (cls) world.lana.classList.add(cls);
  if (ms) setTimeout(() => world.lana && world.lana.classList.remove(cls), ms);
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

function blinkLoop() {
  const doBlink = () => {
    if (world.lana) {
      world.lana.classList.add('blink');
      setTimeout(() => world.lana && world.lana.classList.remove('blink'), 200);
    }
    setTimeout(doBlink, 2200 + Math.random() * 3800);
  };
  setTimeout(doBlink, 1500);
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
  if (world.lana) place(world.lana, world.lanaX, LANA_H, LANA_W);
  for (const n of world.inner.querySelectorAll('.actor.npc')) {
    const h = +n.dataset.h;
    place(n, +n.dataset.x, h, (h * 200) / 450);
    n.style.top = (floor - 20 - h) * s + 'px';
  }
  if (world.pet) place(world.pet, world.petX, 135, 148);
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
}

export function worldToScreen(x, y) {
  return { x: (x - world.camX) * world.scale, y: y * world.scale };
}

export function lanaScreenPos() {
  return worldToScreen(world.lanaX, world.scene.floor - LANA_H - 20);
}

function setupDrag() {
  let startX = 0;
  let startCam = 0;
  let moved = false;
  let down = false;
  world.root.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.hotspot, .actor.pet, .actor.npc')) return;
    down = true;
    moved = false;
    startX = e.clientX;
    startCam = world.camX;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 8) {
      moved = true;
      world.dragging = true;
      world.root.classList.add('dragging');
      world.camTarget = null;
      world.camX = startCam - dx / world.scale;
      applyCamera();
    }
  });
  window.addEventListener('pointerup', (e) => {
    if (!down) return;
    down = false;
    world.root.classList.remove('dragging');
    setTimeout(() => (world.dragging = false), 50);
    if (!moved && e.target.closest && e.target.closest('#world') && !e.target.closest('.hotspot, .actor.pet, .actor.npc')) {
      const rect = world.root.getBoundingClientRect();
      const wx = world.camX + (e.clientX - rect.left) / world.scale;
      const wy = (e.clientY - rect.top) / world.scale;
      if (wy > 760) {
        const ripple = el('<div class="tap-ripple"></div>');
        ripple.style.left = wx * world.scale + 'px';
        ripple.style.top = Math.max(wy, 790) * world.scale + 'px';
        world.inner.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
        world.onFloor && world.onFloor(Math.max(90, Math.min(world.scene.width - 90, wx)));
      }
    }
  });
}

// ---------------------------------------------------------------- walking
export function walkTo(x) {
  if (world.walking) world.walking.cancel();
  const from = world.lanaX;
  const dist = Math.abs(x - from);
  if (dist < 8) return Promise.resolve(true);
  world.facing = x < from ? -1 : 1;
  world.lana.classList.toggle('face-left', world.facing < 0);
  world.lana.classList.add('walking');
  lanaAnim(null);
  return new Promise((resolve) => {
    let cancelled = false;
    let stepAcc = 0;
    world.walking = {
      cancel() {
        cancelled = true;
        resolve(false);
      },
      update(dt) {
        if (cancelled) return true;
        const d = WALK_SPEED * dt;
        stepAcc += d;
        if (stepAcc > 115) {
          stepAcc = 0;
          sfx('step');
        }
        const remaining = x - world.lanaX;
        if (Math.abs(remaining) <= d) {
          world.lanaX = x;
          world.lana.classList.remove('walking');
          S.x = x;
          resolve(true);
          return true;
        }
        world.lanaX += Math.sign(remaining) * d;
        return false;
      },
    };
  }).finally(() => {
    if (world.lana) world.lana.classList.remove('walking');
  });
}

export function updateWorld(dt) {
  if (!world.scene) return;
  if (world.walking && world.walking.update(dt)) world.walking = null;
  // camera follow
  if (!world.dragging) {
    const vw = viewWidthUnits();
    const margin = vw * 0.28;
    let target = world.camTarget;
    if (world.walking || target == null) {
      if (world.lanaX - world.camX < margin) target = world.lanaX - margin;
      else if (world.lanaX - world.camX > vw - margin) target = world.lanaX - (vw - margin);
    }
    if (target != null) {
      target = clampCam(target);
      world.camX += (target - world.camX) * Math.min(1, dt * 5);
      if (Math.abs(target - world.camX) < 0.5) world.camTarget = null;
      applyCamera();
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
  if (world.lana) world.lana.style.left = (world.lanaX - LANA_W / 2) * s + 'px';
  if (world.pet) world.pet.style.left = (world.petX - 74) * s + 'px';
  // mood colour of the plumbob
  if (world.lana) {
    const m = mood();
    const col = m > 66 ? '#5ee08a' : m > 40 ? '#ffd23d' : m > 22 ? '#ff9a3c' : '#ff4f6a';
    world.lana.style.setProperty('--plumb', col);
  }
  paintBackground();
  updateTint();
  if (world.weatherKey !== S.day) buildWeather();
  refreshLana();
  markQuestTarget();
}

let questKey = '';
function markQuestTarget() {
  const q = currentQuest();
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
