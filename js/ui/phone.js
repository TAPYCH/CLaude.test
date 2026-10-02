// Lana's phone — the main menu of the game.
import { S, NEEDS, SKILLS, levelOf, levelProgress, MAX_LEVEL, save, reset, exportSave, importSave, addMoney, changeNeed } from '../core/state.js';
import { formatClock, formatDate, money, weekday, plural } from '../core/time.js';
import { QUESTS, DAILY_POOL, CHAPTERS, DREAMS } from '../data/quests.js';
import { BARISTA_RANKS, EQUIPMENT, LAB_RENT, STIPEND, RENT } from '../data/career.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { CONTACTS, REPLIES, ANSWERS, PHOTO_ANSWERS, STICKERS, ONLINE } from '../data/contacts.js';
import { MAP, EXCURSIONS, postcardArt } from '../data/places.js';
import { SCENES } from '../data/scenes.js';
import { PET_TYPES, renderPet } from '../art/pets.js';
import { renderLanaHead, renderLana } from '../art/character.js';
import { currentQuest, currentChapter, questProgressText, questFraction, sideDef, dreamValue, sendReply, markRead, unreadFor } from '../core/progress.js';
import { goScene, travel, excursion, TRAVEL, adoptPet, feedPet, pauseTime, resumeTime, playPetGame, rentLab, buyEquipment, buyDecor, baristaRank, labBonus } from '../game.js';
import { DECOR } from '../data/decor.js';
import { openWardrobe } from './wardrobe.js';
import { el, app, esc, wait, vibrate, setHaptics } from './dom.js';
import { sfx, setAudio } from '../audio.js';
import { dialog, prompt } from './modal.js';
import { toast } from './fx.js';
import { updateHud } from './hud.js';
import { rebuildPet, setExpression } from './world.js';
import { bus } from '../core/bus.js';
import { install, canInstall } from '../pwa.js';

const APPS = [
  { id: 'path', name: 'Мой путь', icon: '🧭', bg: 'linear-gradient(160deg,#ffb8c9,#ff7aa2)' },
  { id: 'map', name: 'Карта', icon: '🗺️', bg: 'linear-gradient(160deg,#9be7c4,#3fcfae)' },
  { id: 'wardrobe', name: 'Гардероб', icon: '👗', bg: 'linear-gradient(160deg,#ffc1d6,#ff6f9c)' },
  { id: 'shop', name: 'Магазин', icon: '🛍️', bg: 'linear-gradient(160deg,#ffd59a,#ff9a2e)' },
  { id: 'pets', name: 'Питомцы', icon: '🐾', bg: 'linear-gradient(160deg,#ffe3b3,#ffb54f)' },
  { id: 'messages', name: 'Чаты', icon: '💬', bg: 'linear-gradient(160deg,#b9e0ff,#4fb3ff)' },
  { id: 'quests', name: 'Задания', icon: '📋', bg: 'linear-gradient(160deg,#d6c8ff,#9a7bff)' },
  { id: 'achievements', name: 'Награды', icon: '🏆', bg: 'linear-gradient(160deg,#fff0a8,#ffc23d)' },
  { id: 'profile', name: 'Я', icon: '💖', bg: 'linear-gradient(160deg,#ffd1e8,#f79ac0)' },
  { id: 'album', name: 'Альбом', icon: '📸', bg: 'linear-gradient(160deg,#e6e1ff,#b6a6ff)' },
  { id: 'lab', name: 'Лаборатория', icon: '🦷', bg: 'linear-gradient(160deg,#b8f0e6,#3fbfae)', when: () => S.flags.diploma },
  { id: 'settings', name: 'Настройки', icon: '⚙️', bg: 'linear-gradient(160deg,#eef0f4,#c4c9d6)' },
];

let phone = null;

export function openPhone(appId = null) {
  if (phone) {
    if (appId) openApp(appId);
    return;
  }
  pauseTime();
  const wrap = el(`<div class="phone-wrap"><div class="phone"><div class="phone-screen">
      <div class="phone-notch"></div>
      <div class="phone-status"><span data-time></span><span>📶 🔋</span></div>
      <div class="phone-home"></div>
    </div><button class="phone-close" aria-label="Закрыть телефон"><i></i></button></div></div>`);
  app().appendChild(wrap);
  document.body.classList.add('phone-open');
  phone = { wrap, screen: wrap.querySelector('.phone-screen'), home: wrap.querySelector('.phone-home') };
  wrap.querySelector('[data-time]').textContent = formatClock(S.minutes);
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap) closePhone();
  });
  wrap.querySelector('.phone-close').addEventListener('click', closePhone);
  renderHome();
  if (appId) openApp(appId);
}

export function closePhone() {
  if (!phone) return;
  sfx('whoosh');
  const w = phone.wrap;
  phone = null;
  document.body.classList.remove('phone-open');
  w.classList.add('closing');
  setTimeout(() => w.remove(), 250);
  resumeTime();
  updateHud();
}

const isOpen = () => !!phone;
export { isOpen as phoneOpen };

function renderHome() {
  const q = currentQuest();
  const dailies = S.daily.tasks
    .map((t) => {
      const d = DAILY_POOL.find((x) => x.id === t.id);
      return d ? `<div class="row" style="gap:8px;margin:4px 0;font-weight:800;font-size:14px;${t.done ? 'opacity:.55;text-decoration:line-through' : ''}"><span>${t.done ? '✅' : d.icon}</span><span style="flex:1">${d.text}</span><span class="chip orange">+${d.money} ₽</span></div>` : '';
    })
    .join('');
  phone.home.innerHTML = `
    <div class="phone-hello">
      <div class="av">${renderLanaHead({ outfit: S.outfit, expr: 'happy' })}</div>
      <div><h3>Привет, Лана!</h3><p>${formatDate(S.day, true)} · ${formatClock(S.minutes)}</p></div>
    </div>
    <div class="app-grid">${APPS.filter((a) => !a.when || a.when()).map((a, i) => {
      const badge = a.id === 'messages' ? S.unread : a.id === 'quests' ? S.daily.tasks.filter((t) => !t.done).length : a.id === 'path' ? S.side.length : 0;
      return `<button class="app-icon" data-app="${a.id}" style="animation-delay:${i * 0.03}s"><div class="ai" style="background:${a.bg}">${a.icon}</div><span>${a.name}</span>${badge ? `<b class="badge">${badge}</b>` : ''}</button>`;
    }).join('')}</div>
    ${q ? `<button class="widget widget-btn" data-open-path><h5>Глава ${q.chapter} · ${esc(currentChapter().title)}</h5><div class="quest"><div class="qi">${q.icon}</div><div style="flex:1;min-width:0"><h4>${q.title}</h4><p>${q.desc}</p>
      ${questProgressText(q) ? `<div class="row" style="gap:8px;margin-top:6px"><div class="bar lav" style="flex:1;margin:0"><i style="width:${questFraction(q) * 100}%"></i></div><b class="qp">${questProgressText(q)}</b></div>` : ''}</div></div></button>` : ''}
    <div class="widget"><h5>Задания дня</h5>${dailies || '<p class="muted">Новые задания появятся завтра</p>'}</div>`;
  phone.home.querySelectorAll('[data-app]').forEach((b) =>
    b.addEventListener('click', () => {
      sfx('pop');
      openApp(b.dataset.app);
    }),
  );
  const wp = phone.home.querySelector('[data-open-path]');
  if (wp)
    wp.addEventListener('click', () => {
      sfx('pop');
      openApp('path');
    });
}

function view(title, { tabs = '' } = {}) {
  const v = el(`<div class="app-view"><div class="app-head"><button class="back" aria-label="Назад">‹</button><h3>${title}</h3></div>${tabs}<div class="app-body"></div></div>`);
  phone.screen.appendChild(v);
  v.querySelector('.back').addEventListener('click', () => {
    sfx('click');
    v.remove();
    renderHome();
  });
  return v;
}

async function openApp(id) {
  if (!phone) return;
  phone.screen.querySelectorAll('.app-view').forEach((v) => v.remove());
  if (id === 'wardrobe') {
    closePhone();
    await openWardrobe();
    return;
  }
  const fn = { path: appPath, lab: appLab, map: appMap, shop: appShop, pets: appPets, messages: appMessages, quests: appQuests, achievements: appAchievements, profile: appProfile, album: appAlbum, settings: appSettings }[id];
  if (fn) fn();
}

