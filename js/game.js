// Core game logic: time flow, needs, actions, travel, events.
import { S, NEEDS, changeNeed, addMoney, addXP, stat, save, mood, levelOf, record, changeGrades, payBill } from './core/state.js';
import { bus } from './core/bus.js';
import { ACTIONS } from './data/actions.js';
import { SCENES, CITIES } from './data/scenes.js';
import { ITEMS } from './data/items.js';
import { PET_TYPES } from './art/pets.js';
import { CONFIG } from './config.js';
import { AMBIENT, NPC_LINES } from './data/contacts.js';
import { ensureDailies, sendMessage, currentQuest, offerSideQuest, expireSideQuests } from './core/progress.js';
import { BARISTA_RANKS, EQUIPMENT, LAB_RENT, STIPEND, RENT } from './data/career.js';
import { DECOR } from './data/decor.js';
import { world, loadScene, walkTo, setOverhead, lanaAnim, setExpression, lanaScreenPos, hideHotspots, rebuildPet, setProp, cameraFlash, heartsAt } from './ui/world.js';
import { updateHud } from './ui/hud.js';
import { toast, floatText, confetti } from './ui/fx.js';
import { dialog } from './ui/modal.js';
import { sfx, playMusic } from './audio.js';
import { money, weekday, formatClock, weatherOf, isHoliday } from './core/time.js';
import { playMinigame } from './minigames/index.js';
import { el, app, wait } from './ui/dom.js';
import { renderLanaHead } from './art/character.js';
import { stars, moon } from './art/scenes/common.js';

export const ui = {}; // filled by main.js: openWardrobe, openShop, openPhone, showPostcard, finale

const game = {
  running: null, // current timed action
  busy: false, // walking towards / performing something
  pausedBy: 0, // >0 when an overlay pauses time
  lastHour: null,
  thoughtTimer: 0,
};
export { game };

export const pauseTime = () => game.pausedBy++;
export const resumeTime = () => (game.pausedBy = Math.max(0, game.pausedBy - 1));
export const isBusy = () => game.busy;

const NEED_ICON = Object.fromEntries(NEEDS.map((n) => [n.id, n.icon]));

// ---------------------------------------------------------------- time
function advanceMinutes(mins, decayMul = 1, decayOverride = null) {
  // needs decay
  for (const n of NEEDS) {
    let rate = n.decay;
    if (decayOverride && decayOverride[n.id] != null) rate = decayOverride[n.id];
    changeNeed(n.id, (-rate * decayMul * mins) / 60);
  }
  // pets
  for (const p of S.pets) {
    p.hunger = Math.max(0, p.hunger - (1.4 * mins) / 60);
    p.joy = Math.max(0, p.joy - (1.1 * mins) / 60);
  }
  const before = S.minutes;
  S.minutes += mins;
  while (S.minutes >= 1440) {
    S.minutes -= 1440;
    S.day++;
    newDay();
  }
  const h = Math.floor(S.minutes / 60);
  if (h !== game.lastHour) {
    game.lastHour = h;
    hourly(h);
  }
  return before;
}

function newDay() {
  ensureDailies();
  S.flags.loveSent = false;
  const wd = weekday(S.day);
  // skipped lectures yesterday lower the grades (after the first lecture quest, during term time)
  const y = S.day - 1;
  if (S.started && !S.flags.diploma && S.quest.index >= 2 && weekday(y) < 5 && !isHoliday(y) && S.flags.lectureDay !== y) {
    changeGrades(-5);
    S.stats.skips = (S.stats.skips || 0) + 1;
    if (S.stats.skips === 1 || S.stats.skips % 4 === 0) sendMessage('teacher', `Лана, вы пропустили пары. Успеваемость: ${S.grades}%. Не забывайте — от неё зависят стипендия и допуск к экзамену.`);
  }
  if (wd === 0) {
    if (!S.flags.diploma) {
      if (S.grades >= STIPEND.highMin) {
        addMoney(STIPEND.high, 'stipend');
        sendMessage('katya', `Повышенная стипендия! ${money(STIPEND.high)} 🤩 Ты у нас отличница!`);
      } else if (S.grades >= STIPEND.min) {
        addMoney(STIPEND.base, 'stipend');
        sendMessage('katya', `Стипендия пришла! ${money(STIPEND.base)} 🎉 При успеваемости 80%+ будет повышенная.`);
      } else sendMessage('katya', `Лан, тебе в этот раз не дали стипендию 😟 Нужна успеваемость от ${STIPEND.min}% (у тебя ${S.grades}%).`);
    }
    const debt = payBill(RENT);
    sendMessage('dorm', debt ? `Оплата общежития ${money(RENT)}. Не хватило ${money(debt)} — долг спишется с ближайших поступлений.` : `Оплата общежития за неделю: ${money(RENT)}. Спасибо!`);
  }
  if (wd === 4) {
    addMoney(1500, 'mom');
    sendMessage('mom', 'Доча, скинула тебе 1 500 ₽ на вкусняшки 💛');
  }
  expireSideQuests();
  if (S.day % 2 === 0) offerSideQuest(true);
  holidays();
  bus.emit('newDay', { day: S.day });
}

export function baristaRank() {
  const shifts = S.stats.mg_barista || 0;
  const charm = levelOf(S.skills.charm);
  let r = 0;
  BARISTA_RANKS.forEach((rk, i) => {
    if (shifts >= rk.shifts && charm >= rk.charm) r = i;
  });
  return r;
}

