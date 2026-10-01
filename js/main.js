// Boot sequence & main loop.
import { S, load, save, reset, SKILLS } from './core/state.js';
import { bus } from './core/bus.js';
import { initProgress, ensureDailies, checkAchievements, sendMessage, currentQuest } from './core/progress.js';
import { SCENES } from './data/scenes.js';
import { CONFIG } from './config.js';
import { tick, ui, isBusy, showBanner, game } from './game.js';
import { mountWorld, loadScene, updateWorld, walkTo, setExpression, lanaAnim } from './ui/world.js';
import { mountHud, updateHud, flashQuestChip } from './ui/hud.js';
import { showActionMenu, showPetMenu, closeMenu } from './ui/menu.js';
import { openPhone, openShopTab, phoneOpen } from './ui/phone.js';
import { openWardrobe } from './ui/wardrobe.js';
import { showTitle, playIntro, travelCutscene, showPostcard, finale } from './ui/cutscenes.js';
import { toast, confetti } from './ui/fx.js';
import { dialog } from './ui/modal.js';
import { setAudio, playMusic, sfx, unlockAudio } from './audio.js';
import { initPwa } from './pwa.js';
import { wait } from './ui/dom.js';

const appEl = document.getElementById('app');

// UI hooks used by game.js (kept here to avoid circular imports at module-eval time)
Object.assign(ui, {
  openWardrobe: () => openWardrobe(),
  openShop: (tab) => (tab ? openShopTab(tab) : (openPhone('shop'), Promise.resolve())),
  openPhone: (a) => openPhone(a),
  travelCutscene,
  showPostcard,
  finale,
});

// ---------------------------------------------------------------- notifications
const BLOCKERS = '.minigame, .wardrobe, .fullscreen, .overlay, .story, .title-screen';
async function whenFree() {
  for (let i = 0; i < 600 && document.querySelector(BLOCKERS); i++) await wait(250);
}

function wireNotifications() {
  bus.on('message', ({ who, text, contact }) => {
    sfx('message');
    if (phoneOpen()) return;
    toast({
      icon: contact.emoji,
      title: contact.name,
      text: text.length > 70 ? text.slice(0, 68) + '…' : text,
      onClick: () => openPhone('messages'),
    });
    if (who === 'lover') setExpression('kiss', 1800);
  });
  bus.on('questProgress', () => updateHud());
  bus.on('questDone', async (q) => {
    flashQuestChip();
    await whenFree();
    confetti(70);
    sfx('fanfare');
    const rw = [];
    if (q.reward.money) rw.push(`💰 +${q.reward.money} ₽`);
    if (q.reward.item) rw.push('🎁 новый предмет в гардеробе');
    if (q.reward.petFood) rw.push(`🥫 корм ×${q.reward.petFood}`);
    if (q.reward.xp) for (const k of Object.keys(q.reward.xp)) rw.push(`${SKILLS.find((s) => s.id === k).icon} +${q.reward.xp[k]} опыта`);
    const next = currentQuest();
    lanaAnim('joy', 1100);
    setExpression('excited', 2400);
    await dialog({
      icon: q.icon,
      title: `Задание выполнено!`,
      html: `<p style="margin-top:-4px"><b style="color:var(--ink)">${q.title}</b></p><div class="rewards">${rw.map((r) => `<span class="reward">${r}</span>`).join('')}</div>
        ${next ? `<div class="card quest" style="text-align:left;margin-bottom:6px"><div class="qi">${next.icon}</div><div><h4>Дальше: ${next.title}</h4><p>${next.desc}</p></div></div>` : '<p>👑 Все задания пройдены! Диадема ждёт в гардеробе.</p>'}`,
      buttons: [{ label: 'Ура! 🎉', value: true }],
    });
    updateHud();
    save();
  });
  bus.on('dailyDone', (d) => {
    sfx('coin');
    toast({ icon: '✅', title: `Задание дня: ${d.text}`, text: `+${d.money} ₽` });
  });
  bus.on('achievement', async (a) => {
    await whenFree();
    sfx('levelup');
    toast({ icon: a.icon, title: `🏆 ${a.name}`, text: a.reward ? `${a.desc} · 🎁 новый предмет!` : a.desc, time: 4200, onClick: () => openPhone('achievements') });
  });
  bus.on('levelup', ({ skill, level }) => {
    const s = SKILLS.find((x) => x.id === skill);
    sfx('levelup');
    toast({ icon: s.icon, title: `${s.name}: уровень ${level}!`, text: 'Лана становится лучше с каждым днём ✨', time: 3600 });
  });
}

// ---------------------------------------------------------------- loop
let lastT = performance.now();
let hudT = 0;
let saveT = 0;
function loop(t) {
  const dt = Math.min(0.1, (t - lastT) / 1000);
  lastT = t;
  tick(dt);
  updateWorld(dt);
  hudT += dt;
  if (hudT > 0.2) {
    hudT = 0;
    updateHud();
  }
  saveT += dt;
  if (saveT > 10) {
    saveT = 0;
    save();
  }
  requestAnimationFrame(loop);
}

function startGame(firstRun) {
  mountWorld(appEl, {
    onHotspot: (h, rect) => {
      if (isBusy()) return;
      showActionMenu(h, rect);
    },
    onPet: (p, rect) => {
      if (isBusy()) return;
      showPetMenu(p, rect);
    },
    onFloor: (x) => {
      closeMenu();
      if (!isBusy()) walkTo(x);
    },
  });
  if (!SCENES[S.scene]) S.scene = 'dorm';
  loadScene(S.scene);
  mountHud(appEl, { openPhone });
  initProgress();
  ensureDailies();
  wireNotifications();
  checkAchievements();
  updateHud();
  game.lastHour = Math.floor(S.minutes / 60);
  playMusic(SCENES[S.scene].music);
  setTimeout(() => showBanner(SCENES[S.scene]), 400);
  if (firstRun) {
    setTimeout(() => sendMessage('lover', CONFIG.loveNotes[0]), 3500);
    setTimeout(() => {
      const q = currentQuest();
      if (q && q.from) sendMessage(q.from.who, q.from.text);
    }, 6000);
  }
  requestAnimationFrame((t) => {
    lastT = t;
    loop(t);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) save();
  });
  window.addEventListener('pagehide', save);
  // keyboard shortcuts for desktop
  window.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (document.querySelector('.minigame')) return;
    if (e.key === ' ') {
      S.settings.speed = S.settings.speed ? 0 : 1;
      updateHud();
      e.preventDefault();
    } else if (e.key === 'p' || e.key === 'з') openPhone();
  });
}

async function boot() {
  initPwa();
  const hasSave = load() && S.started;
  setAudio({ sound: S.settings.sound, music: S.settings.music });
  const splash = document.querySelector('.splash');
  if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, wait(1500)]);
  splash.classList.add('hide');
  setTimeout(() => splash.remove(), 700);
  const choice = await showTitle({ hasSave });
  unlockAudio();
  let firstRun = false;
  if (choice === 'new') {
    reset();
    setAudio({ sound: S.settings.sound, music: S.settings.music });
    await playIntro();
    S.started = true;
    firstRun = true;
    save();
  }
  startGame(firstRun);
}

window.addEventListener('error', (e) => console.error('Ошибка игры:', e.message));
// handy for debugging from the browser console
window.__lana = { get S() { return S; }, game, save, bus };
boot();