// ================================================================ MY PATH (progress dashboard)
const stars3 = (n, of = 3) => '★'.repeat(n) + '☆'.repeat(Math.max(0, of - n));

/** Context-aware advice: what Lana should do right now. */
function adviceList() {
  const out = [];
  const h = S.minutes / 60;
  const wd = weekday(S.day);
  const low = NEEDS.filter((n) => S.needs[n.id] < 25).sort((a, b) => S.needs[a.id] - S.needs[b.id]);
  if (low.length) {
    const n = low[0];
    const how = { hunger: 'перекуси или приготовь еду', energy: 'поспи или выпей кофе', fun: 'погуляй, поиграй или позвони любимому', hygiene: 'прими душ', social: 'поболтай с кем-нибудь или ответь в чатах' }[n.id];
    out.push({ icon: n.icon, text: `${n.name} на нуле — ${how}.` });
  }
  if (S.debt > 0) out.push({ icon: '💸', text: `Долг за общежитие ${money(S.debt)} — он спишется с ближайшего заработка.` });
  else if (S.city === 'moscow' && !S.flags.diploma && (wd === 5 || wd === 6) && S.money < RENT) out.push({ icon: '🏠', text: `В понедельник оплата общежития ${money(RENT)}, а на счету меньше. Подработай!` });
  if (!S.flags.diploma && S.city === 'moscow' && wd < 5 && h >= 7 && h < 15 && S.flags.lectureDay !== S.day && S.quest.index >= 1)
    out.push({ icon: '🎓', text: 'Сегодня пары (до 15:00). Пропуск снизит успеваемость на 5%.', go: 'college' });
  if (!S.flags.diploma && S.grades < STIPEND.min) out.push({ icon: '📉', text: `Успеваемость ${S.grades}% — без стипендии. Пары, конспекты и коллоквиумы поднимут её.` });
  if (S.pets.some((p) => p.hunger < 25)) out.push({ icon: '🐾', text: 'Питомец проголодался — покорми его (Телефон → Питомцы).' });
  if (S.inventory.groceries + (S.inventory.meals || 0) + S.inventory.snacks === 0) out.push({ icon: '🛒', text: 'Дома пусто: купи продукты (Магазин → Продукты), готовить дешевле, чем есть в кафе.' });
  for (const a of S.side) {
    const d = sideDef(a.id);
    if (d && a.until - S.day <= 1) out.push({ icon: d.icon, text: `Срочно: «${d.title}» — ${d.desc}.` });
  }
  return out.slice(0, 4);
}

function appPath() {
  const v = view('🧭 Мой путь');
  const body = v.querySelector('.app-body');
  const q = currentQuest();
  const ch = currentChapter();
  const chQuests = QUESTS.filter((x) => x.chapter === ch.n);
  const chDone = chQuests.filter((x) => QUESTS.indexOf(x) < S.quest.index).length;
  const rank = baristaRank();
  const rk = BARISTA_RANKS[rank];
  const nextRk = BARISTA_RANKS[rank + 1];
  const shifts = S.stats.mg_barista || 0;
  const charm = levelOf(S.skills.charm);
  const toMonday = (7 - weekday(S.day)) % 7 || 7;
  const stipend = S.grades >= STIPEND.highMin ? STIPEND.high : S.grades >= STIPEND.min ? STIPEND.base : 0;

  body.innerHTML = `
    <div class="path-chapters">${CHAPTERS.map((c) => `<div class="pc ${c.n < ch.n || !q ? 'done' : c.n === ch.n ? 'on' : ''}"><span>${c.n < ch.n || !q ? '✓' : c.icon}</span></div>`).join('<i></i>')}</div>
    <div class="card path-hero">
      <div class="muted" style="font-weight:900">ГЛАВА ${ch.n} ИЗ ${CHAPTERS.length}</div>
      <h3>${ch.icon} ${esc(ch.title)}</h3><p class="muted" style="margin:0 0 8px">${esc(ch.sub)}</p>
      <div class="bar lav"><i style="width:${q ? (chDone / chQuests.length) * 100 : 100}%"></i></div>
      <div class="muted" style="margin-top:4px;font-size:12px">Заданий главы: ${q ? chDone : chQuests.length} / ${chQuests.length}</div>
    </div>
    ${q ? `<div class="section-title">Сейчас</div>
    <div class="card quest"><div class="qi">${q.icon}</div><div style="flex:1;min-width:0"><h4>${q.title}</h4><p>${q.desc}</p>
      <p style="margin-top:6px"><span class="chip lav">💡 ${q.hint}</span></p>
      ${questProgressText(q) ? `<div class="row" style="gap:8px;margin-top:8px"><div class="bar lav" style="flex:1;margin:0"><i style="width:${questFraction(q) * 100}%"></i></div><b class="qp">${questProgressText(q)}</b></div>` : ''}
      ${q.target && SCENES[q.target.scene] && SCENES[q.target.scene].city === S.city && q.target.scene !== S.scene && (q.target.scene !== 'mylab' || S.lab.owned) ? `<button class="btn small mint" style="margin-top:10px" data-go="${q.target.scene}">Отправиться: ${SCENES[q.target.scene].name} ›</button>` : ''}
    </div></div>` : '<div class="card" style="text-align:center"><b>👑 Сюжет пройден!</b><p class="muted">Мечты и заказы ждут — жизнь продолжается.</p></div>'}
    ${(() => {
      const adv = adviceList();
      return adv.length ? `<div class="section-title">Советы на сейчас</div><div class="card">${adv.map((a) => `<div class="advice"><span>${a.icon}</span><p>${esc(a.text)}</p>${a.go && a.go !== S.scene ? `<button class="btn small ghost" data-go="${a.go}">›</button>` : ''}</div>`).join('')}</div>` : '';
    })()}
    <div class="section-title">Просьбы близких</div>
    ${S.side.length ? `<div class="list">${S.side.map((a) => {
      const d = sideDef(a.id);
      if (!d) return '';
      const left = a.until - S.day;
      const c = CONTACTS[d.who];
      const rw = [d.reward.money ? money(d.reward.money) : '', d.reward.grades ? `+${d.reward.grades}% успеваемости` : '', d.reward.social ? '💬 общение' : ''].filter(Boolean).join(' · ');
      return `<div class="card quest"><div class="qi">${d.icon}</div><div style="flex:1;min-width:0"><h4>${d.title}</h4><p>${c ? c.emoji + ' ' + esc(c.name) + ': ' : ''}${esc(d.desc)}</p>
        <p style="margin-top:6px"><span class="chip ${left <= 1 ? 'red' : 'orange'}">⏳ ${left <= 0 ? 'сегодня последний день' : left === 1 ? 'до завтра' : `ещё ${left} ${plural(left, 'день', 'дня', 'дней')}`}</span> <span class="chip mint">🎁 ${rw}</span></p>
        ${d.goal.count > 1 ? `<div class="bar mint"><i style="width:${(a.progress / d.goal.count) * 100}%"></i></div>` : ''}</div></div>`;
    }).join('')}</div>` : '<p class="muted" style="margin:0 4px 6px">Пока никто ничего не просил. Просьбы приходят в чат — выполняй их, чтобы заработать и порадовать близких.</p>'}
    ${!S.flags.diploma ? `<div class="section-title">Учёба</div>
    <div class="card">
      <div class="row" style="justify-content:space-between;font-weight:900"><span>📈 Успеваемость</span><span>${S.grades}%</span></div>
      <div class="grade-bar"><i style="width:${S.grades}%"></i><s style="left:${STIPEND.min}%" title="стипендия"></s><s style="left:60%" title="допуск"></s><s style="left:${STIPEND.highMin}%" title="повышенная"></s></div>
      <div class="grade-legend"><span>${STIPEND.min}% стипендия</span><span>60% допуск</span><span>${STIPEND.highMin}% повышенная</span></div>
      <p class="muted" style="margin:8px 0 0;font-size:13px">Стипендия в понедельник (через ${toMonday} ${plural(toMonday, 'день', 'дня', 'дней')}): <b style="color:var(--ink)">${stipend ? money(stipend) : 'не положена'}</b><br/>
      Пары по будням 9:00–15:00 (+успеваемость), прогул −5%. Посещено: ${S.attendance}${S.stats.skips ? ` · пропущено: ${S.stats.skips}` : ''}</p>
    </div>` : ''}
    <div class="section-title">Деньги</div>
    <div class="card" style="font-weight:800;font-size:14px;line-height:1.8">
      💰 На счету: ${money(S.money)}${S.debt ? ` · <span style="color:var(--danger)">долг ${money(S.debt)}</span>` : ''}<br/>
      ${S.city === 'moscow' || !S.flags.diploma ? `🏠 Общежитие: −${money(RENT)} по понедельникам<br/>` : ''}
      💛 Мама присылает ${money(1500)} по пятницам<br/>
      ☕ Смена в «Пенке»: ${money(rk.pay)} + чаевые
    </div>
    <div class="section-title">Карьера</div>
    <div class="card">
      <div class="row" style="gap:10px"><div style="font-size:30px">☕</div><div style="flex:1"><b>${rk.name}</b> <span class="muted">· кофейня «Пенка»</span>
      ${nextRk ? `<div class="muted" style="font-size:13px">Следующий ранг «${nextRk.name}» (${money(nextRk.pay)}/смена): смен ${Math.min(shifts, nextRk.shifts)}/${nextRk.shifts} ${shifts >= nextRk.shifts ? '✅' : ''} · обаяние ${Math.min(charm, nextRk.charm)}/${nextRk.charm} ${charm >= nextRk.charm ? '✅' : ''}</div>` : '<div class="muted" style="font-size:13px">Высший ранг! 👑</div>'}</div></div>
      <div class="row" style="gap:10px;margin-top:10px"><div style="font-size:30px">🦷</div><div style="flex:1"><b>${S.lab.owned ? 'Lana Dental' : S.flags.diploma ? 'Фриланс-техник' : 'Студентка-техник'}</b>
      <div class="muted" style="font-size:13px">${S.lab.owned ? `Оборудование ${S.lab.upgrades.length}/${EQUIPMENT.length} · бонус к заказам +${Math.round(labBonus() * 100)}% · заказов: ${S.lab.orders || 0}` : S.flags.diploma ? `Цель: своя лаборатория в Сухуме (аренда ${money(LAB_RENT)})` : 'Диплом откроет заказы и собственную лабораторию'}</div></div></div>
    </div>
    <div class="section-title">Мечты</div>
    <div class="list">${DREAMS.map((d) => {
      const tier = S.dreams[d.id] || 0;
      const val = dreamValue(d);
      const next = d.tiers[tier];
      const prev = tier ? d.tiers[tier - 1] : 0;
      const f = next == null ? 1 : Math.max(0, Math.min(1, (val - prev) / (next - prev)));
      return `<div class="card dream"><div class="de">${d.icon}</div><div style="flex:1;min-width:0"><div class="row" style="justify-content:space-between"><b>${d.title}</b><span class="dstars">${stars3(tier)}</span></div>
        <div class="muted" style="font-size:12.5px">${d.desc}: ${val.toLocaleString('ru-RU')}${next != null ? ` / ${next.toLocaleString('ru-RU')} · 🎁 ${money(d.rewards[tier])}` : ' · исполнена! 🌟'}</div>
        <div class="bar" style="margin-top:4px"><i style="width:${f * 100}%"></i></div></div></div>`;
    }).join('')}</div>`;

  body.querySelectorAll('[data-go]').forEach((b) =>
    b.addEventListener('click', async () => {
      sfx('click');
      closePhone();
      await goScene(b.dataset.go);
    }),
  );
}