export function labBonus() {
  return (S.lab.upgrades || []).reduce((a, id) => a + ((EQUIPMENT.find((e) => e.id === id) || {}).bonus || 0), 0);
}

const HOLIDAYS = {
  '9-1': [['katya', 'С Днём знаний! 📚 Новый учебный год, держимся вместе 💪']],
  '10-5': [['teacher', 'С Днём учителя меня поздравлять не обязательно, но коронки сдавать — обязательно 😉']],
  '12-31': [['mom', 'С Новым годом, доченька! 🎄 Пусть всё-всё сбудется! Мандарины уже на столе 🍊', 3000], ['lover', 'С Новым годом, моя любимая! 🎆 Ты — моё лучшее, что случилось в этом году ❤️']],
  '1-7': [['grandma', 'С Рождеством, внученька! 🌟 Береги себя.']],
  '2-9': [['katya', 'День стоматолога! 🦷 Это наш профессиональный праздник, поздравляю, коллега!']],
  '2-14': [['lover', 'С Днём всех влюблённых! 💘 Если бы можно было, я бы прямо сейчас примчался с цветами. Люблю тебя!', 2000]],
  '3-8': [['lover', 'С 8 Марта, моя весна! 🌷 Ты самая нежная и самая сильная.', 1500], ['mom', 'С праздником, доченька! 💐 Ты наша гордость!']],
  '5-9': [['grandma', 'С Днём Победы! 🌸 Помним.']],
};

function holidays() {
  const d = new Date(Date.UTC(2025, 8, 1) + S.day * 864e5);
  const list = HOLIDAYS[`${d.getUTCMonth() + 1}-${d.getUTCDate()}`];
  if (!list) return;
  list.forEach(([who, text, gift], i) =>
    setTimeout(() => {
      sendMessage(who, gift ? `${text}\n\n🎁 +${money(gift)}` : text);
      if (gift) addMoney(gift, 'gift');
    }, 1500 + i * 2500),
  );
}

function hourly(h) {
  bus.emit('hour', { h });
  const hungry = S.pets.find((p) => p.hunger < 20);
  if (hungry && h % 4 === 0 && S.started) toast({ icon: '🥺', title: `${hungry.name} хочет кушать`, text: 'Нажми на питомца → «Покормить»' });
  if (h === 3 && !(game.running && game.running.id === 'sleep')) S.flags.owl = true;
  // a love note once a day at a pseudo-random hour between 9 and 22
  const loveHour = 9 + ((S.day * 7) % 13);
  if (h === loveHour && !S.flags.loveSent && S.started) {
    S.flags.loveSent = true;
    const notes = CONFIG.loveNotes;
    sendMessage('lover', notes[(S.day + (S.stats.replies_lover || 0)) % notes.length]);
  }
  // ambient chatter
  if (h >= 10 && h <= 21 && Math.random() < 0.12 && S.started) {
    const keys = Object.keys(AMBIENT);
    const who = keys[Math.floor(Math.random() * keys.length)];
    const list = AMBIENT[who];
    sendMessage(who, list[Math.floor(Math.random() * list.length)]);
  }
}

// ---------------------------------------------------------------- main tick
export function tick(dt) {
  dt = Math.min(dt, 0.1);
  if (game.pausedBy > 0) return;
  const r = game.running;
  if (r) {
    r.t += dt;
    const p = Math.min(1, r.t / r.real);
    const dMin = (p - r.p) * r.minutes;
    const dp = p - r.p;
    r.p = p;
    advanceMinutes(dMin, r.decayMul ?? 1, r.decayOverride);
    for (const [k, v] of Object.entries(r.effects || {})) changeNeed(k, v * dp);
    setOverhead({ thought: game.talking ? null : r.icon, progress: p });
    if (p >= 1) finishTimed();
  } else if (S.settings.speed > 0 && S.started) {
    advanceMinutes(dt * S.settings.speed);
    if (isCold()) {
      changeNeed('fun', (-2.5 * dt * S.settings.speed) / 60);
      if (!game.coldWarned) {
        game.coldWarned = true;
        setTimeout(() => toast({ icon: '🥶', title: 'Брр, холодно!', text: 'Надень что-нибудь тёплое: пуховик, тренч, шапку или угги' }), 1500);
      }
    }
    if (S.needs.energy <= 0 && !game.busy) passOut();
    // ambient thought bubbles for low needs
    game.thoughtTimer -= dt;
    if (game.thoughtTimer <= 0) {
      game.thoughtTimer = 6;
      const low = NEEDS.filter((n) => S.needs[n.id] < 22).sort((a, b) => S.needs[a.id] - S.needs[b.id])[0];
      const cold = isCold() ? { icon: '🥶' } : null;
      if ((cold || low) && !game.busy) {
        setOverhead({ thought: (cold || low).icon });
        setTimeout(() => !game.running && setOverhead({}), 2500);
      }
    }
  }
}

const WARM = new Set(['trench', 'puffer', 'beanie', 'uggs', 'boots', 'sweater_pink', 'hoodie_msk', 'scarf', 'cardigan']);
export function isCold() {
  const sc = SCENES[S.scene];
  if (!sc || sc.indoor !== false || weatherOf(S.day, sc.city) !== 'snow') return false;
  const worn = [S.outfit.top, S.outfit.shoes, ...(S.outfit.acc || [])];
  return !worn.some((id) => WARM.has(id));
}

