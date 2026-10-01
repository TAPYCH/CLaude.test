// Lana's phone — the main menu of the game.
import { S, NEEDS, SKILLS, levelOf, levelProgress, MAX_LEVEL, save, reset, exportSave, importSave, addMoney, changeNeed } from '../core/state.js';
import { formatClock, formatDate, money } from '../core/time.js';
import { QUESTS, DAILY_POOL } from '../data/quests.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { CONTACTS, REPLIES } from '../data/contacts.js';
import { MAP, EXCURSIONS, postcardArt } from '../data/places.js';
import { SCENES } from '../data/scenes.js';
import { PET_TYPES, renderPet } from '../art/pets.js';
import { renderLanaHead, renderLana } from '../art/character.js';
import { currentQuest, sendReply, markRead, unreadFor } from '../core/progress.js';
import { goScene, travel, excursion, TRAVEL, adoptPet, feedPet, pauseTime, resumeTime, playPetGame } from '../game.js';
import { openWardrobe } from './wardrobe.js';
import { el, app, esc, wait } from './dom.js';
import { sfx, setAudio } from '../audio.js';
import { dialog, prompt } from './modal.js';
import { toast } from './fx.js';
import { updateHud } from './hud.js';
import { rebuildPet, setExpression } from './world.js';
import { bus } from '../core/bus.js';
import { install, canInstall } from '../pwa.js';