// ================================================================ OWN LAB
function appLab() {
  const v = view('🦷 Lana Dental');
  const body = v.querySelector('.app-body');
  const render = () => {
    if (!S.lab.owned) {
      body.innerHTML = `<div class="card" style="text-align:center;padding:20px">
        <div style="font-size:56px">🔑</div><h3 style="margin:6px 0">Помещение у набережной</h3>
        <p class="muted">Светлая комната с видом на море в Сухуме. Здесь может быть твоя лаборатория.</p>
        <p style="font-weight:900">Аренда: ${money(LAB_RENT)}</p>
        ${S.city !== 'abkhazia' ? '<p class="muted">Помещение в Абхазии — сначала нужно туда приехать.</p>' : ''}
        <button class="btn block mint" data-rent ${S.money < LAB_RENT || S.city !== 'abkhazia' ? 'disabled' : ''}>Арендовать</button>
        ${S.money < LAB_RENT ? `<p class="muted" style="margin-top:8px">Не хватает ${money(LAB_RENT - S.money)}. Заказы лаборатории в общежитии хорошо платят!</p>` : ''}</div>`;
      const b = body.querySelector('[data-rent]');
      b.addEventListener('click', async () => {
        if (!rentLab()) return;
        closePhone();
        await goScene('mylab');
        toast({ icon: '🔑', title: 'Ключи у тебя!', text: 'Купи оборудование — каждое увеличивает доход с заказов' });
      });
      return;
    }
    const bonus = Math.round(labBonus() * 100);
    body.innerHTML = `<div class="card"><div class="row" style="justify-content:space-between"><b>Бонус к оплате заказов</b><b style="color:var(--mint-d,#2bb79a)">+${bonus}%</b></div>
        <div class="bar mint"><i style="width:${(S.lab.upgrades.length / EQUIPMENT.length) * 100}%"></i></div>
        <div class="muted" style="margin-top:4px;font-size:13px">Оборудование ${S.lab.upgrades.length}/${EQUIPMENT.length} · выполнено заказов: ${S.lab.orders || 0} · баланс ${money(S.money)}</div></div>
      <div class="section-title">Каталог оборудования</div>
      <div class="list">${EQUIPMENT.map((e) => {
        const has = S.lab.upgrades.includes(e.id);
        return `<div class="card row equip ${has ? 'owned' : ''}"><div style="font-size:34px">${e.icon}</div><div style="flex:1;min-width:0"><b>${e.name}</b><div class="muted" style="font-size:13px">${e.desc}</div></div>
          ${has ? '<span class="chip mint">✓ есть</span>' : `<button class="btn small orange" data-buy="${e.id}" ${S.money < e.price ? 'disabled' : ''}>${money(e.price)}</button>`}</div>`;
      }).join('')}</div>`;
    body.querySelectorAll('[data-buy]').forEach((b) =>
      b.addEventListener('click', () => {
        const e = EQUIPMENT.find((x) => x.id === b.dataset.buy);
        if (buyEquipment(e.id)) {
          toast({ icon: e.icon, title: `${e.name} — куплено!`, text: `Бонус к заказам: +${Math.round(labBonus() * 100)}%` });
          render();
        }
      }),
    );
  };
  render();
}
export function openLabShop() {
  openPhone('lab');
}

