// Persistent game state + helpers. Single source of truth: `S`.
import { DEFAULT_OUTFIT } from '../data/items.js';
import { bus } from './bus.js';
import { QUESTS, LEGACY_ORDER } from '../data/quests.js';

const KEY = 'lana-life-save-v1';
export const SAVE_VERSION = 2;

export const NEEDS = [
  { id: 'hunger', name: 'Сытость', icon: '🍓', color: '#ff8a5c', decay: 4.2 },
  { id: 'energy', name: 'Бодрость', icon: '⚡', color: '#ffc93c', decay: 3.4 },
  { id: 'fun', name: 'Настроение', icon: '🎀', color: '#ff6f9c', decay: 3.0 },
  { id: 'hygiene', name: 'Чистота', icon: '🫧', color: '#5ec8f2', decay: 2.5 },
  { id: 'social', name: 'Общение', icon: '💬', color: '#9a7bff', decay: 2.1 },
];

export const SKILLS = [
  { id: 'dental', name: 'Зуботехника', icon: '🦷' },
  { id: 'cooking', name: 'Кулинария', icon: '🍳' },
  { id: 'charm', name: 'Обаяние', icon: '✨' },
  { id: 'fitness', name: 'Спорт', icon: '🏃‍♀️' },
];

const LEVELS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
export const MAX_LEVEL = LEVELS.length;

export function levelOf(xp) {
  let l = 1;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]) l = i + 1;
  return l;
}
export function levelProgress(xp) {
  const l = levelOf(xp);
  if (l >= MAX_LEVEL) return 1;
  return (xp - LEVELS[l - 1]) / (LEVELS[l] - LEVELS[l - 1]);
}

export function freshState() {
  return {
    version: SAVE_VERSION,
    started: false,
    created: Date.now(),
    savedAt: Date.now(),
    day: 0,
    minutes: 8 * 60,
    city: 'moscow',
    scene: 'dorm',
    x: null,
    needs: { hunger: 72, energy: 85, fun: 70, hygiene: 80, social: 60 },
    money: 3500,
    skills: { dental: 0, cooking: 0, charm: 0, fitness: 0 },
    outfit: { ...DEFAULT_OUTFIT, acc: [...DEFAULT_OUTFIT.acc] },
    savedOutfits: [],
    owned: ['top_keyhole', 'skirt_white', 'pumps_white', 'studs', 'bag_chain', 'pajamas'],
    salon: { hairStyle: ['long'], hairColor: ['chestnut'], lips: ['nude'] },
    inventory: { groceries: 3, petFood: 0, snacks: 2, meals: 0, sweets: 0 },
    pets: [],
    quest: { index: 0, progress: 0, id: 'breakfast' },
    chapterSeen: 0,
    grades: 50,
    debt: 0,
    side: [],
    sideDone: {},
    dreams: {},
    lab: { owned: false, upgrades: [], orders: 0 },
    decor: [],
    login: null,
    daily: { day: -1, tasks: [] },
    achievements: {},
    stats: {},
    records: {},
    chats: {},
    unread: 0,
    album: [],
    postcards: [],
    flags: {},
    attendance: 0,
    settings: { sound: true, music: true, speed: 1, haptics: true },
  };
}

export let S = freshState();