const APPS = [
  { id: 'map', name: 'Карта', icon: '🗺️', bg: 'linear-gradient(160deg,#9be7c4,#3fcfae)' },
  { id: 'wardrobe', name: 'Гардероб', icon: '👗', bg: 'linear-gradient(160deg,#ffc1d6,#ff6f9c)' },
  { id: 'shop', name: 'Магазин', icon: '🛍️', bg: 'linear-gradient(160deg,#ffd59a,#ff9a2e)' },
  { id: 'pets', name: 'Питомцы', icon: '🐾', bg: 'linear-gradient(160deg,#ffe3b3,#ffb54f)' },
  { id: 'messages', name: 'Чаты', icon: '💬', bg: 'linear-gradient(160deg,#b9e0ff,#4fb3ff)' },
  { id: 'quests', name: 'Задания', icon: '📋', bg: 'linear-gradient(160deg,#d6c8ff,#9a7bff)' },
  { id: 'achievements', name: 'Награды', icon: '🏆', bg: 'linear-gradient(160deg,#fff0a8,#ffc23d)' },
  { id: 'profile', name: 'Я', icon: '💖', bg: 'linear-gradient(160deg,#ffd1e8,#f79ac0)' },
  { id: 'album', name: 'Альбом', icon: '📸', bg: 'linear-gradient(160deg,#e6e1ff,#b6a6ff)' },
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
    <div class="app-grid">${APPS.map((a, i) => {
      const badge = a.id === 'messages' ? S.unread : a.id === 'quests' ? S.daily.tasks.filter((t) => !t.done).length : 0;
      return `<button class="app-icon" data-app="${a.id}" style="animation-delay:${i * 0.03}s"><div class="ai" style="background:${a.bg}">${a.icon}</div><span>${a.name}</span>${badge ? `<b class="badge">${badge}</b>` : ''}</button>`;
    }).join('')}</div>
    ${q ? `<div class="widget"><h5>Сюжет</h5><div class="quest"><div class="qi">${q.icon}</div><div><h4>${q.title}</h4><p>${q.desc}</p></div></div></div>` : ''}
    <div class="widget"><h5>Задания дня</h5>${dailies || '<p class="muted">Новые задания появятся завтра</p>'}</div>`;
  phone.home.querySelectorAll('[data-app]').forEach((b) =>
    b.addEventListener('click', () => {
      sfx('pop');
      openApp(b.dataset.app);
    }),
  );
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
  const fn = { map: appMap, shop: appShop, pets: appPets, messages: appMessages, quests: appQuests, achievements: appAchievements, profile: appProfile, album: appAlbum, settings: appSettings }[id];
  if (fn) fn();
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
  const render = () => {
    const pins = MAP[city].pins;
    const here = city === S.city;
    body.innerHTML = `
      <div class="city-switch">${['moscow', 'abkhazia'].map((c) => `<button data-city="${c}" class="${c === city ? 'on' : ''}">${c === 'moscow' ? '🏙️ Москва' : '🌴 Абхазия'}</button>`).join('')}</div>
      <div class="map">${mapArt(city)}${pins
        .map((p, i) => `<button class="pin ${p.scene === S.scene ? 'here' : ''}" data-i="${i}" style="left:${p.x}%;top:${p.y}%"><div class="pi"><span>${p.icon}</span></div><b>${p.name}</b></button>`)
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
];

function appShop(tab = 'clothes') {
  const v = view('🛍️ Магазин', { tabs: `<div class="tabs">${[['clothes', '👗 Одежда'], ['salon', '💇‍♀️ Салон'], ['pets', '🐾 Питомцы'], ['food', '🛒 Продукты']].map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>` });
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
      for (const f of FOOD) {
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
function avatarFor(who) {
  const c = CONTACTS[who];
  return `<div class="cav" style="background:${c.color}">${c.emoji}</div>`;
}

function appMessages() {
  const v = view('💬 Чаты');
  const body = v.querySelector('.app-body');
  const order = Object.keys(CONTACTS).filter((k) => (S.chats[k] || []).length).sort((a, b) => {
    const la = S.chats[a][S.chats[a].length - 1];
    const lb = S.chats[b][S.chats[b].length - 1];
    return lb.day * 1440 + lb.min - (la.day * 1440 + la.min);
  });
  if (!order.length) {
    body.innerHTML = '<p class="muted" style="text-align:center;margin-top:40px">Пока тихо… 📭</p>';
    return;
  }
  body.innerHTML = '<div class="list chat-list"></div>';
  const list = body.firstChild;
  for (const who of order) {
    const msgs = S.chats[who];
    const last = msgs[msgs.length - 1];
    const u = unreadFor(who);
    const row = el(`<button class="chat-row">${avatarFor(who)}<div style="min-width:0"><div class="cn">${esc(CONTACTS[who].name)}</div><div class="cl">${last.in ? '' : 'Вы: '}${esc(last.text)}</div></div>${u ? `<span class="cu">${u}</span>` : ''}</button>`);
    row.addEventListener('click', () => {
      sfx('click');
      openChat(who);
    });
    list.appendChild(row);
  }
}

function openChat(who) {
  const c = CONTACTS[who];
  const v = view(`${c.emoji} ${esc(c.name)}`);
  v.querySelector('.back').onclick = null;
  const body = v.querySelector('.app-body');
  markRead(who);
  updateHud();
  const render = () => {
    const msgs = S.chats[who] || [];
    let lastDay = -1;
    let html = '<div class="messages">';
    for (const m of msgs.slice(-60)) {
      if (m.day !== lastDay) {
        lastDay = m.day;
        html += `<div class="msg-day">${formatDate(m.day)}</div>`;
      }
      html += `<div class="msg ${m.in ? 'in' : 'out'}">${esc(m.text)}<time>${formatClock(m.min)}</time></div>`;
    }
    html += '</div>';
    const last = msgs[msgs.length - 1];
    if (last && last.in && REPLIES[who]) html += `<div class="replies">${REPLIES[who].map((r, i) => `<button data-r="${i}">${esc(r)}</button>`).join('')}</div>`;
    body.innerHTML = html;
    body.scrollTop = body.scrollHeight;
    body.querySelectorAll('[data-r]').forEach((b) =>
      b.addEventListener('click', async () => {
        sfx('message');
        const text = REPLIES[who][+b.dataset.r];
        sendReply(who, text);
        changeNeed('social', who === 'lover' ? 18 : 12);
        changeNeed('fun', who === 'lover' ? 8 : 4);
        if (who === 'lover') setExpression('kiss', 2500);
        render();
        await wait(1400);
        if (!phone) return;
        const answers = {
          lover: ['И я тебя ❤️❤️❤️', '😍', 'Ты моё солнышко ☀️', 'Мурр 😘', 'Скоро увидимся 🫶'],
          mom: ['Умница моя 💛', 'Целую, доченька!', 'Береги себя!'],
          amra: ['Жду!!! 💕', '😘😘', 'Ахахах 😂'],
          katya: ['👍', 'Скинула!', 'Давай!'],
          teacher: ['Хорошо, Лана.', 'Жду вас.'],
          grandma: ['Солнышко моё 💛'],
        }[who];
        if (answers) {
          S.chats[who].push({ in: true, text: answers[Math.floor(Math.random() * answers.length)], day: S.day, min: Math.floor(S.minutes), read: true });
          sfx('pop');
          render();
        }
      }),
    );
  };
  render();
  v.querySelector('.back').addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    v.remove();
    appMessages();
  }, { capture: true });
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
  html += '</div><div class="section-title">История Ланы</div><div class="list">';
  QUESTS.forEach((q, i) => {
    const done = i < cur;
    const active = i === cur;
    const pct = active ? Math.min(100, (S.quest.progress / q.goal.count) * 100) : done ? 100 : 0;
    const rw = [q.reward.money ? `${q.reward.money} ₽` : '', q.reward.item ? '🎁 предмет' : '', q.reward.petFood ? '🥫 корм' : ''].filter(Boolean).join(' · ');
    html += `<div class="card quest ${done ? 'done' : ''} ${!done && !active ? 'locked' : ''}"><div class="qi">${done ? '✅' : !active ? '🔒' : q.icon}</div><div style="flex:1">
      <h4>${active || done ? q.title : 'Скоро…'}</h4><p>${active || done ? q.desc : 'Откроется по сюжету'}</p>
      ${active ? `<p style="margin-top:6px"><span class="chip lav">💡 ${q.hint}</span></p>` : ''}
      ${active && q.goal.count > 1 ? `<div class="bar lav"><i style="width:${pct}%"></i></div>` : ''}
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
      <div><b style="font-size:20px">Лана, 19 лет</b><div class="muted">Будущий зубной техник 🦷<br/>Москва ⇄ Сухум</div>
      <div style="margin-top:6px"><span class="chip orange">💰 ${money(S.money)}</span> ${S.flags.diploma ? '<span class="chip mint">🎓 Диплом</span>' : ''}</div></div>
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
      🦷 Коронок сделано: ${S.stats.crowns || 0}<br/>🍊 Мандаринов собрано: ${S.stats.mandarins || 0}<br/>🧳 Поездок: ${S.stats.trips || 0}<br/>👗 Вещей в гардеробе: ${S.owned.length}
    </div>
    <div class="section-title">Запасы</div>
    <div class="card" style="font-weight:800;font-size:14px;line-height:1.9">🛒 Продукты: ${S.inventory.groceries} · 🍲 Порции: ${S.inventory.meals || 0} · 🥪 Перекус: ${S.inventory.snacks} · 🥫 Корм: ${S.inventory.petFood}</div>`;
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
          const sc = SCENES[p.scene];
          const bg = sc ? `<svg viewBox="${Math.max(0, Math.min(sc.width - 700, (sc.spawn || 800) - 350))} 250 700 700" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0">${sc.paint({ phase: 'day', season: 'autumn', S })}</svg>` : '';
          return `<figure class="polaroid" style="margin:0"><div class="ph">${bg}<div style="position:absolute;left:18%;right:18%;top:6%;bottom:-40%">${renderLana({ outfit: p.outfit, expr: 'happy' })}</div></div><figcaption>${formatDate(p.day)}</figcaption></figure>`;
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
    body.querySelector('[data-help]').addEventListener('click', () =>
      dialog({
        icon: '📖',
        title: 'Как играть',
        html: `<div style="text-align:left;font-weight:700;font-size:15px;line-height:1.5;color:var(--ink-soft)">
          <p>👆 <b>Кружочки</b> на предметах и людях открывают меню действий.</p>
          <p>🚶‍♀️ <b>Нажми на пол</b> — Лана пойдёт туда. Комнату можно листать пальцем.</p>
          <p>🎀 <b>Потребности</b> внизу экрана падают со временем. Красный кружок — Лане срочно что-то нужно.</p>
          <p>💎 <b>Кристалл</b> над головой показывает настроение: чем оно лучше, тем быстрее растут навыки.</p>
          <p>📋 <b>Задание</b> вверху ведёт по сюжету, стрелка 👇 указывает на нужный предмет.</p>
          <p>💰 <b>Деньги</b>: смены в кофейне, сбор мандаринов, стипендия по понедельникам, мама по пятницам.</p>
          <p>🎓 <b>Цель</b>: прокачать зуботехнику до 5 уровня, походить на пары и сдать экзамен.</p>
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