// ================================================================ MAP
function mapArt(city) {
  if (city === 'moscow')
    return `<svg viewBox="0 0 400 300"><rect width="400" height="300" fill="#eef3e6"/>
      ${[[20, 20, 110, 70], [150, 30, 90, 60], [270, 20, 110, 80], [30, 120, 80, 70], [280, 130, 100, 70], [40, 220, 120, 60], [190, 230, 80, 50], [300, 230, 80, 55]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#e2e8d6"/>`).join('')}
      <ellipse cx="140" cy="200" rx="70" ry="44" fill="#bfe3a8"/><circle cx="120" cy="196" r="12" fill="#9fd88a"/><circle cx="160" cy="210" r="16" fill="#9fd88a"/>
      <circle cx="210" cy="150" r="120" fill="none" stroke="#fff" stroke-width="12"/><circle cx="210" cy="150" r="70" fill="none" stroke="#fff" stroke-width="9"/>
      <path d="M-10,120 C80,90 120,170 200,150 C280,130 300,210 410,180" fill="none" stroke="#8fcfff" stroke-width="18" stroke-linecap="round"/>
      <path d="M210,0 L210,300 M0,150 L400,150" stroke="#fff" stroke-width="6"/>
      <path d="M200,140 l10,-10 l10,10 l-4,16 l-12,0 Z" fill="#e94b5a"/></svg>`;
  return `<svg viewBox="0 0 400 300"><rect width="400" height="300" fill="#bfe8ff"/>
    <path d="M0,0 L400,0 L400,190 C340,200 300,170 250,210 C200,240 140,200 90,230 C50,250 20,230 0,240 Z" fill="#d9efc4"/>
    <path d="M0,0 L400,0 L400,80 C320,100 280,60 200,90 C130,110 80,70 0,100 Z" fill="#b9d9a4"/>
    ${[[60, 40], [140, 30], [220, 50], [300, 30], [360, 60]].map(([x, y]) => `<path d="M${x - 30},${y + 30} L${x},${y - 14} L${x + 30},${y + 30} Z" fill="#9ab7c9"/><path d="M${x - 10},${y + 1} L${x},${y - 14} L${x + 10},${y + 1} Z" fill="#fff"/>`).join('')}
    <ellipse cx="120" cy="70" rx="22" ry="10" fill="#4fd0c8"/>
    ${[[280, 130], [300, 120], [310, 140], [290, 145]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#7cc46a"/><circle cx="${x + 2}" cy="${y - 2}" r="2.6" fill="#ff9a2e"/>`).join('')}
    <path d="M30,270 q20,-6 40,0 M250,270 q30,-6 60,0 M150,285 q20,-4 40,0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>
    <text x="300" y="285" font-family="Nunito" font-weight="900" font-size="14" fill="#5aa0d8">Чёрное море</text></svg>`;
}

function appMap() {
  let city = S.city;
  const v = view('🗺️ Карта');
  const body = v.querySelector('.app-body');
  const q = currentQuest();
  const isTarget = (p) => q && q.target && p.scene && p.scene === q.target.scene && p.scene !== S.scene;
  const render = () => {
    const pins = MAP[city].pins;
    const here = city === S.city;
    body.innerHTML = `
      <div class="city-switch">${['moscow', 'abkhazia'].map((c) => `<button data-city="${c}" class="${c === city ? 'on' : ''}">${c === 'moscow' ? '🏙️ Москва' : '🌴 Абхазия'}</button>`).join('')}</div>
      <div class="map">${mapArt(city)}${pins
        .filter((p) => !p.locked || S.flags.diploma || S.lab.owned)
        .map((p) => `<button class="pin ${p.scene === S.scene ? 'here' : ''} ${p.locked && !S.lab.owned ? 'locked' : ''} ${isTarget(p) ? 'target' : ''}" data-i="${pins.indexOf(p)}" style="left:${p.x}%;top:${p.y}%"><div class="pi"><span>${p.locked && !S.lab.owned ? '🔑' : p.icon}</span></div><b>${p.name}</b></button>`)
        .join('')}</div>
      ${here ? `<p class="muted" style="margin:12px 4px">Нажми на место, чтобы туда отправиться. Дорога по городу занимает ~30 минут.</p>` : ''}
      ${!here ? `<div class="section-title">Поездка ${city === 'abkhazia' ? 'домой, в Абхазию' : 'в Москву'}</div>
        <div class="list">${Object.entries(TRAVEL).map(([k, t]) => `<div class="card"><div class="row"><div style="font-size:34px">${t.icon}</div><div style="flex:1"><b>${t.name}</b><div class="muted">${t.desc} · ${t.hours} ч</div></div></div>
          <button class="btn block ${k === 'train' ? 'mint' : 'lav'}" style="margin-top:10px" data-travel="${k}" ${S.money < t.price ? 'disabled' : ''}>Купить билет · ${money(t.price)}</button></div>`).join('')}</div>
        ${S.money < TRAVEL.train.price ? '<p class="muted" style="margin:10px 4px">Не хватает денег? Смены в кофейне и сбор мандаринов хорошо платят 😉</p>' : ''}` : ''}`;
    body.querySelectorAll('[data-city]').forEach((b) =>
      b.addEventListener('click', () => {
        sfx('click');
        city = b.dataset.city;
        render();
      }),
    );
    body.querySelectorAll('.pin').forEach((b) =>
      b.addEventListener('click', () => onPin(MAP[city].pins[+b.dataset.i], city)),
    );
    body.querySelectorAll('[data-travel]').forEach((b) =>
      b.addEventListener('click', async () => {
        sfx('click');
        const mode = b.dataset.travel;
        const t = TRAVEL[mode];
        const ok = await dialog({ icon: t.icon, title: t.name, text: `${money(t.price)} · в пути ${t.hours} ч.\nПоехали?`, buttons: [{ label: 'В путь! 🎒', value: true, cls: 'mint' }, { label: 'Не сейчас', value: false, cls: 'ghost' }] });
        if (!ok) return;
        closePhone();
        await travel(city, mode);
      }),
    );
  };
  const onPin = async (p, c) => {
    sfx('tap');
    if (c !== S.city) {
      toast({ icon: '✈️', title: 'Это другой город', text: 'Сначала купи билет ниже 👇' });
      return;
    }
    if (p.locked && !S.lab.owned) {
      if (!S.flags.diploma) {
        await dialog({ icon: '🔒', title: p.name, text: 'Это помещение у набережной пока закрыто.\nОно откроется в главе 5 — после диплома 🎓', buttons: [{ label: 'Понятно', value: true }] });
        return;
      }
      openApp('lab');
      return;
    }
    if (p.scene) {
      if (p.scene === S.scene) {
        toast({ icon: '📍', title: 'Ты уже здесь!' });
        return;
      }
      closePhone();
      await goScene(p.scene);
    } else {
      const ex = EXCURSIONS[p.excursion];
      const got = S.postcards.includes(ex.id);
      const ok = await dialog({
        icon: ex.icon, title: ex.name,
        html: `<div style="border-radius:16px;overflow:hidden;margin:6px 0 12px;box-shadow:var(--shadow-m)">${postcardArt(ex.id)}</div>`,
        text: `${ex.text}\n\n⏱ ${ex.hours} ч · ${ex.price ? money(ex.price) : 'бесплатно'} · +${ex.needs.fun} 🎀${got ? '\n✅ Открытка уже в альбоме' : '\n🖼️ Новая открытка в альбом!'}`,
        buttons: [{ label: 'Поехали!', value: true, cls: 'mint', disabled: S.money < ex.price }, { label: 'В другой раз', value: false, cls: 'ghost' }],
      });
      if (!ok) return;
      closePhone();
      await excursion(ex);
    }
  };
  render();
}

// ================================================================ SHOP
const FOOD = [
  { id: 'groceries', name: 'Пакет продуктов', icon: '🛒', price: 450, desc: 'На 1 готовку (2 порции)' },
  { id: 'snacks', name: 'Перекус', icon: '🥪', price: 160, desc: 'Сэндвич или йогурт' },
  { id: 'petFood', name: 'Корм для питомца', icon: '🥫', price: 120, desc: 'Одна миска' },
  { id: 'sweets', name: 'Конфеты «Москва»', icon: '🍬', price: 600, desc: 'Гостинец для бабушки — привези в Абхазию', city: 'moscow' },
];

function appShop(tab = 'clothes') {
  const v = view('🛍️ Магазин', { tabs: `<div class="tabs">${[['clothes', '👗 Одежда'], ['salon', '💇‍♀️ Салон'], ['decor', '🛋️ Уют'], ['pets', '🐾 Питомцы'], ['food', '🛒 Продукты']].map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>` });
  const body = v.querySelector('.app-body');
  const render = () => {
    v.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    body.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="muted">Баланс</span><span class="chip orange" style="font-size:15px">${money(S.money)}</span></div>`;
    if (tab === 'clothes' || tab === 'salon') {
      body.insertAdjacentHTML('beforeend', `<div class="card" style="text-align:center;padding:20px">
          <div style="font-size:54px">${tab === 'clothes' ? '👗' : '💇‍♀️'}</div>
          <h3 style="margin:6px 0">${tab === 'clothes' ? 'Бутик «Мандарин»' : 'Салон «Локон»'}</h3>
          <p class="muted" style="margin:0 0 14px">${tab === 'clothes' ? 'Примерь любую вещь прямо на Лане, а потом решай!' : 'Причёски, цвет волос и помада'}</p>
          <button class="btn block" data-open>Открыть ✨</button></div>`);
      body.querySelector('[data-open]').addEventListener('click', async () => {
        sfx('click');
        closePhone();
        await openWardrobe({ shop: true, tab: tab === 'clothes' ? 'top' : 'hairStyle' });
      });
    } else if (tab === 'decor') {
      body.insertAdjacentHTML('beforeend', '<p class="muted" style="margin:0 2px 10px">Вещи для комнаты в общежитии: их видно в сцене, а уютная комната поднимает настроение после сна.</p>');
      const list = el('<div class="list"></div>');
      for (const d of DECOR) {
        const has = S.decor.includes(d.id);
        const card = el(`<div class="card row equip ${has ? 'owned' : ''}"><div style="font-size:34px">${d.icon}</div><div style="flex:1;min-width:0"><b>${d.name}</b><div class="muted" style="font-size:13px">${d.desc}</div></div>
          ${has ? '<span class="chip mint">✓ дома</span>' : `<button class="btn small orange" ${S.money < d.price ? 'disabled' : ''}>${money(d.price)}</button>`}</div>`);
        const b = card.querySelector('button');
        if (b)
          b.addEventListener('click', () => {
            if (buyDecor(d.id)) {
              toast({ icon: d.icon, title: `${d.name} — в комнате!`, text: S.scene === 'dorm' ? 'Посмотри, как стало уютно' : 'Будет ждать тебя в общежитии' });
              render();
            }
          });
        list.appendChild(card);
      }
      body.appendChild(list);
    } else if (tab === 'pets') {
      const list = el('<div class="list"></div>');
      for (const [type, t] of Object.entries(PET_TYPES)) {
        const has = S.pets.some((p) => p.type === type);
        const card = el(`<div class="card pet-card"><div class="pv">${renderPet(type)}</div><div style="flex:1;min-width:0">
            <b style="font-size:16px">${t.name}</b><div class="muted" style="margin:2px 0 8px">${t.desc}</div>
            <button class="btn small ${has ? 'ghost' : 'orange'}" ${S.money < t.price ? 'disabled' : ''}>${has ? 'Ещё одного · ' : 'Завести · '}${money(t.price)}</button></div></div>`);
        card.querySelector('button').addEventListener('click', async () => {
          sfx('click');
          const name = await prompt({ icon: t.emoji, title: `Как назовём ${t.acc}?`, value: t.defaultName, ok: 'Забрать домой 💕' });
          if (!name) return;
          if (adoptPet(type, name)) {
            toast({ icon: t.emoji, title: `${name} теперь живёт с Ланой!`, text: 'Нажми на питомца в комнате' });
            render();
          }
        });
        list.appendChild(card);
      }
      body.appendChild(list);
    } else {
      const list = el('<div class="list"></div>');
      for (const f of FOOD.filter((x) => !x.city || x.city === S.city)) {
        const card = el(`<div class="card row"><div style="font-size:34px">${f.icon}</div><div style="flex:1"><b>${f.name}</b><div class="muted">${f.desc} · есть: ${S.inventory[f.id] || 0}</div></div>
            <button class="btn small orange" ${S.money < f.price ? 'disabled' : ''}>${money(f.price)}</button></div>`);
        card.querySelector('button').addEventListener('click', () => {
          if (S.money < f.price) return;
          addMoney(-f.price, 'food');
          S.inventory[f.id] = (S.inventory[f.id] || 0) + 1;
          sfx('coin');
          bus.emit('buyFood', { id: f.id });
          render();
        });
        list.appendChild(card);
      }
      body.appendChild(list);
    }
  };
  v.querySelectorAll('[data-tab]').forEach((b) =>
    b.addEventListener('click', () => {
      sfx('click');
      tab = b.dataset.tab;
      render();
    }),
  );
  render();
}
export function openShopTab(tab) {
  if (tab === 'clothes' || tab === 'salon') return openWardrobe({ shop: true, tab: tab === 'clothes' ? 'top' : 'hairStyle' });
  openPhone();
  phone.screen.querySelectorAll('.app-view').forEach((x) => x.remove());
  appShop(tab || 'clothes');
}

// ================================================================ PETS
function appPets() {
  const v = view('🐾 Питомцы');
  const body = v.querySelector('.app-body');
  const render = () => {
    if (!S.pets.length) {
      body.innerHTML = `<div class="card" style="text-align:center;padding:24px"><div style="font-size:60px">🐾</div><h3>Пока нет питомца</h3><p class="muted">В зоомагазине ждут котик, корги, хомячок, кролик и попугайчик.</p><button class="btn" data-go>В зоомагазин</button></div>`;
      body.querySelector('[data-go]').addEventListener('click', () => {
        v.remove();
        appShop('pets');
      });
      return;
    }
    body.innerHTML = '';
    for (const p of S.pets) {
      const t = PET_TYPES[p.type];
      const active = (S.activePet || S.pets[0].id) === p.id;
      const card = el(`<div class="card" style="margin-bottom:10px"><div class="pet-card"><div class="pv">${renderPet(p.type)}</div><div style="flex:1">
          <b style="font-size:18px">${esc(p.name)}</b> <span class="muted">${t.name}</span>${active ? ' <span class="chip mint">с Ланой</span>' : ''}
          <div class="muted" style="margin-top:6px">🥣 Сытость</div><div class="bar mint"><i style="width:${p.hunger}%"></i></div>
          <div class="muted" style="margin-top:6px">❤️ Радость</div><div class="bar"><i style="width:${p.joy}%"></i></div></div></div>
          <div class="row" style="margin-top:12px;gap:8px">
            <button class="btn small mint" data-a="feed">🥣 Покормить</button><button class="btn small" data-a="play">🎾 Играть</button>
            ${active ? '' : '<button class="btn small ghost" data-a="take">Взять с собой</button>'}</div></div>`);
      card.querySelector('[data-a="feed"]').addEventListener('click', () => {
        if (feedPet(p)) render();
      });
      card.querySelector('[data-a="play"]').addEventListener('click', async () => {
        S.activePet = p.id;
        rebuildPet();
        closePhone();
        await playPetGame();
      });
      const take = card.querySelector('[data-a="take"]');
      if (take)
        take.addEventListener('click', () => {
          S.activePet = p.id;
          rebuildPet();
          sfx('pop');
          render();
        });
      body.appendChild(card);
    }
    body.insertAdjacentHTML('beforeend', `<p class="muted" style="text-align:center">🥫 Корма в запасе: ${S.inventory.petFood}</p>`);
  };
  render();
}

// ================================================================ MESSAGES
const hm = (m) => formatClock(m);
// SVGs drawn as <img> are rasterised once and cached by the browser — far cheaper than inline DOM.
const urlCache = new Map();
function svgUrl(svg) {
  let u = urlCache.get(svg);
  if (!u) {
    u = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    if (urlCache.size > 120) urlCache.clear();
    urlCache.set(svg, u);
  }
  return u;
}
const sceneSvgCache = {};
function sceneThumb(id) {
  if (sceneSvgCache[id]) return sceneSvgCache[id];
  const sc = SCENES[id] || SCENES.dorm;
  const x = Math.max(0, Math.min(sc.width - 700, (sc.spawn || 800) - 350));
  sceneSvgCache[id] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} 250 700 700" preserveAspectRatio="xMidYMid slice">${sc.paint({ phase: 'day', season: 'autumn', S })}</svg>`;
  return sceneSvgCache[id];
}
const isOnline = (who) => {
  const r = ONLINE[who];
  const h = S.minutes / 60;
  return !!r && h >= r[0] && h < r[1];
};
function avatarFor(who, size = '') {
  const c = CONTACTS[who];
  return `<div class="cav ${size}" style="background:${c.color}">${c.emoji}${isOnline(who) ? '<i class="online"></i>' : ''}</div>`;
}
const isSticker = (t) => /^(\p{Extended_Pictographic}|\u200d|\ufe0f|\s){1,8}$/u.test(t) && [...t.replace(/\s/g, '')].length <= 3;
const pick = (arr, avoid) => {
  const pool = arr.length > 1 ? arr.filter((x) => x !== avoid) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
};
function lastPreview(m) {
  if (m.photo != null) return '📷 Фото';
  return m.text.split('\n\n📌')[0].replace(/\n/g, ' ');
}
function chatTime(m) {
  return m.day === S.day ? hm(m.min) : m.day === S.day - 1 ? 'вчера' : formatDate(m.day).split(',')[0];
}

