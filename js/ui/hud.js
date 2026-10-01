// Heads-up display: clock, speed, money, quest tracker, needs, phone button.
import { S, NEEDS } from '../core/state.js';
import { formatClock, formatDate, dayPhase, season, weatherOf } from '../core/time.js';
import { currentQuest } from '../core/progress.js';
import { el, $ } from './dom.js';
import { sfx } from '../audio.js';

let root;
let handlers = {};
let lastMoney = null;
let lastQuestKey = '';

const PHASE_ICON = { night: '🌙', dawn: '🌅', day: '☀️', sunset: '🌇', evening: '🌆' };
const SEASON_ICON = { winter: '❄️', autumn: '🍂', spring: '🌸', summer: '🌞' };

const ring = (id, color) => {
  const r = 19;
  const c = 2 * Math.PI * r;
  return `<svg viewBox="0 0 46 46"><circle class="ring-bg" cx="23" cy="23" r="${r}" fill="#fff" stroke-width="5"/>
    <circle class="ring" data-ring="${id}" cx="23" cy="23" r="${r}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="0"/></svg>`;
};

export function mountHud(container, h) {
  handlers = h;
  root = el(`<div class="hud">
    <div class="hud-top">
      <div class="pill clock-pill">
        <div class="ico" data-phase></div>
        <div><div class="t" data-clock></div><div class="d" data-date></div></div>
        <div class="speed">
          <button data-speed="0" aria-label="Пауза">❚❚</button>
          <button data-speed="1" aria-label="Скорость 1">▶</button>
          <button data-speed="3" aria-label="Скорость 3">▶▶</button>
        </div>
      </div>
      <div class="hud-right">
        <button class="pill money-pill" data-money-btn><div class="coin">₽</div><b data-money></b></button>
      </div>
    </div>
    <button class="quest-chip" data-quest hidden></button>
    <div class="hud-bottom">
      <div class="needs">${NEEDS.map((n) => `<div class="need" data-need="${n.id}">${ring(n.id, n.color)}<div class="ico">${n.icon}</div><div class="need-tip">${n.name}: <span></span>%</div></div>`).join('')}</div>
      <button class="phone-btn" aria-label="Телефон">
        <svg viewBox="0 0 30 46"><rect x="1.5" y="1.5" width="27" height="43" rx="7" fill="#fff"/><rect x="5" y="7" width="20" height="30" rx="3" fill="#ffd1e0"/><circle cx="15" cy="40.5" r="2" fill="#ffb3c8"/><path d="M15,26 c-3,-4.5 -9,-1 0,6 c9,-7 3,-10.5 0,-6 Z" fill="#ff6f9c"/></svg>
        <span class="badge" data-badge hidden></span>
      </button>
    </div>
  </div>`);
  container.appendChild(root);

  root.querySelectorAll('[data-speed]').forEach((b) =>
    b.addEventListener('click', () => {
      sfx('click');
      S.settings.speed = +b.dataset.speed;
      updateHud();
    }),
  );
  $('.phone-btn', root).addEventListener('click', () => {
    sfx('pop');
    handlers.openPhone && handlers.openPhone();
  });
  $('[data-quest]', root).addEventListener('click', () => {
    sfx('click');
    handlers.openPhone && handlers.openPhone('quests');
  });
  $('[data-money-btn]', root).addEventListener('click', () => {
    sfx('click');
    handlers.openPhone && handlers.openPhone('profile');
  });
  root.querySelectorAll('.need').forEach((n) =>
    n.addEventListener('click', () => {
      n.classList.add('show-tip');
      setTimeout(() => n.classList.remove('show-tip'), 1600);
    }),
  );
  updateHud();
}

export function updateHud() {
  if (!root) return;
  const ph = dayPhase(S.minutes);
  $('[data-clock]', root).textContent = formatClock(S.minutes);
  const wx = weatherOf(S.day, S.city);
  $('[data-date]', root).textContent = `${formatDate(S.day)} ${wx === 'rain' ? '🌧️' : wx === 'snow' ? '❄️' : SEASON_ICON[season(S.day)]}`;
  $('[data-phase]', root).textContent = PHASE_ICON[ph.name];
  root.querySelectorAll('[data-speed]').forEach((b) => b.classList.toggle('on', +b.dataset.speed === S.settings.speed));

  const mEl = $('[data-money]', root);
  const m = Math.round(S.money).toLocaleString('ru-RU');
  if (mEl.textContent !== m) {
    mEl.textContent = m;
    if (lastMoney != null) {
      const pill = $('.money-pill', root);
      pill.classList.remove('bump');
      void pill.offsetWidth;
      pill.classList.add('bump');
    }
    lastMoney = S.money;
  }

  for (const n of NEEDS) {
    const node = root.querySelector(`[data-need="${n.id}"]`);
    const v = S.needs[n.id];
    const ringEl = node.querySelector('.ring');
    const c = 2 * Math.PI * 19;
    ringEl.style.strokeDashoffset = String(c * (1 - v / 100));
    ringEl.style.stroke = v < 20 ? '#ff4f6a' : n.color;
    node.classList.toggle('low', v < 20);
    node.querySelector('.need-tip span').textContent = Math.round(v);
  }

  const badge = $('[data-badge]', root);
  badge.hidden = !S.unread;
  badge.textContent = S.unread;

  const q = currentQuest();
  const chip = $('[data-quest]', root);
  const key = q ? q.id + ':' + S.quest.progress : 'none';
  if (key !== lastQuestKey) {
    lastQuestKey = key;
    if (!q) chip.hidden = true;
    else {
      chip.hidden = false;
      const pct = Math.min(1, S.quest.progress / q.goal.count);
      chip.innerHTML = `<div class="q-ico">${q.icon}</div><div style="min-width:0"><div class="q-t">${q.title}</div><div class="q-d">${q.hint}</div>${q.goal.count > 1 ? `<div class="q-bar"><i style="width:${pct * 100}%"></i></div>` : ''}</div>`;
    }
  }
}

export function flashQuestChip() {
  const chip = root && $('[data-quest]', root);
  if (!chip) return;
  chip.classList.remove('done');
  void chip.offsetWidth;
  chip.classList.add('done');
}

export function hudVisible(v) {
  if (root) root.style.display = v ? '' : 'none';
}
