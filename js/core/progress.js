// Quests, daily tasks, achievements and phone messages — all driven by bus events.
import { S, addMoney, addXP, levelOf, changeNeed, changeGrades } from './state.js';
import { bus } from './bus.js';
import { QUESTS, DAILY_POOL, SIDE_QUESTS, DREAMS, CHAPTERS } from '../data/quests.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { CONTACTS } from '../data/contacts.js';

export const currentQuest = () => QUESTS[S.quest.index] || null;
export const currentChapter = () => {
  const q = currentQuest();
  return CHAPTERS.find((c) => c.n === (q ? q.chapter : CHAPTERS.length)) || CHAPTERS[CHAPTERS.length - 1];
};

function eventMatches(goal, evt, d) {
  switch (goal.type) {
    case 'action':
      return evt === 'action' && goal.ids.includes(d.id);
    case 'minigame':
      return (
        evt === 'minigame' &&
        (!goal.id || goal.id === d.id) &&
        (goal.stars == null || d.stars >= goal.stars) &&
        (goal.score == null || d.score >= goal.score) &&
        (goal.mode == null || goal.mode === d.mode)
      );
    case 'buy':
      return evt === 'buy';
    case 'adopt':
      return evt === 'adopt';
    case 'travel':
      return evt === 'travel' && (!goal.to || goal.to === d.to);
    case 'reply':
      return evt === 'reply';
    case 'pet':
      return evt === 'petPlay';
    case 'exam':
      return evt === 'exam' && d.passed;
    default:
      return false;
  }
}

/** Goals that are a state rather than an event. Returns progress count or null. */
function stateProgress(goal) {
  switch (goal.type) {
    case 'skill':
      return levelOf(S.skills[goal.id]) >= goal.level ? goal.count : 0;
    case 'postcards':
      return goal.ids.filter((id) => S.postcards.includes(id)).length;
    case 'need':
      return S.needs[goal.id] >= goal.value ? goal.count : null;
    case 'money':
      return S.money >= goal.value ? goal.count : 0;
    case 'grades':
      return S.grades >= goal.value ? goal.count : 0;
    case 'flag':
      return S.flags[goal.flag] ? goal.count : 0;
    case 'stat':
      return (S.stats[goal.key] || 0) >= goal.value ? goal.count : 0;
    default:
      return null;
  }
}

function applyReward(r) {
  if (!r) return;
  if (r.money) addMoney(r.money, 'quest');
  if (r.xp) for (const [k, v] of Object.entries(r.xp)) S.skills[k] += v;
  if (r.item && !S.owned.includes(r.item)) S.owned.push(r.item);
  if (r.petFood) S.inventory.petFood += r.petFood;
  if (r.social) changeNeed('social', r.social);
  if (r.fun) changeNeed('fun', r.fun);
  if (r.grades) changeGrades(r.grades);
}

/** Human-readable progress of the current main quest, e.g. "4 200 / 6 000 ₽". */
export function questProgressText(q = currentQuest()) {
  if (!q) return '';
  const g = q.goal;
  if (g.type === 'money') return `${Math.min(S.money, g.value).toLocaleString('ru-RU')} / ${g.value.toLocaleString('ru-RU')} ₽`;
  if (g.type === 'grades') return `Успеваемость ${S.grades}% / ${g.value}%`;
  if (g.type === 'skill') return `Уровень ${levelOf(S.skills[g.id])} / ${g.level}`;
  if (g.type === 'stat') return `${Math.min(S.stats[g.key] || 0, g.value)} / ${g.value}`;
  if (g.count > 1) return `${S.quest.progress} / ${g.count}`;
  return '';
}

export function questFraction(q = currentQuest()) {
  if (!q) return 0;
  const g = q.goal;
  if (g.type === 'money') return Math.min(1, S.money / g.value);
  if (g.type === 'grades') return Math.min(1, S.grades / g.value);
  if (g.type === 'skill') return Math.min(1, levelOf(S.skills[g.id]) / g.level);
  if (g.type === 'stat') return Math.min(1, (S.stats[g.key] || 0) / g.value);
  return Math.min(1, S.quest.progress / g.count);
}

function advanceQuest(evt, d) {
  const q = currentQuest();
  if (!q) return;
  let changed = false;
  if (eventMatches(q.goal, evt, d)) {
    S.quest.progress++;
    changed = true;
  }
  const sp = stateProgress(q.goal);
  if (sp != null && sp !== S.quest.progress) {
    S.quest.progress = Math.max(S.quest.progress, sp);
    changed = true;
  }
  if (changed) bus.emit('questProgress', q);
  if (S.quest.progress >= q.goal.count) {
    // advance first: rewards emit events that re-enter this function
    S.quest.index++;
    S.quest.progress = 0;
    const nq = currentQuest();
    S.quest.id = nq ? nq.id : null;
    applyReward(q.reward);
    if (!nq) S.flags.allQuests = true;
    bus.emit('questDone', q);
    if (nq && nq.chapter > S.chapterSeen) {
      S.chapterSeen = nq.chapter;
      bus.emit('chapter', CHAPTERS.find((c) => c.n === nq.chapter));
    }
    const next = currentQuest();
    if (next && next.from) setTimeout(() => sendMessage(next.from.who, next.from.text), 2500);
    // the next quest may already be satisfied (e.g. skill level reached earlier)
    setTimeout(() => advanceQuest('check', {}), 100);
  }
}