function appMessages() {
  const v = view('💬 Чаты');
  const body = v.querySelector('.app-body');
  const order = Object.keys(CONTACTS)
    .filter((k) => (S.chats[k] || []).length)
    .sort((a, b) => {
      if (a === 'lover') return -1; // pinned
      if (b === 'lover') return 1;
      const la = S.chats[a][S.chats[a].length - 1];
      const lb = S.chats[b][S.chats[b].length - 1];
      return lb.day * 1440 + lb.min - (la.day * 1440 + la.min);
    });
  if (!order.length) {
    body.innerHTML = '<div class="empty-state"><div>📭</div><p>Пока тихо… Сообщения от близких появятся здесь.</p></div>';
    return;
  }
  body.innerHTML = '<div class="chat-list"></div>';
  const list = body.firstChild;
  for (const who of order) {
    const msgs = S.chats[who];
    const last = msgs[msgs.length - 1];
    const u = unreadFor(who);
    const row = el(`<button class="chat-row ${u ? 'unread' : ''}">${avatarFor(who)}<div class="cmain"><div class="ctop"><span class="cn">${esc(CONTACTS[who].name)}${who === 'lover' ? ' <span class="pin">📌</span>' : ''}</span><time>${chatTime(last)}</time></div>
      <div class="cbot"><span class="cl">${last.in ? '' : '<b>Вы:</b> '}${esc(lastPreview(last))}</span>${u ? `<span class="cu">${u}</span>` : !last.in ? '<span class="ticks">✓✓</span>' : ''}</div></div></button>`);
    row.addEventListener('click', () => {
      sfx('click');
      openChat(who);
    });
    list.appendChild(row);
  }
}