function migrate(data) {
  const base = freshState();
  // shallow-merge unknown/new keys so older saves keep working
  const out = { ...base, ...data };
  out.needs = { ...base.needs, ...(data.needs || {}) };
  out.skills = { ...base.skills, ...(data.skills || {}) };
  out.inventory = { ...base.inventory, ...(data.inventory || {}) };
  out.settings = { ...base.settings, ...(data.settings || {}) };
  out.salon = { ...base.salon, ...(data.salon || {}) };
  out.outfit = { ...base.outfit, ...(data.outfit || {}) };
  out.lab = { ...base.lab, ...(data.lab || {}) };
  // v1 saves stored only the quest position; map it to the (longer) v2 story by quest id
  if (data.quest && !data.quest.id) {
    const id = LEGACY_ORDER[data.quest.index];
    const idx = id ? QUESTS.findIndex((q) => q.id === id) : QUESTS.length;
    out.quest = { index: idx < 0 ? 0 : idx, progress: data.quest.progress || 0, id: id || null };
  } else if (data.quest && data.quest.id) {
    const idx = QUESTS.findIndex((q) => q.id === data.quest.id);
    if (idx >= 0) out.quest.index = idx;
  }
  out.chapterSeen = data.chapterSeen ?? (QUESTS[out.quest.index] ? QUESTS[out.quest.index].chapter : 5);
  out.flags = { ...(data.flags || {}) };
  if (out.quest.index > QUESTS.findIndex((q) => q.id === 'home')) out.flags.homecoming = true;
  out.version = SAVE_VERSION;
  return out;
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      S = migrate(JSON.parse(raw));
      return true;
    }
  } catch (e) {
    console.warn('Save load failed', e);
  }
  S = freshState();
  return false;
}

export function save() {
  try {
    S.savedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {
    /* storage may be unavailable (private mode) — the game still runs */
  }
}

export function reset() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    /* ignore */
  }
  S = freshState();
}

export function exportSave() {
  return btoa(unescape(encodeURIComponent(JSON.stringify(S))));
}
export function importSave(str) {
  const data = JSON.parse(decodeURIComponent(escape(atob(str.trim()))));
  if (!data || typeof data !== 'object' || !data.needs) throw new Error('bad save');
  S = migrate(data);
  save();
}

// ---------------------------------------------------------------- mutations
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));

export function changeNeed(id, delta) {
  S.needs[id] = clamp(S.needs[id] + delta);
}

export function addMoney(n, reason) {
  if (n > 0 && S.debt > 0) {
    // incoming money pays off debts first
    const pay = Math.min(S.debt, n);
    S.debt -= pay;
    S.money = Math.round(S.money + n - pay);
    if (pay) bus.emit('debtPaid', { amount: pay, left: S.debt });
    bus.emit('money', { amount: n, reason });
    stat('earned', n);
    return;
  }
  S.money = Math.max(0, Math.round(S.money + n));
  bus.emit('money', { amount: n, reason });
  if (n > 0) stat('earned', n);
}

export function canAfford(n) {
  return S.money >= n;
}

export function mood() {
  const v = Object.values(S.needs);
  const avg = v.reduce((a, b) => a + b, 0) / v.length;
  return clamp(avg * 0.7 + Math.min(...v) * 0.3);
}

export function xpMultiplier() {
  return 0.6 + (mood() / 100) * 0.7;
}

export function addXP(skill, amount) {
  const before = levelOf(S.skills[skill]);
  const gained = Math.round(amount * xpMultiplier());
  S.skills[skill] += gained;
  const after = levelOf(S.skills[skill]);
  bus.emit('xp', { skill, amount: gained });
  if (after > before) bus.emit('levelup', { skill, level: after });
  return gained;
}

export function stat(key, n = 1) {
  S.stats[key] = (S.stats[key] || 0) + n;
}

export function record(key, value) {
  if (!S.records[key] || value > S.records[key]) {
    S.records[key] = value;
    return true;
  }
  return false;
}

export function owns(id) {
  return S.owned.includes(id);
}

export function absoluteMinutes() {
  return S.day * 1440 + S.minutes;
}

/** Pay a bill; whatever can't be paid becomes debt (repaid automatically from income). */
export function payBill(amount) {
  const paid = Math.min(S.money, amount);
  S.money -= paid;
  S.debt += amount - paid;
  bus.emit('money', { amount: -paid, reason: 'bill' });
  return amount - paid;
}

export function changeGrades(delta) {
  const before = S.grades;
  S.grades = Math.max(0, Math.min(100, S.grades + delta));
  if (S.grades !== before) bus.emit('grades', { delta, value: S.grades });
}