// ---------------------------------------------------------------- actions
export function actionAvailability(id) {
  const a = ACTIONS[id];
  if (!a) return { ok: false, reason: '???' };
  if (a.req) {
    const r = a.req();
    if (r) return { ok: false, reason: r };
  }
  if (a.cost && S.money < a.cost) return { ok: false, reason: `Нужно ${money(a.cost)}` };
  if (id === 'exam') {
    if (S.flags.diploma) return { ok: false, reason: 'Диплом уже получен 🎓' };
    const q = currentQuest();
    if (!q || q.id !== 'exam') return { ok: false, reason: 'Сначала пройди задание «Отличница»' };
    if (S.flags.examCooldown === S.day) return { ok: false, reason: 'Пересдача — завтра' };
  }
  return { ok: true };
}

export async function doAction(id, hotspot) {
  if (game.busy) return;
  const a = ACTIONS[id];
  const av = actionAvailability(id);
  if (!av.ok) {
    sfx('bad');
    toast({ icon: a.icon, title: a.name, text: av.reason });
    return;
  }
  game.busy = true;
  hideHotspots(true);
  try {
    if (hotspot && hotspot.stand != null) {
      const arrived = await walkTo(hotspot.stand);
      if (!arrived) return;
    }
    if (a.special === 'wardrobe') return void (await ui.openWardrobe());
    if (a.special === 'shop') return void (await ui.openShop(a.shopTab));
    if (a.special === 'sleep') return void (await sleep());
    if (a.special === 'exam') return void (await exam());
    if (a.special === 'olympiad') return void (await olympiad());
    if (a.special === 'labShop') return void (await ui.openLabShop());
    if (a.special === 'opening') return void (await grandOpening());
    if (a.cost) addMoney(-a.cost, id);
    if (a.minigame) return void (await minigameAction(id, a));
    const npc = hotspot && hotspot.npc ? npcSay(hotspot.id) : null;
    game.talking = !!npc;
    await timedAction(id, a);
    game.talking = false;
    if (npc) npc.remove();
  } finally {
    game.busy = false;
    hideHotspots(false);
    setOverhead({});
    lanaAnim(null);
    setProp(null);
    updateHud();
  }
}

function npcSay(id) {
  const lines = NPC_LINES[id];
  const node = document.querySelector(`.actor.npc[data-npc="${id}"]`);
  if (!lines || !node) return null;
  const b = el(`<div class="thought npc-say">${lines[Math.floor(Math.random() * lines.length)]}</div>`);
  node.appendChild(b);
  // keep the bubble on screen once the camera has settled
  setTimeout(() => {
    const r = b.getBoundingClientRect();
    const over = r.right - (window.innerWidth - 12);
    const under = 12 - r.left;
    if (over > 0) b.style.setProperty('--dx', `${-over}px`);
    else if (under > 0) b.style.setProperty('--dx', `${under}px`);
  }, 700);
  // frame both speakers
  const npcX = +node.dataset.x;
  world.camTarget = (world.lanaX + npcX) / 2 - world.root.clientWidth / world.scale / 2;
  return b;
}

// Body pose + prop shown while an action runs.
const POSES = {
  snack: ['eat', '🥪'], eatMeal: ['eat', '🍲'], mamaFood: ['eat', '🥘'], foodcourt: ['eat', '🍜'], coffeeDessert: ['eat', '🥐'], icecream: ['eat', '🍦'],
  tea: ['drink', '🍵'], vending: ['drink', '☕'], sandCoffee: ['drink', '☕'], grandmaTea: ['drink', '🫖'],
  phoneScroll: ['phone', '📱'], callMom: ['phone', '📱'],
  study: ['read', '📖'], lecture: ['read', '📒'],
  cook: ['cook', '🥄'], helpCook: ['cook', '🥄'],
  makeup: ['groom', '💄'], brushTeeth: ['groom', '🪥'],
  selfie: ['selfie', '📱'],
  consult: ['talk'], friendChat: ['talk'], chatGuests: ['talk'], momTalk: ['talk'], amraChat: ['talk'], grandmaTalk: ['talk'], walkPet: ['talk'],
  ducks: ['feed', '🍞'], feedChickens: ['feed', '🌾'],
  swing: ['dance'], promenade: ['dance'],
  bench: ['rest'], window: ['rest'], balcony: ['rest'], sunbathe: ['rest'], nap: ['away'], shower: ['away'],
};
const POSE_EXPR = { eat: 'happy', drink: 'happy', talk: 'happy', dance: 'excited', selfie: 'kiss', rest: 'happy', read: 'neutral', phone: 'happy', feed: 'happy', cook: 'happy' };