function photoThumb(p) {
  if (!p) return '<div class="msg-photo missing">📷</div>';
  return `<div class="msg-photo"><img alt="" src="${svgUrl(sceneThumb(p.scene))}"/><img alt="" class="lana" src="${svgUrl(renderLana({ outfit: p.outfit, expr: 'happy' }))}"/></div>`;
}

function openChat(who) {
  const c = CONTACTS[who];
  const v = el(`<div class="app-view chat-view"><div class="chat-head"><button class="back" aria-label="Назад">‹</button>${avatarFor(who, 'sm')}
      <div class="ch-info"><b>${esc(c.name)}</b><small data-status></small></div></div>
      <div class="app-body chat-body"></div><div class="chat-foot"></div></div>`);
  phone.screen.appendChild(v);
  const body = v.querySelector('.chat-body');
  const foot = v.querySelector('.chat-foot');
  const status = v.querySelector('[data-status]');
  let typing = false;
  let panel = null; // 'stickers' | 'photos'
  markRead(who);
  updateHud();
  const setStatus = () => {
    status.textContent = typing ? 'печатает…' : isOnline(who) ? 'в сети' : 'был(а) недавно';
    status.classList.toggle('on', typing || isOnline(who));
  };

  const bubble = (m, i, msgs) => {
    const prev = msgs[i - 1];
    const next = msgs[i + 1];
    const grpStart = !prev || prev.in !== m.in || prev.day !== m.day;
    const grpEnd = !next || next.in !== m.in || next.day !== m.day;
    const cls = `msg ${m.in ? 'in' : 'out'} ${grpStart ? 'first' : ''} ${grpEnd ? 'last' : ''}`;
    const meta = `<span class="meta">${hm(m.min)}${m.in ? '' : ' <span class="ticks">✓✓</span>'}</span>`;
    if (m.photo != null) return `<div class="${cls} photo">${photoThumb(m.photoData)}${meta}</div>`;
    if (isSticker(m.text)) return `<div class="${cls} sticker"><span>${m.text}</span>${meta}</div>`;
    const [main, req] = m.text.split('\n\n📌 Просьба: ');
    return `<div class="${cls}"><span class="t">${esc(main)}</span>${req ? `<div class="req"><b>📌 Просьба</b>${esc(req)}<small>Смотри в «Мой путь»</small></div>` : ''}${meta}</div>`;
  };

  const render = (scroll = true) => {
    const msgs = (S.chats[who] || []).slice(-80);
    let lastDay = -1;
    let html = '<div class="messages">';
    msgs.forEach((m, i) => {
      if (m.day !== lastDay) {
        lastDay = m.day;
        html += `<div class="msg-day"><span>${m.day === S.day ? 'Сегодня' : m.day === S.day - 1 ? 'Вчера' : formatDate(m.day)}</span></div>`;
      }
      html += bubble(m, i, msgs);
    });
    if (typing) html += '<div class="msg in first last typing"><i></i><i></i><i></i></div>';
    html += '</div>';
    body.innerHTML = html;
    if (scroll) body.scrollTop = body.scrollHeight;
    renderFoot();
    setStatus();
  };

  const canReply = () => {
    const msgs = S.chats[who] || [];
    const last = msgs[msgs.length - 1];
    return !typing && last && last.in && !last.auto && REPLIES[who];
  };
  const canMedia = () => !typing && PHOTO_ANSWERS[who];

  function renderFoot() {
    const msgs = S.chats[who] || [];
    let chips = '';
    if (canReply()) {
      const pool = REPLIES[who];
      const off = msgs.length % pool.length;
      const opts = [0, 1, 2].map((k) => pool[(off + k) % pool.length]).filter((x, i, a) => a.indexOf(x) === i);
      chips = `<div class="reply-chips">${opts.map((r) => `<button data-r="${esc(r)}">${esc(r)}</button>`).join('')}</div>`;
    }
    const photoDone = S.flags['photo_' + who] === S.day;
    let extra = '';
    if (panel === 'stickers') extra = `<div class="sticker-panel">${STICKERS.map((st) => `<button data-st="${st}">${st}</button>`).join('')}</div>`;
    if (panel === 'photos')
      extra = S.album.length
        ? `<div class="photo-panel">${S.album.slice(0, 12).map((p, i) => `<button data-ph="${i}">${photoThumb(p)}</button>`).join('')}</div>`
        : '<div class="photo-panel empty">Сначала сделай селфи у зеркала 🤳</div>';
    foot.innerHTML = `${chips}${extra}<div class="chat-bar">
        ${canMedia() ? `<button class="cb-btn ${panel === 'photos' ? 'on' : ''}" data-panel="photos" aria-label="Фото" ${photoDone ? 'title="Сегодня фото уже отправлено"' : ''}>📷</button><button class="cb-btn ${panel === 'stickers' ? 'on' : ''}" data-panel="stickers" aria-label="Стикеры">😊</button>` : ''}
        <div class="cb-field">${typing ? `${esc(c.name.split(' ')[0])} печатает…` : canReply() ? 'Выбери ответ ↑' : 'Нет новых сообщений'}</div></div>`;
    foot.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => send({ text: b.dataset.r }, true)));
    foot.querySelectorAll('[data-st]').forEach((b) => b.addEventListener('click', () => send({ text: b.dataset.st }, canReply())));
    foot.querySelectorAll('[data-ph]').forEach((b) => b.addEventListener('click', () => send({ photo: +b.dataset.ph }, canReply())));
    foot.querySelectorAll('[data-panel]').forEach((b) =>
      b.addEventListener('click', () => {
        sfx('tap');
        panel = panel === b.dataset.panel ? null : b.dataset.panel;
        renderFoot();
        body.scrollTop = body.scrollHeight;
      }),
    );
  }

  async function send(msg, isReply) {
    if (typing) return;
    panel = null;
    sfx('message');
    const isPhoto = msg.photo != null;
    if (isPhoto) {
      const p = S.album[msg.photo];
      S.chats[who].push({ in: false, text: '📷', photo: 1, photoData: p, day: S.day, min: Math.floor(S.minutes) });
      if (S.flags['photo_' + who] !== S.day) {
        S.flags['photo_' + who] = S.day;
        changeNeed('social', 15);
        changeNeed('fun', 10);
      }
      bus.emit('action', { id: 'sendPhoto' });
    } else if (isReply) {
      sendReply(who, msg.text);
      changeNeed('social', who === 'lover' ? 18 : 12);
      changeNeed('fun', who === 'lover' ? 8 : 4);
    } else S.chats[who].push({ in: false, text: msg.text, day: S.day, min: Math.floor(S.minutes) });
    if (who === 'lover') setExpression('kiss', 2500);
    render();
    // the contact reads it and types an answer
    await wait(600);
    if (!phone || !v.isConnected) return finishAnswer();
    typing = true;
    render();
    const msgs = S.chats[who];
    const prevAns = [...msgs].reverse().find((m) => m.in);
    const pool = isPhoto ? PHOTO_ANSWERS[who] : isSticker(msg.text || '') ? ['😄', '❤️', '🥰', '😂'] : ANSWERS[who];
    const ans = pool ? pick(pool, prevAns && prevAns.text) : null;
    await wait(900 + Math.min(1600, (ans || '').length * 35));
    finishAnswer();
    function finishAnswer() {
      typing = false;
      if (ans) {
        S.chats[who].push({ in: true, text: ans, day: S.day, min: Math.floor(S.minutes), read: true, auto: true });
        if (v.isConnected) sfx('pop');
      }
      if (v.isConnected) render();
    }
  }

  render();
  v.querySelector('.back').addEventListener('click', () => {
    sfx('click');
    v.remove();
    appMessages();
  });
}

