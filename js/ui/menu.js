// Sims-style interaction menu that pops up over a tapped object.
import { ACTIONS } from '../data/actions.js';
import { NEEDS } from '../core/state.js';
import { durationLabel, money } from '../core/time.js';
import { actionAvailability, doAction, activePet, feedPet, petPet, playPetGame } from '../game.js';
import { PET_TYPES } from '../art/pets.js';
import { el, app, esc } from './dom.js';
import { sfx } from '../audio.js';

const NEED_ICON = Object.fromEntries(NEEDS.map((n) => [n.id, n.icon]));
const SKILL_ICON = { dental: '🦷', cooking: '🍳', charm: '✨', fitness: '🏃‍♀️' };
let current = null;

export function closeMenu() {
  if (current) {
    current.remove();
    current = null;
  }
}

function meta(a) {
  const parts = [];
  if (a.minutes && !a.instant) parts.push(`⏱ ${durationLabel(a.minutes)}`);
  if (a.cost) parts.push(`<span class="minus">−${money(a.cost)}</span>`);
  const eff = Object.entries(a.effects || {}).filter(([, v]) => v > 0).sort((x, y) => y[1] - x[1]).slice(0, 3);
  for (const [k] of eff) parts.push(`<span class="plus">+${NEED_ICON[k]}</span>`);
  for (const k of Object.keys(a.xp || {})) parts.push(`<span class="plus">+${SKILL_ICON[k]}</span>`);
  if (a.desc && !parts.length) parts.push(esc(a.desc));
  else if (a.desc && a.minigame) parts.push(esc(a.desc.replace('Мини-игра · ', '').replace('Мини-игра', '')));
  return parts.join('');
}

function position(menu, rect) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const mw = menu.offsetWidth;
  const mh = menu.offsetHeight;
  let x = rect.left + rect.width / 2 - mw / 2;
  x = Math.max(12, Math.min(W - mw - 12, x));
  let y = rect.top - mh - 12;
  if (y < 70) y = Math.min(H - mh - 100, rect.bottom + 12);
  y = Math.max(70, y);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
}

function open(title, icon, items, rect) {
  closeMenu();
  const wrap = el('<div><div class="menu-backdrop"></div></div>');
  const menu = el(`<div class="action-menu"><h4>${icon} ${esc(title)}</h4></div>`);
  for (const it of items) {
    const b = el(`<button class="act ${it.disabled ? 'disabled' : ''}">
        <div class="a-ico">${it.icon}</div>
        <div style="min-width:0"><div class="a-name">${esc(it.name)}</div><div class="a-meta">${it.meta || ''}</div></div>
        ${it.tag ? `<span class="a-mini">${it.tag}</span>` : ''}
      </button>`);
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
      it.run();
    });
    menu.appendChild(b);
  }
  wrap.appendChild(menu);
  wrap.querySelector('.menu-backdrop').addEventListener('click', () => {
    sfx('click');
    closeMenu();
  });
  app().appendChild(wrap);
  current = wrap;
  position(menu, rect);
}

export function showActionMenu(hotspot, rect) {
  const items = hotspot.actions
    .filter((id) => ACTIONS[id])
    .map((id) => {
      const a = ACTIONS[id];
      const av = actionAvailability(id);
      return {
        icon: a.icon,
        name: a.name,
        meta: av.ok ? meta(a) : esc(av.reason),
        disabled: !av.ok,
        tag: a.minigame ? 'игра' : '',
        run: () => {
          sfx('click');
          doAction(id, hotspot);
        },
      };
    });
  open(hotspot.label, hotspot.icon, items, rect);
}

export function showPetMenu(pet, rect) {
  const t = PET_TYPES[pet.type];
  const items = [
    { icon: '🥣', name: 'Покормить', meta: `Сытость ${Math.round(pet.hunger)}%`, run: () => feedPet(pet) },
    { icon: '🤲', name: 'Погладить', meta: `Радость ${Math.round(pet.joy)}%`, run: () => petPet(pet) },
    { icon: '🎾', name: 'Поиграть', meta: 'Ловить вкусняшки', tag: 'игра', run: () => playPetGame() },
  ];
  open(`${pet.name} · ${t.name}`, t.emoji, items, rect);
}

export function menuIsOpen() {
  return !!current;
}

export { activePet };
