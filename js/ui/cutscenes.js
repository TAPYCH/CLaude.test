// Title screen, intro story, travel & postcard scenes, finale.
import { S, save } from '../core/state.js';
import { renderLana } from '../art/character.js';
import { SCENES } from '../data/scenes.js';
import { postcardArt } from '../data/places.js';
import { CONFIG } from '../config.js';
import { mountains, palm, moscowSkyline, cloud, sun } from '../art/scenes/common.js';
import { el, app, esc } from './dom.js';
import { sfx, playMusic, unlockAudio } from '../audio.js';
import { confetti, toast } from './fx.js';
import { dialog } from './modal.js';
import { DEFAULT_OUTFIT } from '../data/items.js';

function petals(node, n = 14) {
  const set = ['🌸', '🍊', '✨', '🤍'];
  for (let i = 0; i < n; i++) {
    const p = el(`<span class="petal">${set[i % set.length]}</span>`);
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = 8 + Math.random() * 8 + 's';
    p.style.animationDelay = -Math.random() * 14 + 's';
    p.style.fontSize = 12 + Math.random() * 14 + 'px';
    p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    node.appendChild(p);
  }
}

function titleBg() {
  return `<svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMax slice">
    <defs><linearGradient id="tSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ff"/><stop offset=".55" stop-color="#ffd3e2"/><stop offset="1" stop-color="#ffc49a"/></linearGradient>
    <linearGradient id="tSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cc6f2"/><stop offset="1" stop-color="#2a8fd0"/></linearGradient></defs>
    <rect width="1000" height="1000" fill="url(#tSky)"/>
    ${sun(760, 420, 70, '#fff2c4')}${cloud(200, 180, 1.1)}${cloud(820, 140, 0.8)}${cloud(520, 260, 0.6, 0.7)}
    <g opacity=".95">${moscowSkyline(-40, 760, 0.9, '#b9a7d9')}</g>
    <g transform="translate(420,0)">${mountains(1200, 760, ['#a7c9a6', '#c7d9ec'])}</g>
    <path d="M0,760 L1000,760 L1000,1000 L0,1000 Z" fill="url(#tSea)"/>
    <path d="M0,760 Q250,740 500,770 T1000,760 L1000,800 Q750,790 500,810 T0,800 Z" fill="#fff" opacity=".25"/>
    ${palm(900, 880, 1.2)}${palm(80, 900, 1.0)}
    <path d="M0,900 Q500,850 1000,900 L1000,1000 L0,1000 Z" fill="#f4dcc0"/>
  </svg>`;
}

export function showTitle({ hasSave }) {
  return new Promise((resolve) => {
    playMusic(null);
    const node = el(`<div class="title-screen">
        <div class="title-bg">${titleBg()}</div>
        <div class="title-logo"><h1>Лана</h1><div class="tag">✨ Жизнь ✨</div></div>
        <div class="title-hero">${renderLana({ outfit: hasSave ? S.outfit : DEFAULT_OUTFIT, expr: 'happy' })}</div>
        <div class="title-actions">
          ${hasSave ? '<button class="btn" data-v="continue">▶ Продолжить</button><button class="btn ghost" data-v="new">Новая игра</button>' : '<button class="btn" data-v="new">▶ Играть</button>'}
          <div class="title-footer">Москва · Сухум · 🍊</div>
        </div>
      </div>`);
    petals(node);
    app().appendChild(node);
    const hero = node.querySelector('.title-hero');
    let blink = setInterval(() => {
      hero.classList.add('blink');
      setTimeout(() => hero.classList.remove('blink'), 200);
    }, 3200);
    node.querySelectorAll('[data-v]').forEach((b) =>
      b.addEventListener('click', async () => {
        unlockAudio();
        sfx('pop');
        if (b.dataset.v === 'new' && hasSave) {
          const ok = await dialog({ icon: '🌱', title: 'Новая игра?', text: 'Текущий прогресс будет удалён.', buttons: [{ label: 'Начать заново', value: true }, { label: 'Отмена', value: false, cls: 'ghost' }] });
          if (!ok) return;
        }
        clearInterval(blink);
        node.style.transition = 'opacity .5s';
        node.style.opacity = '0';
        setTimeout(() => node.remove(), 500);
        resolve(b.dataset.v);
      }),
    );
  });
}