// ================================================================ QUESTS
function appQuests() {
  const v = view('📋 Задания');
  const body = v.querySelector('.app-body');
  const cur = S.quest.index;
  let html = '<div class="section-title">Задания дня</div><div class="list">';
  for (const t of S.daily.tasks) {
    const d = DAILY_POOL.find((x) => x.id === t.id);
    if (!d) continue;
    html += `<div class="card quest ${t.done ? 'done' : ''}"><div class="qi">${t.done ? '✅' : d.icon}</div><div style="flex:1"><h4>${d.text}</h4><p>Награда: ${d.money} ₽</p>
      ${d.goal.count > 1 ? `<div class="bar mint"><i style="width:${Math.min(100, (t.progress / d.goal.count) * 100)}%"></i></div>` : ''}</div></div>`;
  }
  html += '</div>';
  let chap = 0;
  QUESTS.forEach((q, i) => {
    const done = i < cur;
    const active = i === cur;
    if (q.chapter !== chap) {
      chap = q.chapter;
      const c = CHAPTERS.find((x) => x.n === chap);
      const open = !currentQuest() || chap <= currentQuest().chapter;
      html += `${chap > 1 ? '</div>' : ''}<div class="section-title">${open ? c.icon : '🔒'} Глава ${chap}${open ? ` · ${esc(c.title)}` : ''}</div><div class="list">`;
    }
    const rw = [q.reward.money ? `${q.reward.money} ₽` : '', q.reward.item ? '🎁 предмет' : '', q.reward.petFood ? '🥫 корм' : ''].filter(Boolean).join(' · ');
    html += `<div class="card quest ${done ? 'done' : ''} ${!done && !active ? 'locked' : ''}"><div class="qi">${done ? '✅' : !active ? '🔒' : q.icon}</div><div style="flex:1">
      <h4>${active || done ? q.title : 'Скоро…'}</h4><p>${active || done ? q.desc : 'Откроется по сюжету'}</p>
      ${active ? `<p style="margin-top:6px"><span class="chip lav">💡 ${q.hint}</span></p>` : ''}
      ${active && questProgressText(q) ? `<div class="row" style="gap:8px;margin-top:6px"><div class="bar lav" style="flex:1;margin:0"><i style="width:${questFraction(q) * 100}%"></i></div><b class="qp">${questProgressText(q)}</b></div>` : ''}
      ${active || done ? `<p style="margin-top:6px" class="muted">Награда: ${rw}</p>` : ''}</div></div>`;
  });
  html += '</div>';
  if (!currentQuest()) html += '<p style="text-align:center;font-weight:900;margin-top:16px">👑 Все задания выполнены! Лана — настоящая принцесса.</p>';
  body.innerHTML = html;
}

// ================================================================ ACHIEVEMENTS
function appAchievements() {
  const v = view('🏆 Награды');
  const body = v.querySelector('.app-body');
  const got = ACHIEVEMENTS.filter((a) => S.achievements[a.id]).length;
  body.innerHTML = `<div class="card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><b>Открыто</b><b>${got} / ${ACHIEVEMENTS.length}</b></div><div class="bar"><i style="width:${(got / ACHIEVEMENTS.length) * 100}%"></i></div></div>
    <div class="ach-grid">${ACHIEVEMENTS.map((a) => `<div class="ach ${S.achievements[a.id] ? '' : 'locked'}"><div class="ae">${a.icon}</div><b>${a.name}</b><small>${a.desc}</small>${a.reward ? '<small>🎁 + предмет</small>' : ''}</div>`).join('')}</div>`;
}

// ================================================================ PROFILE
function appProfile() {
  const v = view('💖 Лана');
  const body = v.querySelector('.app-body');
  body.innerHTML = `
    <div class="card row" style="gap:14px">
      <div style="width:84px;height:84px;border-radius:50%;overflow:hidden;background:#ffeef4;flex:none">${renderLanaHead({ outfit: S.outfit })}</div>
      <div><b style="font-size:20px">Лана, 19 лет</b><div class="muted">${S.lab.owned ? 'Хозяйка «Lana Dental» 🦷' : S.flags.diploma ? 'Зубной техник 🦷' : 'Будущий зубной техник 🦷'}<br/>Москва ⇄ Сухум · ☕ ${BARISTA_RANKS[baristaRank()].name}</div>
      <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px"><span class="chip orange">💰 ${money(S.money)}</span>${S.debt ? `<span class="chip red">долг ${money(S.debt)}</span>` : ''}${S.flags.diploma ? '<span class="chip mint">🎓 Диплом</span>' : `<span class="chip lav">📈 ${S.grades}%</span>`}${S.flags.olympiadWon ? '<span class="chip">🏅 Олимпиада</span>' : ''}</div></div>
    </div>
    <div class="section-title">Потребности</div>
    <div class="card">${NEEDS.map((n) => `<div class="row" style="margin:6px 0"><span style="width:26px;font-size:20px">${n.icon}</span><div style="flex:1"><div class="row" style="justify-content:space-between;font-weight:800;font-size:14px"><span>${n.name}</span><span>${Math.round(S.needs[n.id])}%</span></div><div class="bar" style="margin-top:4px"><i style="width:${S.needs[n.id]}%;background:${n.color}"></i></div></div></div>`).join('')}</div>
    <div class="section-title">Навыки</div>
    <div class="card">${SKILLS.map((s) => {
      const lv = levelOf(S.skills[s.id]);
      return `<div class="row" style="margin:8px 0"><span style="width:26px;font-size:20px">${s.icon}</span><div style="flex:1"><div class="row" style="justify-content:space-between;font-weight:800;font-size:14px"><span>${s.name}</span><span>ур. ${lv}${lv >= MAX_LEVEL ? ' · макс' : ''}</span></div><div class="bar lav" style="margin-top:4px"><i style="width:${levelProgress(S.skills[s.id]) * 100}%"></i></div></div></div>`;
    }).join('')}</div>
    <div class="section-title">Статистика</div>
    <div class="card" style="font-weight:800;font-size:14px;line-height:1.9">
      📅 Дней в игре: ${S.day + 1}<br/>🎓 Пар посещено: ${S.attendance}<br/>💸 Заработано: ${money(S.stats.earned || 0)}<br/>
      🦷 Коронок сделано: ${S.stats.crowns || 0}<br/>☕ Смен в «Пенке»: ${S.stats.mg_barista || 0}<br/>🍊 Мандаринов собрано: ${S.stats.mandarins || 0}<br/>🧳 Поездок: ${S.stats.trips || 0}<br/>💌 Просьб выполнено: ${S.stats.sideDone || 0}<br/>👗 Вещей в гардеробе: ${S.owned.length}
    </div>
    <div class="section-title">Запасы</div>
    <div class="card" style="font-weight:800;font-size:14px;line-height:1.9">🛒 Продукты: ${S.inventory.groceries} · 🍲 Порции: ${S.inventory.meals || 0} · 🥪 Перекус: ${S.inventory.snacks} · 🥫 Корм: ${S.inventory.petFood}${S.inventory.sweets ? ` · 🍬 Конфеты: ${S.inventory.sweets}` : ''}</div>`;
}