function timedAction(id, a) {
  return new Promise((resolve) => {
    let effects = { ...(a.effects || {}) };
    // pet & outfit bonuses
    if (a.bonusKey === 'beach' && outfitBonus('beach')) effects.fun = Math.round(effects.fun * (1 + outfitBonus('beach')));
    const pet = activePet();
    if (pet && PET_TYPES[pet.type].bonus.fun && effects.fun > 0) effects.fun = Math.round(effects.fun * PET_TYPES[pet.type].bonus.fun);
    if (pet && PET_TYPES[pet.type].bonus.social && effects.social > 0) effects.social = Math.round(effects.social * PET_TYPES[pet.type].bonus.social);
    const minutes = a.minutes || 10;
    game.running = {
      id, icon: a.icon, minutes, effects, t: 0, p: 0,
      real: Math.max(2.2, Math.min(6.5, minutes / 18)),
      decayMul: a.decayMul ?? 1,
      done: () => resolve(),
      action: a,
    };
    const [pose, prop] = POSES[id] || [a.anim === 'rest' ? 'rest' : a.anim === 'away' ? 'away' : 'work'];
    lanaAnim(pose === 'away' ? 'away' : `pose-${pose}`);
    if (prop) setProp(prop, pose);
    if (POSE_EXPR[pose]) setExpression(POSE_EXPR[pose], 0);
    if (id === 'selfie') setTimeout(() => {
      sfx('camera');
      cameraFlash();
    }, 900);
    if (id === 'shower') sfx('splash');
  });
}

function finishTimed() {
  const r = game.running;
  game.running = null;
  const a = r.action;
  const id = r.id;
  // consumables
  if (a.uses) for (const [k, v] of Object.entries(a.uses)) S.inventory[k] = Math.max(0, (S.inventory[k] || 0) - v);
  if (a.gives) for (const [k, v] of Object.entries(a.gives)) S.inventory[k] = (S.inventory[k] || 0) + v;
  if (a.cooldown) S.flags['cd_' + a.cooldown] = S.day * 1440 + S.minutes;
  const floats = [];
  for (const [k, v] of Object.entries(r.effects || {})) if (Math.abs(v) >= 3) floats.push([`${v > 0 ? '+' : ''}${Math.round(v)} ${NEED_ICON[k]}`, v > 0 ? '#fff' : '#ffd0d6']);
  if (a.xp) {
    for (const [k, v] of Object.entries(a.xp)) {
      let amt = v;
      if (a.bonusKey === 'study') amt *= 1 + outfitBonus('study');
      const g = addXP(k, amt);
      floats.push([`+${g} ${skillIcon(k)}`, '#ffe9a8']);
    }
  }
  if (a.after) a.after();
  stat('act_' + id);
  specialAfter(id);
  showFloats(floats);
  setExpression(mood() > 50 ? 'happy' : 'neutral', 1600);
  bus.emit('action', { id });
  r.done();
}

function specialAfter(id) {
  if (id === 'selfie') {
    S.album.unshift({ outfit: JSON.parse(JSON.stringify(S.outfit)), scene: S.scene, day: S.day, min: Math.floor(S.minutes) });
    S.album = S.album.slice(0, 40);
    stat('selfies');
    toast({ icon: '📸', title: 'Новое фото в альбоме!', text: 'Телефон → Альбом', onClick: () => ui.openPhone('album') });
  }
  if (id === 'momTalk') {
    stat('momTalks');
    if (Math.random() < 0.35) {
      addMoney(1000, 'mom');
      toast({ icon: '💛', title: 'Мама сунула в карман 1 000 ₽', text: '«Купи себе что-нибудь красивое»' });
    }
  }
  if (id === 'walkPet') {
    const p = activePet();
    if (p) {
      p.joy = Math.min(100, p.joy + 35);
      bus.emit('petPlay', {});
    }
  }
  if ((id === 'shower' || id === 'sunbathe') && world.lana) {
    const node = world.lana;
    node.classList.add('fresh');
    setTimeout(() => node.classList.remove('fresh'), 3000);
  }
  if (id === 'lecture' && S.attendance === 5) toast({ icon: '📝', title: 'Допуск к экзамену почти твой', text: '5 посещённых пар!' });
}

function showFloats(list) {
  const pos = lanaScreenPos();
  list.forEach(([t, c], i) => floatText(pos.x + (i % 2 ? 30 : -30), pos.y + 40, t, c, i * 220));
  if (list.length) sfx('success');
}

const skillIcon = (k) => ({ dental: '🦷', cooking: '🍳', charm: '✨', fitness: '🏃‍♀️' })[k] || '⭐';

export function outfitBonus(key) {
  let b = 0;
  const ids = [S.outfit.top, S.outfit.bottom, S.outfit.dress, S.outfit.shoes, ...(S.outfit.acc || [])];
  const active = S.outfit.dress ? [S.outfit.dress, S.outfit.shoes, ...(S.outfit.acc || [])] : ids;
  for (const id of active) {
    const it = ITEMS[id];
    if (it && it.bonus && it.bonus[key]) b += it.bonus[key];
  }
  return b;
}

export const activePet = () => S.pets.find((p) => p.id === S.activePet) || S.pets[0] || null;