const STORY = [
  { scene: 'beach', expr: 'happy', who: 'Абхазия', text: 'Это Лана. Ей 19 лет, и она родом из солнечной Абхазии: море, горы и самые сладкие мандарины 🍊' },
  { scene: 'college', expr: 'excited', who: 'Москва', text: 'Сейчас Лана учится в Москве на зубного техника 🦷 Она мечтает дарить людям красивые улыбки.' },
  { scene: 'dorm', expr: 'neutral', who: 'Общежитие', text: 'Учёба, подработка, звонки маме и любимому… А ещё нужно вовремя есть, спать и заботиться о себе 💕' },
  { scene: 'dorm', expr: 'happy', who: 'Как играть', text: 'Нажимай на светящиеся кружочки — это предметы и люди. Следи за потребностями внизу. В телефоне — карта, гардероб, магазин и задания 📱' },
];

export function playIntro() {
  return new Promise((resolve) => {
    playMusic('abkhazia');
    const node = el(`<div class="story"><div class="art"></div><button class="btn ghost small skip">Пропустить »</button>
        <div class="box"><span class="who"></span><p></p><div class="next"><button class="btn">Дальше →</button></div></div></div>`);
    app().appendChild(node);
    const art = node.querySelector('.art');
    const p = node.querySelector('p');
    const who = node.querySelector('.who');
    let i = 0;
    let typing = null;
    const show = () => {
      const s = STORY[i];
      const sc = SCENES[s.scene];
      const ratio = Math.max(0.5, window.innerWidth / Math.max(1, window.innerHeight));
      const vw = sc ? Math.min(sc.width, Math.max(1040, 1000 * ratio)) : 1000;
      const vx = sc ? Math.max(0, Math.min(sc.width - vw, sc.spawn - vw / 2)) : 0;
      const vb = `${vx} 0 ${vw} 1000`;
      art.innerHTML = `<svg viewBox="${vb}" preserveAspectRatio="xMidYMax slice">${sc ? sc.paint({ phase: 'day', season: 'autumn', S }) : ''}
        ${renderLana({ outfit: S.outfit, expr: s.expr }).replace('<svg ', `<svg x="${(sc ? sc.spawn : 500) - 125}" y="${(sc ? sc.floor : 900) - 560}" width="250" height="563" `)}</svg>`;
      who.textContent = s.who;
      node.querySelector('.box').style.animation = 'none';
      void node.offsetWidth;
      node.querySelector('.box').style.animation = '';
      clearInterval(typing);
      let k = 0;
      p.textContent = '';
      typing = setInterval(() => {
        k += 2;
        p.textContent = s.text.slice(0, k);
        if (k >= s.text.length) clearInterval(typing);
      }, 18);
      node.querySelector('.next .btn').textContent = i === STORY.length - 1 ? 'Начать! ✨' : 'Дальше →';
    };
    const done = () => {
      clearInterval(typing);
      node.style.transition = 'opacity .5s';
      node.style.opacity = '0';
      setTimeout(() => node.remove(), 500);
      resolve();
    };
    node.querySelector('.next .btn').addEventListener('click', () => {
      sfx('click');
      if (p.textContent.length < STORY[i].text.length) {
        clearInterval(typing);
        p.textContent = STORY[i].text;
        return;
      }
      i++;
      if (i >= STORY.length) done();
      else show();
    });
    node.querySelector('.skip').addEventListener('click', () => {
      sfx('click');
      done();
    });
    show();
  });
}