// ================================================================ ALBUM
function appAlbum() {
  const v = view('📸 Альбом', { tabs: '<div class="tabs"><button class="tab on" data-t="photos">🤳 Селфи</button><button class="tab" data-t="cards">🖼️ Открытки</button></div>' });
  const body = v.querySelector('.app-body');
  let tab = 'photos';
  const render = () => {
    v.querySelectorAll('[data-t]').forEach((b) => b.classList.toggle('on', b.dataset.t === tab));
    if (tab === 'photos') {
      if (!S.album.length) {
        body.innerHTML = '<p class="muted" style="text-align:center;margin-top:40px">Сделай селфи у зеркала или в парке 🤳</p>';
        return;
      }
      body.innerHTML = `<div class="polaroids">${S.album
        .map((p) => {
          return `<figure class="polaroid" style="margin:0"><div class="ph"><img alt="" loading="lazy" src="${svgUrl(sceneThumb(p.scene))}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/><img alt="" loading="lazy" src="${svgUrl(renderLana({ outfit: p.outfit, expr: 'happy' }).replace(/class="lana-svg[^"]*"/, ''))}" style="position:absolute;left:18%;width:64%;top:6%;height:140%;object-fit:contain;object-position:top"/></div><figcaption>${formatDate(p.day)}</figcaption></figure>`;
        })
        .join('')}</div>`;
    } else {
      const all = Object.values(EXCURSIONS);
      body.innerHTML = `<p class="muted">Собрано ${S.postcards.length} из ${all.length}</p><div class="list">${all
        .map((e) => (S.postcards.includes(e.id) ? `<div class="card" style="padding:8px"><div style="border-radius:12px;overflow:hidden">${postcardArt(e.id)}</div><b style="display:block;margin:8px 4px 2px">${e.icon} ${e.name}</b></div>` : `<div class="card row" style="opacity:.5"><div style="font-size:30px">🔒</div><div><b>${e.name}</b><div class="muted">${e.city === 'moscow' ? 'Москва' : 'Абхазия'} · поездка на карте</div></div></div>`))
        .join('')}</div>`;
    }
  };
  v.querySelectorAll('[data-t]').forEach((b) =>
    b.addEventListener('click', () => {
      sfx('click');
      tab = b.dataset.t;
      render();
    }),
  );
  render();
}

// ================================================================ SETTINGS
function appSettings() {
  const v = view('⚙️ Настройки');
  const body = v.querySelector('.app-body');
  const render = () => {
    body.innerHTML = `<div class="list">
      <button class="setting" data-help><span>❓ Как играть</span><span>›</span></button>
      <button class="setting" data-s="sound"><span>🔊 Звуки</span><span class="toggle ${S.settings.sound ? 'on' : ''}"></span></button>
      <button class="setting" data-s="music"><span>🎵 Музыка</span><span class="toggle ${S.settings.music ? 'on' : ''}"></span></button>
      <button class="setting" data-hap><span>📳 Вибрация<small>Лёгкий отклик на касания и награды (Android)</small></span><span class="toggle ${S.settings.haptics !== false ? 'on' : ''}"></span></button>
      <button class="setting" data-lite><span>🔋 Экономный режим<small>Меньше анимаций фона — плавнее на слабых телефонах${S.settings.lite == null ? ' (выбрано автоматически)' : ''}</small></span><span class="toggle ${document.body.classList.contains('lite') ? 'on' : ''}"></span></button>
      ${canInstall() ? '<button class="setting" data-install><span>📲 Установить на телефон<small>Иконка на главном экране, работает без интернета</small></span><span>›</span></button>' : '<div class="setting"><span>📲 Установка<small>iPhone: «Поделиться» → «На экран Домой»</small></span></div>'}
      <button class="setting" data-export><span>💾 Сохранение<small>Скопировать код сохранения</small></span><span>›</span></button>
      <button class="setting" data-import><span>📥 Загрузить сохранение<small>Вставить код</small></span><span>›</span></button>
      <button class="setting" data-reset style="color:var(--danger)"><span>🗑️ Начать заново</span><span>›</span></button>
      </div>
      <p class="muted" style="text-align:center;margin-top:22px">«Лана: Жизнь» · сделано с любовью 💕<br/>Вся графика и музыка нарисованы и написаны кодом специально для Ланы.</p>`;
    body.querySelectorAll('[data-s]').forEach((b) =>
      b.addEventListener('click', () => {
        const k = b.dataset.s;
        S.settings[k] = !S.settings[k];
        setAudio({ sound: S.settings.sound, music: S.settings.music });
        sfx('click');
        save();
        render();
      }),
    );
    body.querySelector('[data-hap]').addEventListener('click', () => {
      S.settings.haptics = S.settings.haptics === false;
      setHaptics(S.settings.haptics);
      if (S.settings.haptics) vibrate(20);
      sfx('click');
      save();
      render();
    });
    body.querySelector('[data-lite]').addEventListener('click', () => {
      S.settings.lite = !document.body.classList.contains('lite');
      window.dispatchEvent(new window.Event('lite-change'));
      sfx('click');
      save();
      render();
    });
    body.querySelector('[data-help]').addEventListener('click', () =>
      dialog({
        icon: '📖',
        title: 'Как играть',
        html: `<div style="text-align:left;font-weight:700;font-size:15px;line-height:1.5;color:var(--ink-soft)">
          <p>👆 <b>Кружочки</b> на предметах и людях открывают меню действий.</p>
          <p>🚶‍♀️ <b>Нажми куда угодно</b> — Лана пойдёт туда, а камера поедет за ней. <b>Удерживай палец</b> — Лана будет идти за ним. Листай комнату свайпом, стрелки ‹ › по краям ведут дальше.</p>
          <p>🎀 <b>Потребности</b> внизу экрана падают со временем. Красный кружок — Лане срочно что-то нужно.</p>
          <p>💎 <b>Кристалл</b> над головой показывает настроение: чем оно лучше, тем быстрее растут навыки.</p>
          <p>📋 <b>Задание</b> вверху ведёт по сюжету, стрелка 👇 указывает на нужный предмет.</p>
          <p>💰 <b>Деньги</b>: смены в кофейне, сбор мандаринов, стипендия по понедельникам, мама по пятницам.</p>
          <p>🧭 <b>Мой путь</b> в телефоне — главы сюжета, советы «что делать сейчас», успеваемость, карьера, просьбы близких и мечты.</p>
          <p>📈 <b>Успеваемость</b>: пары по будням её поднимают, прогулы снижают. От неё зависят стипендия и допуск к экзамену.</p>
          <p>🏠 <b>Расходы</b>: по понедельникам оплата общежития. Не хватит денег — появится долг.</p>
          <p>🎓 <b>Цель</b>: диплом зубного техника, а потом — своя лаборатория в Сухуме.</p>
          <p>⏸ Пробел — пауза, «P» — телефон (на компьютере).</p></div>`,
        buttons: [{ label: 'Понятно!', value: true }],
      }),
    );
    const ins = body.querySelector('[data-install]');
    if (ins) ins.addEventListener('click', () => install());
    body.querySelector('[data-export]').addEventListener('click', async () => {
      const code = exportSave();
      try {
        await navigator.clipboard.writeText(code);
        toast({ icon: '💾', title: 'Код сохранения скопирован' });
      } catch (e) {
        await dialog({ icon: '💾', title: 'Код сохранения', html: `<textarea class="name-input" style="height:120px;font-size:11px;text-align:left">${code}</textarea>` });
      }
    });
    body.querySelector('[data-import]').addEventListener('click', async () => {
      const code = await prompt({ icon: '📥', title: 'Вставь код сохранения', max: 100000, ok: 'Загрузить' });
      if (!code) return;
      try {
        importSave(code);
        location.reload();
      } catch (e) {
        toast({ icon: '⚠️', title: 'Код не подошёл' });
      }
    });
    body.querySelector('[data-reset]').addEventListener('click', async () => {
      const ok = await dialog({ icon: '🗑️', title: 'Начать заново?', text: 'Весь прогресс будет удалён.', buttons: [{ label: 'Да, заново', value: true, cls: 'ghost' }, { label: 'Нет', value: false, cls: 'mint' }] });
      if (ok) {
        reset();
        location.reload();
      }
    });
  };
  render();
}