// ---------------------------------------------------------------- minigames
const MG_REWARD = {
  crown: (res, mode) => {
    const lab = 1 + outfitBonus('lab');
    const lv = levelOf(S.skills.dental);
    const out = { xp: { dental: Math.round((18 + res.stars * 22) * lab) }, needs: { energy: -8, fun: res.stars >= 2 ? 8 : -4 } };
    if (mode === 'orders') out.money = res.stars ? 500 + lv * 120 + res.stars * 350 : 150;
    if (mode === 'lab') out.money = res.stars ? Math.round((700 + lv * 160 + res.stars * 450) * (1 + labBonus())) : 200;
    if (mode === 'practice' || mode === 'normal') if (!S.flags.diploma) changeGrades(res.stars);
    stat('crowns');
    if (res.stars >= 3) stat('crown3');
    return out;
  },
  quiz: (res) => {
    changeGrades(res.stars * 4 - 2);
    return { xp: { dental: 12 + res.stars * 14 }, needs: { energy: -6, fun: res.stars >= 2 ? 6 : -6 } };
  },
  khachapuri: (res) => ({ xp: { cooking: 20 + res.stars * 15 }, needs: { hunger: 25 + res.stars * 10, fun: 10, social: 12 } }),
  dance: (res) => ({ xp: { charm: 14 + res.stars * 10, fitness: 10 + res.stars * 6 }, needs: { fun: 18 + res.stars * 6, social: 18, energy: -14 } }),
  fashion: (res) => {
    const prize = [0, 800, 2000, 4500][res.stars];
    if (res.stars >= 3) stat('fashion3');
    return { money: prize, xp: { charm: 18 + res.stars * 10 }, needs: { fun: 12 } };
  },
  puzzle: (res) => ({ money: res.stars * 200, needs: { fun: 10 } }),
  mandarins: (res) => {
    const season = [10, 11, 0].includes(new Date(Date.UTC(2025, 8, 1) + S.day * 864e5).getUTCMonth());
    stat('mandarins', res.score);
    return { money: Math.round(res.score * (season ? 22 : 15)), xp: { fitness: 10 + res.stars * 4 }, needs: { fun: 14, energy: -10 } };
  },
  shells: (res) => {
    if (res.stars >= 3) stat('shells3');
    return { money: (res.pearls || 0) * 150, xp: { fitness: 16 + res.stars * 10 }, needs: { fun: 26, hygiene: 20, energy: -12 } };
  },
  barista: (res) => {
    const rank = BARISTA_RANKS[baristaRank()];
    stat('mg_barista');
    if (res.stars >= 3) stat('barista3');
    return { money: rank.pay + (res.tips || 0), xp: { charm: 18 + res.stars * 8 }, needs: { energy: -18, social: 20, fun: res.stars >= 2 ? 6 : -6 } };
  },
  memory: (res) => {
    if (res.stars >= 3) stat('memory3');
    return { xp: { dental: 14 + res.stars * 10 }, needs: { fun: 10, energy: -4 } };
  },
  runner: (res) => {
    if (res.stars >= 3) stat('runner3');
    return { money: (res.coins || 0) * 10, xp: { fitness: 20 + res.stars * 10 }, needs: { fun: 10, energy: -12, hygiene: -10 } };
  },
  petplay: (res) => ({ needs: { fun: 14 }, pet: 40 }),
};

export function applyRewards(rw) {
  const chips = [];
  if (rw.money) {
    addMoney(rw.money, 'minigame');
    chips.push(`💰 +${money(rw.money)}`);
  }
  for (const [k, v] of Object.entries(rw.xp || {})) {
    const g = addXP(k, v);
    chips.push(`${skillIcon(k)} +${g} опыта`);
  }
  for (const [k, v] of Object.entries(rw.needs || {})) {
    changeNeed(k, v);
    if (v > 0) chips.push(`${NEED_ICON[k]} +${v}`);
  }
  if (rw.pet) {
    const p = activePet();
    if (p) {
      p.joy = Math.min(100, p.joy + rw.pet);
      chips.push(`🐾 +${rw.pet} радости`);
    }
  }
  return chips;
}

async function minigameAction(id, a, mode = null) {
  const mg = a.minigame;
  mode = mode || { orders: 'orders', labOrders: 'lab', typodont: 'practice' }[id] || 'normal';
  const rankBefore = mg === 'barista' ? baristaRank() : 0;
  pauseTime();
  playMusic('game');
  let res;
  try {
    res = await playMinigame(mg, {
      mode,
      level: minigameLevel(mg),
      labBonus: labBonus(),
      lab: S.lab.upgrades || [],
      reward: (r) => applyRewards(MG_REWARD[mg] ? MG_REWARD[mg](r, mode) : {}),
    });
  } finally {
    resumeTime();
    playMusic(SCENES[S.scene].music);
  }
  if (!res) return null;
  advanceMinutes(a.minutes || 30, 0.6);
  stat('mg_' + mg + '_played');
  stat('starsTotal', res.stars || 0);
  if (id === 'labOrders') S.lab.orders = (S.lab.orders || 0) + 1;
  if (res.score != null) record(mg, res.score);
  if (mg === 'barista') {
    const r = baristaRank();
    if (r > rankBefore) {
      sendMessage('vika', `Лана, ты молодец! Повышаю тебя до «${BARISTA_RANKS[r].name}». Теперь за смену ${money(BARISTA_RANKS[r].pay)} + чаевые ☕🎉`);
      confetti(60);
    }
  }
  bus.emit('minigame', { id: mg, stars: res.stars, score: res.score, mode });
  bus.emit('action', { id });
  setExpression(res.stars >= 2 ? 'excited' : 'neutral', 2500);
  if (res.stars >= 2) lanaAnim('joy', 1100);
  return res;
}

export async function playPetGame() {
  const p = activePet();
  if (!p || game.busy) return;
  game.busy = true;
  try {
    await minigameAction('petPlay', { minigame: 'petplay', minutes: 20 }, 'pet');
    bus.emit('petPlay', {});
  } finally {
    game.busy = false;
  }
}

function minigameLevel(mg) {
  const L = (k) => levelOf(S.skills[k]);
  return { crown: L('dental'), quiz: L('dental'), memory: L('dental'), barista: baristaRank() + 1, mandarins: L('fitness'), runner: L('fitness'), shells: L('fitness'), dance: L('charm'), fashion: L('charm'), khachapuri: L('cooking') }[mg] || 1;
}

