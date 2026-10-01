// Quests, daily tasks, achievements and phone messages — all driven by bus events.
import { S, addMoney, addXP, levelOf } from './state.js';
import { bus } from './bus.js';
import { QUESTS, DAILY_POOL } from '../data/quests.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { CONTACTS } from '../data/contacts.js';

export const currentQuest = () => QUESTS[S.quest.index] || null;

function eventMatches(goal, evt, d) {
  switch (goal.type) {
    case 'action':
      return evt === 'action' && goal.ids.includes(d.id);
    case 'minigame':
      return (
        evt === 'minigame' &&
        (!goal.id || goal.id === d.id) &&
        (goal.stars == null || d.stars >= goal.stars) &&
        (goal.score == null || d.score >= goal.score)
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
    applyReward(q.reward);
    S.quest.index++;
    S.quest.progress = 0;
    if (!currentQuest()) S.flags.allQuests = true;
    bus.emit('questDone', q);
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
const IGNORE = new Set(['questProgress', 'questDone', 'dailyDone', 'achievement', 'message', 'xp', 'money']);
export function initProgress() {
  bus.on('*', (evt, d) => {
    if (IGNORE.has(evt)) return;
    advanceQuest(evt, d || {});
    advanceDailies(evt, d || {});
    checkAchievements();
  });
  bus.on('levelup', () => advanceQuest('check', {}));
}

export { addXP };