export function travelCutscene(to, mode) {
  return new Promise((resolve) => {
    sfx(mode === 'train' ? 'train' : 'whoosh');
    const toAbh = to === 'abkhazia';
    const vehicle =
      mode === 'train'
        ? `<g class="veh"><g style="animation:tc-move 4.6s linear forwards">
            ${[0, 1, 2].map((i) => `<g transform="translate(${-i * 190},0)"><rect x="0" y="520" width="180" height="70" rx="14" fill="${i ? '#3fa36b' : '#e94b5a'}"/><rect x="0" y="520" width="180" height="14" rx="7" fill="#fff" opacity=".35"/>
              ${[16, 56, 96, 136].map((x) => `<rect x="${x}" y="538" width="28" height="22" rx="5" fill="#fff6d6"/>`).join('')}<circle cx="34" cy="594" r="12" fill="#3b3343"/><circle cx="146" cy="594" r="12" fill="#3b3343"/></g>`).join('')}
            </g></g>`
        : `<g style="animation:tc-fly 4.6s ease-in-out forwards"><g transform="translate(0,300)">
            <path d="M0,40 Q80,10 200,30 L230,40 L200,50 Q80,70 0,40 Z" fill="#fff"/><path d="M90,38 L140,-20 L160,-20 L130,40 Z" fill="#ff6f9c"/><path d="M90,44 L140,100 L160,100 L130,42 Z" fill="#ff9ebd"/>
            <path d="M10,40 L-10,0 L10,0 L30,36 Z" fill="#ff6f9c"/>${[60, 80, 100, 120, 140, 160].map((x) => `<circle cx="${x}" cy="34" r="4" fill="#9fd8ff"/>`).join('')}</g></g>`;
    const node = el(`<div class="fullscreen travel-scene">
        <style>@keyframes tc-move{from{transform:translateX(-200px)}to{transform:translateX(1500px)}}@keyframes tc-fly{0%{transform:translate(-260px,120px) rotate(-6deg)}50%{transform:translate(400px,-40px) rotate(-2deg)}100%{transform:translate(1200px,60px) rotate(4deg)}}
        @keyframes tc-bg{from{transform:translateX(0)}to{transform:translateX(-500px)}}</style>
        <div class="tt" style="z-index:2"><b>${toAbh ? 'Домой, в Абхазию!' : 'Снова в Москву!'}</b><span>${mode === 'train' ? '🚆 Москва — Сухум' : '✈️ Москва — Сочи — Псоу — Сухум'}</span></div>
        <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;position:absolute;inset:0;overflow:visible">
          <rect x="-2000" y="-2000" width="5000" height="2700" fill="${mode === 'plane' ? '#9fdcff' : '#bfe6ff'}"/>
          <rect x="-2000" y="600" width="5000" height="2000" fill="${mode === 'plane' ? '#ffffff' : toAbh ? '#9fd88a' : '#c9d9a9'}"/>
          <g style="animation:tc-bg 4.6s linear forwards">${cloud(150, 120, 1)}${cloud(520, 90, 0.8)}${cloud(900, 160, 1.1)}${cloud(1300, 100, 0.9)}
          ${mode === 'train' ? `${mountains(1500, 520, toAbh ? ['#8fc28a', '#bcd6ea'] : ['#a9b9d9', '#c9d6ea'])}<rect y="520" width="1500" height="200" fill="${toAbh ? '#9fd88a' : '#c9d9a9'}"/>
          <rect y="600" width="1500" height="10" fill="#8a6a5a"/>${Array.from({ length: 40 }, (_, i) => `<rect x="${i * 40}" y="596" width="8" height="18" fill="#6a4a3a"/>`).join('')}
          ${toAbh ? palm(1200, 540, 0.8) + palm(1380, 540, 0.7) : ''}` : `${cloud(300, 560, 2.2, 1)}${cloud(900, 600, 2.6, 1)}${cloud(1400, 560, 2, 1)}`}</g>
          ${vehicle}
        </svg>
      </div>`);
    app().appendChild(node);
    setTimeout(() => {
      node.classList.add('closing');
      setTimeout(() => node.remove(), 500);
      resolve();
    }, 4800);
  });
}

export async function showPostcard(place, isNew) {
  if (isNew) confetti(50);
  sfx(isNew ? 'fanfare' : 'success');
  await dialog({
    icon: '',
    title: place.name,
    html: `<div style="border-radius:16px;overflow:hidden;margin:6px 0 12px;box-shadow:var(--shadow-m);transform:rotate(-2deg)">${postcardArt(place.id)}</div>
      <p>${esc(place.text)}</p>
      <div class="rewards">${Object.entries(place.needs).filter(([, v]) => v > 0).map(([k, v]) => `<span class="reward">${{ fun: '🎀', social: '💬', hunger: '🍓', energy: '⚡' }[k]} +${v}</span>`).join('')}${isNew ? '<span class="reward">🖼️ Новая открытка!</span>' : ''}</div>`,
    buttons: [{ label: 'Красота! 😍', value: true }],
  });
}

export async function finale() {
  playMusic('abkhazia');
  confetti(140);
  sfx('fanfare');
  const preview = { ...S.outfit, dress: 'dress_grad', acc: [...(S.outfit.acc || []).filter((a) => a !== 'tiara')] };
  await dialog({
    icon: '🎓',
    title: 'Лана — зубной техник!',
    html: `<div style="height:260px;display:flex;justify-content:center;margin:-6px 0 8px">${renderLana({ outfit: preview, expr: 'excited' }).replace('<svg', '<svg style="height:100%;width:auto"')}</div>
      <p>Экзамен сдан на отлично! Диплом с отличием, платье выпускницы в гардеробе и… кажется, в телефоне новое письмо 💌</p>`,
    buttons: [{ label: 'Открыть письмо 💌', value: true }],
    dismissable: false,
  });
  sfx('message');
  await dialog({
    icon: '💌',
    title: `Письмо от: ${CONFIG.loverName}`,
    html: `<div class="letter">${esc(CONFIG.finalLetter)}</div><div style="height:14px"></div>`,
    buttons: [{ label: 'Люблю ❤️', value: true }],
    dismissable: false,
  });
  confetti(80);
  toast({ icon: '💼', title: 'Открыта «Своя лаборатория»', text: 'Выполняй заказы за столом в общежитии' });
  save();
}