// ---------------------------------------------------------------- exam & finale
async function exam() {
  const ok = levelOf(S.skills.dental) >= 5 && S.grades >= 60;
  if (!ok) {
    await dialog({
      icon: '👩‍🏫', title: 'Ирина Петровна',
      text: `«Лана, для допуска нужно:\n• Зуботехника 5 уровня (сейчас ${levelOf(S.skills.dental)}) ${levelOf(S.skills.dental) >= 5 ? '✅' : '❌'}\n• Успеваемость от 60% (сейчас ${S.grades}%) ${S.grades >= 60 ? '✅' : '❌'}»`,
      buttons: [{ label: 'Поняла, готовлюсь!', value: 1 }],
    });
    return;
  }
  const go = await dialog({
    icon: '📜', title: 'Финальный экзамен',
    text: 'Нужно смоделировать идеальную коронку на 3 звезды. Если не выйдет — пересдача завтра. Готова?',
    buttons: [{ label: 'Готова! 💪', value: true, cls: 'mint' }, { label: 'Ещё потренируюсь', value: false, cls: 'ghost' }],
  });
  if (!go) return;
  const res = await minigameAction('exam', { minigame: 'crown', minutes: 120 }, 'exam');
  if (!res) return;
  const passed = res.stars >= 3;
  bus.emit('exam', { passed });
  if (passed) {
    S.flags.diploma = true;
    save();
    await ui.finale();
  } else {
    S.flags.examCooldown = S.day;
    await dialog({ icon: '😥', title: 'Почти получилось!', text: 'Ирина Петровна: «Неплохо, но нужно идеально. Жду вас завтра на пересдачу!»' });
  }
}

async function olympiad() {
  if (S.flags.olympiadTry === S.day) {
    await dialog({ icon: '🏅', title: 'Олимпиада', text: 'Следующая попытка — завтра. Потренируйся на типодонте!' });
    return;
  }
  await ui.dialogue('olympiad');
  const res = await minigameAction('olympiad', { minigame: 'crown', minutes: 120 }, 'olympiad');
  if (!res) return;
  S.flags.olympiadTry = S.day;
  if (res.stars >= 3) {
    S.flags.olympiadWon = true;
    confetti(100);
    sfx('fanfare');
    await dialog({ icon: '🥇', title: 'Первое место!', text: 'Жюри в восторге от твоей коронки. Ирина Петровна сияет: «Я в вас не сомневалась!»' });
  } else {
    await dialog({ icon: '🥈', title: 'Почти!', text: 'Для победы нужна идеальная работа — 3 звезды. Попробуй завтра.' });
  }
}

async function grandOpening() {
  pauseTime();
  try {
    await ui.dialogue('opening');
  } finally {
    resumeTime();
  }
  S.flags.opened = true;
  confetti(160);
  sfx('fanfare');
  lanaAnim('joy', 1100);
  changeNeed('fun', 40);
  changeNeed('social', 40);
  bus.emit('action', { id: 'grandOpening' });
  await dialog({
    icon: '✨',
    title: 'Lana Dental открыта!',
    text: 'История Ланы завершена — но жизнь продолжается: выполняй заказы, покупай оборудование, путешествуй и собирай мечты. 💕',
    buttons: [{ label: 'Продолжить жить ✨', value: true }],
  });
  save();
}

export function rentLab() {
  if (S.lab.owned) return true;
  if (!S.flags.diploma) {
    toast({ icon: '🎓', title: 'Сначала диплом', text: 'Помещение сдают только дипломированным специалистам' });
    return false;
  }
  if (S.money < LAB_RENT) {
    sfx('bad');
    toast({ icon: '💸', title: 'Не хватает денег', text: `Нужно ${money(LAB_RENT)}` });
    return false;
  }
  addMoney(-LAB_RENT, 'lab');
  S.lab.owned = true;
  S.flags.ownLab = true;
  sfx('fanfare');
  confetti(120);
  bus.emit('labRented', {});
  save();
  return true;
}

export function buyEquipment(id) {
  const e = EQUIPMENT.find((x) => x.id === id);
  if (!e || S.lab.upgrades.includes(id)) return false;
  if (S.money < e.price) {
    sfx('bad');
    toast({ icon: '💸', title: 'Не хватает денег', text: `Нужно ${money(e.price)}` });
    return false;
  }
  addMoney(-e.price, 'equipment');
  S.lab.upgrades.push(id);
  stat('labUpgrades');
  sfx('coin');
  if (S.scene === 'mylab') loadScene('mylab', world.lanaX);
  bus.emit('equipment', { id });
  save();
  return true;
}

export function buyDecor(id) {
  const d = DECOR.find((x) => x.id === id);
  if (!d || S.decor.includes(id)) return false;
  if (S.money < d.price) {
    sfx('bad');
    toast({ icon: '💸', title: 'Не хватает денег', text: `Нужно ${money(d.price)}` });
    return false;
  }
  addMoney(-d.price, 'decor');
  S.decor.push(id);
  sfx('coin');
  if (S.scene === 'dorm') loadScene('dorm', world.lanaX);
  bus.emit('buy', { id, cat: 'decor' });
  save();
  return true;
}