// ---------------------------------------------------------------- dailies
export function ensureDailies() {
  if (S.daily.day === S.day) return;
  const pool = DAILY_POOL.filter((t) => !t.needsPet || S.pets.length);
  const picked = [];
  let seed = S.day * 7919 + 13;
  while (picked.length < 3 && picked.length < pool.length) {
    seed = (seed * 9301 + 49297) % 233280;
    const t = pool[seed % pool.length];
    if (!picked.find((p) => p.id === t.id)) picked.push(t);
  }
  S.daily = { day: S.day, tasks: picked.map((t) => ({ id: t.id, progress: 0, done: false })) };
}

function advanceDailies(evt, d) {
  for (const task of S.daily.tasks) {
    if (task.done) continue;
    const def = DAILY_POOL.find((t) => t.id === task.id);
    if (!def) continue;
    if (eventMatches(def.goal, evt, d)) task.progress++;
    const sp = stateProgress(def.goal);
    if (sp != null) task.progress = Math.max(task.progress, sp);
    if (task.progress >= def.goal.count) {
      task.done = true;
      addMoney(def.money, 'daily');
      bus.emit('dailyDone', def);
    }
  }
}

// ---------------------------------------------------------------- side quests (NPC requests)
export const sideDef = (id) => SIDE_QUESTS.find((q) => q.id === id);

export function offerSideQuest(force = false) {
  if (!S.started || S.side.length >= 2) return;
  if (!force && Math.random() < 0.5) return;
  const pool = SIDE_QUESTS.filter((q) => {
    if (S.side.some((a) => a.id === q.id)) return false;
    const last = S.sideDone[q.id];
    if (last != null && S.day - last < 6) return false;
    try {
      return q.when(S);
    } catch (e) {
      return false;
    }
  });
  if (!pool.length) return;
  const q = pool[Math.floor(Math.random() * pool.length)];
  S.side.push({ id: q.id, progress: 0, until: S.day + q.days });
  sendMessage(q.who, `${q.text}\n\n📌 Просьба: ${q.desc} (до ${q.days === 1 ? 'завтра' : q.days + ' дн.'})`);
  bus.emit('sideNew', q);
}

function advanceSide(evt, d) {
  for (const a of [...S.side]) {
    const q = sideDef(a.id);
    if (!q) continue;
    if (eventMatches(q.goal, evt, d)) a.progress++;
    const sp = stateProgress(q.goal);
    if (sp != null) a.progress = Math.max(a.progress, sp);
    if (a.progress >= q.goal.count) {
      S.side = S.side.filter((x) => x !== a);
      S.sideDone[q.id] = S.day;
      applyReward(q.reward);
      S.stats.sideDone = (S.stats.sideDone || 0) + 1;
      bus.emit('sideDone', q);
    }
  }
}

export function expireSideQuests() {
  for (const a of [...S.side]) {
    if (S.day > a.until) {
      const q = sideDef(a.id);
      S.side = S.side.filter((x) => x !== a);
      S.sideDone[a.id] = S.day;
      if (q) sendMessage(q.who, 'Ну ладно, в другой раз 😔');
      bus.emit('sideFailed', q);
    }
  }
}

// ---------------------------------------------------------------- dreams
export function dreamValue(d) {
  try {
    return d.measure(S, levelOf);
  } catch (e) {
    return 0;
  }
}

function checkDreams() {
  for (const d of DREAMS) {
    const v = dreamValue(d);
    let tier = S.dreams[d.id] || 0;
    while (tier < d.tiers.length && v >= d.tiers[tier]) {
      const reward = d.rewards[tier];
      tier++;
      S.dreams[d.id] = tier;
      addMoney(reward, 'dream');
      bus.emit('dream', { dream: d, tier, reward });
    }
  }
}

// ---------------------------------------------------------------- achievements
export function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (S.achievements[a.id]) continue;
    let ok = false;
    try {
      ok = a.check(S);
    } catch (e) {
      ok = false;
    }
    if (ok) {
      S.achievements[a.id] = S.day + 1;
      if (a.reward && !S.owned.includes(a.reward)) S.owned.push(a.reward);
      bus.emit('achievement', a);
    }
  }
}

// ---------------------------------------------------------------- messages
export function sendMessage(who, text, opts = {}) {
  if (!S.chats[who]) S.chats[who] = [];
  S.chats[who].push({ in: true, text, day: S.day, min: Math.floor(S.minutes), ...opts });
  S.unread++;
  bus.emit('message', { who, text, contact: CONTACTS[who] });
}

export function sendReply(who, text) {
  if (!S.chats[who]) S.chats[who] = [];
  S.chats[who].push({ in: false, text, day: S.day, min: Math.floor(S.minutes) });
  S.stats['replies_' + who] = (S.stats['replies_' + who] || 0) + 1;
  bus.emit('reply', { who });
}

export function markRead(who) {
  const unreadHere = (S.chats[who] || []).filter((m) => m.in && !m.read);
  unreadHere.forEach((m) => (m.read = true));
  S.unread = Math.max(0, S.unread - unreadHere.length);
}

export function unreadFor(who) {
  return (S.chats[who] || []).filter((m) => m.in && !m.read).length;
}

// ---------------------------------------------------------------- wiring
const IGNORE = new Set(['questProgress', 'questDone', 'dailyDone', 'achievement', 'message', 'xp', 'chapter', 'dream', 'sideDone', 'sideNew', 'sideFailed', 'debtPaid']);
let inited = false;
export function initProgress() {
  if (inited) return;
  inited = true;
  bus.on('*', (evt, d) => {
    if (IGNORE.has(evt)) return;
    advanceQuest(evt, d || {});
    advanceDailies(evt, d || {});
    advanceSide(evt, d || {});
    checkDreams();
    checkAchievements();
  });
  bus.on('levelup', () => advanceQuest('check', {}));
}

export { addXP };