// ---------------------------------------------------------------- sleep
export async function sleep(passedOut = false) {
  const h = S.minutes / 60;
  let hours;
  if (h >= 19 || h < 5) {
    const wake = 7.5 * 60;
    const now = S.minutes;
    hours = ((wake - now + 1440) % 1440) / 60;
    if (hours < 3) hours = 3;
  } else {
    hours = Math.max(2, Math.min(9, (100 - S.needs.energy) / 12));
  }
  pauseTime();
  playMusic('night');
  const sleepBonus = (1 + outfitBonus('sleep')) * (S.scene === 'dorm' && S.decor.includes('bedding_silk') ? 1.15 : 1);
  const node = el(`<div class="fullscreen sleep-scene">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">${stars(1000, 1000, 90, 11)}${moon(800, 220, 46)}</svg>
      <div class="clock-big"><span data-c>${formatClock(S.minutes)}</span><small>${passedOut ? 'Лана уснула от усталости…' : 'Сладких снов, Лана'}</small></div>
      <div style="position:relative;width:min(70vw,360px)">
        <svg viewBox="0 0 360 240" style="width:100%">
          <rect x="10" y="150" width="340" height="70" rx="26" fill="#6b5aa8"/>
          <ellipse cx="120" cy="140" rx="100" ry="44" fill="#f4f0ff"/>
          <path d="M150,150 C200,100 360,110 350,170 L350,210 L150,210 Z" fill="#ff9ebd"/>
          ${[[220, 160], [280, 150], [320, 180], [250, 190]].map(([x, y]) => `<path d="M${x},${y} c-4,-6 -12,-1 0,9 c12,-10 4,-15 0,-9 Z" fill="#fff" opacity=".7"/>`).join('')}
        </svg>
        <div style="position:absolute;left:0%;top:-14%;width:52%;transform:rotate(-72deg)">${renderLanaHead({ outfit: S.outfit, expr: 'sleep', viewBox: '30 8 140 175' })}</div>
        <div class="zz" style="left:52%;top:0">Z</div><div class="zz" style="left:58%;top:-10%;animation-delay:.8s;font-size:28px">z</div><div class="zz" style="left:62%;top:-4%;animation-delay:1.6s;font-size:22px">z</div>
      </div>
    </div>`);
  app().appendChild(node);
  const realSec = 4.5;
  const steps = 60;
  const minutesTotal = hours * 60;
  for (let i = 0; i < steps; i++) {
    const m = minutesTotal / steps;
    advanceMinutes(m, 1, { energy: 0, hunger: 1.8, hygiene: 1.0, fun: 0.2, social: 0.6 });
    changeNeed('energy', ((12.5 * m) / 60) * sleepBonus);
    node.querySelector('[data-c]').textContent = formatClock(S.minutes);
    await wait((realSec * 1000) / steps);
  }
  stat('sleeps');
  node.classList.add('closing');
  setTimeout(() => node.remove(), 500);
  resumeTime();
  playMusic(SCENES[S.scene].music);
  setExpression('happy', 2500);
  lanaAnim('joy', 1000);
  const hh = S.minutes / 60;
  if (S.scene === 'dorm' && S.decor.length) changeNeed('fun', 4 * S.decor.length); // a cosy room = a good mood
  toast({ icon: hh < 12 ? '☀️' : '😊', title: hh < 12 ? 'Доброе утро, Лана!' : 'Отлично вздремнула!', text: `Бодрость ${Math.round(S.needs.energy)}%` });
  bus.emit('action', { id: 'sleep' });
  save();
}

async function passOut() {
  game.busy = true;
  try {
    await sleep(true);
  } finally {
    game.busy = false;
  }
}

// ---------------------------------------------------------------- moving around
export async function goScene(id, { transition = true } = {}) {
  const sc = SCENES[id];
  if (!sc) return;
  if (id === S.scene) return;
  pauseTime();
  if (transition) await fadeTransition(sc.city === 'moscow' ? '🚇' : '🚐', sc.name);
  advanceMinutes(sc.city === 'moscow' ? 35 : 20);
  S.scene = id;
  S.city = sc.city;
  S.x = sc.spawn;
  loadScene(id, sc.spawn);
  game.coldWarned = false;
  resumeTime();
  playMusic(sc.music);
  showBanner(sc);
  bus.emit('visit', { id });
  save();
}

function fadeTransition(icon, label) {
  return new Promise((resolve) => {
    sfx('whoosh');
    const node = el(`<div class="iris-wipe"><div><div class="iw-ico">${icon}</div><div class="iw-t">${label}</div></div></div>`);
    try {
      const pos = lanaScreenPos();
      node.style.setProperty('--cx', `${Math.round(pos.x)}px`);
      node.style.setProperty('--cy', `${Math.round(pos.y + 200)}px`);
    } catch (e) {
      /* no scene yet */
    }
    app().appendChild(node);
    setTimeout(() => {
      resolve();
      setTimeout(() => {
        node.classList.add('open');
        setTimeout(() => node.remove(), 600);
      }, 60);
    }, 850);
  });
}

export function showBanner(sc) {
  const b = el(`<div class="loc-banner"><b>${sc.name}</b><span>${sc.subtitle}</span></div>`);
  app().appendChild(b);
  setTimeout(() => b.remove(), 3300);
}

export const TRAVEL = {
  train: { name: 'Поезд Москва — Сухум', icon: '🚆', price: 5900, hours: 36, desc: 'Полтора дня, чай в подстаканнике и виды на море', needs: { energy: 15, hunger: -25, hygiene: -35, fun: 10 } },
  plane: { name: 'Самолёт до Сочи + граница Псоу', icon: '✈️', price: 12500, hours: 7, desc: 'Быстро, но дорого', needs: { energy: -18, hunger: -15, hygiene: -15, fun: 6 } },
};

export async function travel(to, mode) {
  const t = TRAVEL[mode];
  if (S.money < t.price) {
    sfx('bad');
    toast({ icon: '💸', title: 'Не хватает денег', text: `Нужно ${money(t.price)}` });
    return false;
  }
  addMoney(-t.price, 'travel');
  pauseTime();
  await ui.travelCutscene(to, mode);
  advanceMinutes(t.hours * 60, 0);
  for (const [k, v] of Object.entries(t.needs)) changeNeed(k, v);
  S.city = to;
  S.scene = CITIES[to].home;
  S.x = SCENES[S.scene].spawn;
  loadScene(S.scene);
  resumeTime();
  playMusic(SCENES[S.scene].music);
  if (to === 'abkhazia' && !S.flags.homecoming) {
    S.flags.homecoming = true;
    await ui.dialogue('homecoming');
  } else showBanner(SCENES[S.scene]);
  stat('trips');
  stat('trip_' + mode);
  bus.emit('travel', { to, mode });
  if (to === 'abkhazia' && S.inventory.sweets > 0) {
    S.inventory.sweets--;
    S.flags.sweetsDelivered = true;
    setTimeout(() => sendMessage('grandma', 'Ой, конфеты «Москва»! Внученька, спасибо, родная 🥹🍬'), 4000);
  }
  if (to === 'abkhazia') setTimeout(() => sendMessage('mom', 'Доченька приехала!!! 😍 Иди скорее обниматься, стол накрыт!'), 1500);
  else setTimeout(() => sendMessage('katya', 'С возвращением в Москву! Завтра пары, не проспи 😉'), 1500);
  save();
  return true;
}

export async function excursion(place) {
  if (S.money < place.price) {
    sfx('bad');
    toast({ icon: '💸', title: 'Не хватает денег', text: `Нужно ${money(place.price)}` });
    return;
  }
  addMoney(-place.price, 'excursion');
  pauseTime();
  await fadeTransition(place.icon, place.name);
  advanceMinutes(place.hours * 60, 0.8);
  for (const [k, v] of Object.entries(place.needs)) changeNeed(k, v);
  const isNew = !S.postcards.includes(place.id);
  if (isNew) S.postcards.push(place.id);
  resumeTime();
  stat('excursions');
  bus.emit('postcard', { id: place.id });
  await ui.showPostcard(place, isNew);
  save();
}

// ---------------------------------------------------------------- shopping & pets
export function buyItem(id) {
  const it = ITEMS[id];
  if (!it || S.owned.includes(id)) return false;
  if (S.money < it.price) {
    sfx('bad');
    toast({ icon: '💸', title: 'Не хватает денег', text: `Нужно ${money(it.price)}` });
    return false;
  }
  addMoney(-it.price, 'shop');
  stat('spentShop', it.price);
  S.owned.push(id);
  sfx('coin');
  bus.emit('buy', { id, cat: it.cat });
  save();
  return true;
}

export function buySalon(kind, id, price) {
  if (S.salon[kind].includes(id)) return true;
  if (S.money < price) {
    sfx('bad');
    toast({ icon: '💸', title: 'Не хватает денег', text: `Нужно ${money(price)}` });
    return false;
  }
  addMoney(-price, 'salon');
  stat('spentShop', price);
  S.salon[kind].push(id);
  sfx('coin');
  bus.emit('buy', { id, cat: kind });
  save();
  return true;
}

export function adoptPet(type, name) {
  const t = PET_TYPES[type];
  if (S.money < t.price) {
    sfx('bad');
    toast({ icon: '💸', title: 'Не хватает денег', text: `Нужно ${money(t.price)}` });
    return false;
  }
  addMoney(-t.price, 'pet');
  const pet = { id: 'p' + Date.now(), type, name, hunger: 80, joy: 90, day: S.day };
  S.pets.push(pet);
  S.activePet = pet.id;
  rebuildPet();
  confetti(60);
  sfx('fanfare');
  bus.emit('adopt', { type });
  save();
  return true;
}

export function feedPet(p) {
  if (S.inventory.petFood <= 0) {
    if (S.money < 150) {
      toast({ icon: '🥫', title: 'Нет корма', text: 'Купи корм в зоомагазине' });
      return false;
    }
    addMoney(-150, 'petfood');
    toast({ icon: '🥫', title: 'Купила корм у вахтёрши', text: '−150 ₽' });
  } else S.inventory.petFood--;
  p.hunger = Math.min(100, p.hunger + 55);
  p.joy = Math.min(100, p.joy + 10);
  sfx(PET_TYPES[p.type].sound);
  bus.emit('petFeed', {});
  return true;
}

export function petPet(p) {
  p.joy = Math.min(100, p.joy + 18);
  changeNeed('fun', 8);
  sfx(PET_TYPES[p.type].sound);
  bus.emit('petPlay', {});
  heartsAt(world.petX, world.scene.floor - 140, 5);
  setExpression('excited', 1500);
}

export function equipOutfit(newOutfit) {
  S.outfit = newOutfit;
  bus.emit('outfit', {});
}

export { save };
