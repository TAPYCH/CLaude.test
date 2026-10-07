// «Сандро-кликер» — tap the photo for hearts, buy helpers that tap for you. Progress is kept between sessions.
import { S, save } from '../core/state.js';
import { CONFIG } from '../config.js';
import { roundRect, starsFor } from './framework.js';
import { drawMandarin, drawEmoji } from './catcher.js';

const NAME = CONFIG.clicker.name;
const PHOTO = CONFIG.clicker.photo;
const ASPECT = 520 / 460; // photo height / width
const OFFLINE_CAP = 4 * 3600; // passive hearts accrue for at most 4 h away, at half rate
const HEAT_PER_TAP = 0.07;
const HEAT_DECAY = 0.25;
const FRENZY_TIME = 8;
const FRENZY_MUL = 3;

export const UPGRADES = [
  { id: 'tap', icon: '👆', name: 'Крепкий тап', cost: 15, grow: 1.6, tap: 1, desc: '+1 ❤️ за тап' },
  { id: 'mandarin', icon: '🍊', name: 'Мандаринка', cost: 40, grow: 1.15, sec: 1, desc: '+1 ❤️ в секунду' },
  { id: 'coffee', icon: '☕', name: 'Кофе на песке', cost: 350, grow: 1.15, sec: 6, desc: '+6 ❤️ в секунду' },
  { id: 'hug', icon: '🤗', name: 'Обнимашки', cost: 1200, grow: 3, mul: 2, max: 6, desc: 'Тап ×2' },
  { id: 'cat', icon: '🐱', name: 'Котик помогает', cost: 4000, grow: 1.15, sec: 40, desc: '+40 ❤️ в секунду' },
  { id: 'sea', icon: '🌊', name: 'Море Сухума', cost: 45000, grow: 1.15, sec: 260, desc: '+260 ❤️ в секунду' },
];

const lvl = (c, u) => c.up[u.id] || 0;
const costOf = (c, u) => Math.round(u.cost * Math.pow(u.grow, lvl(c, u)));
export const tapPower = (c) => (1 + lvl(c, UPGRADES[0])) * Math.pow(2, lvl(c, UPGRADES[3]));
export const perSecond = (c) => UPGRADES.reduce((a, u) => a + (u.sec || 0) * lvl(c, u), 0);

/** 1 234 · 12,3 тыс. · 4,56 млн · 7,8 млрд */
export function fmt(n) {
  n = Math.floor(n);
  if (n < 100000) return n.toLocaleString('ru-RU');
  const units = [[1e12, 'трлн'], [1e9, 'млрд'], [1e6, 'млн'], [1e3, 'тыс.']];
  const [d, name] = units.find(([d]) => n >= d);
  const v = n / d;
  return `${v.toLocaleString('ru-RU', { maximumFractionDigits: v < 10 ? 2 : v < 100 ? 1 : 0 })} ${name}`;
}

// sparkles of the kindergarten board background: [x, y, size, phase] in 0..1 units
const SPARKLES = Array.from({ length: 18 }, (_, i) => [((i * 0.618) % 1), ((i * 0.377 + 0.11) % 1), 0.6 + ((i * 7) % 5) / 6, i * 1.7]);

function sparkle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

export default {
  id: 'clicker',
  title: `${NAME}-кликер`,
  icon: `<img class="mgc-ico" src="${PHOTO}" alt="">`,
  scoreLabel: '❤️ за игру',
  noCountdown: true,
  howto: `Тапай фото — получай сердечки ❤️\nНа сердечки покупай помощников: они собирают сердечки сами, даже когда тебя нет.\n🔥 Тапай быстро — и ${NAME} будет «в ударе»: тап ×3.\n🍊 Лови золотые мандарины!\nПрогресс сохраняется сам — выходи через ✕ когда захочешь.`,
  create(api) {
    const { ctx } = api;
    const c = S.clicker;
    const img = new Image();
    img.src = PHOTO;

    let t = 0;
    let taps = 0;
    let earned = 0;
    let heat = 0;
    let frenzy = 0;
    let squish = 0; // spring: 1 right after a tap → 0
    let squishV = 0;
    let tilt = 0;
    let golden = null;
    let nextGolden = 12 + Math.random() * 10;
    let saveIn = 10;
    let uiIn = 0;
    let banner = null; // { text, life }
    const parts = [];
    const L = { cx: 0, cy: 0, pw: 0, ph: 0, x0: 0, x1: 0, y0: 0, y1: 0 };

    // offline income since the last visit
    const away = c.last ? Math.min(OFFLINE_CAP, (Date.now() - c.last) / 1000) : 0;
    const offline = away > 60 ? Math.floor(perSecond(c) * away * 0.5) : 0;

    // ---------------------------------------------------------------- shop (DOM)
    const shop = document.createElement('div');
    shop.className = 'mgc-shop';
    shop.innerHTML = `<div class="mgc-head"><b>Помощники</b><span data-tap></span></div>
      <div class="mgc-ups">${UPGRADES.map((u) => `<button class="mgc-up" data-id="${u.id}">
        <span class="mgc-ui">${u.icon}<i data-lv></i></span>
        <span class="mgc-ut"><b>${u.name}</b><small>${u.desc}</small><em data-cost></em></span></button>`).join('')}</div>`;
    api.root.appendChild(shop);
    const btns = UPGRADES.map((u) => shop.querySelector(`[data-id="${u.id}"]`));
    const tapLabel = shop.querySelector('[data-tap]');
    btns.forEach((b, i) => b.addEventListener('click', () => buy(UPGRADES[i], b)));

    function buy(u, b) {
      if (!api.playing) return;
      const maxed = u.max != null && lvl(c, u) >= u.max;
      const cost = costOf(c, u);
      if (maxed || c.hearts < cost) {
        api.sfx('bad');
        b.classList.remove('shake');
        void b.offsetWidth;
        b.classList.add('shake');
        return;
      }
      c.hearts -= cost;
      c.up[u.id] = lvl(c, u) + 1;
      api.sfx('coin');
      api.vibrate(15);
      b.classList.remove('bought');
      void b.offsetWidth;
      b.classList.add('bought');
      const r = b.getBoundingClientRect();
      const cr = api.canvas.getBoundingClientRect();
      float(r.left - cr.left + r.width / 2, r.top - cr.top, `${u.icon} ур. ${c.up[u.id]}`, '#fff', 18);
      updateUi(true);
      save();
    }

    let lastStats = '';
    function updateUi(force) {
      const stats = [`❤️ ${fmt(c.hearts)}`, `⚡ ${fmt(perSecond(c))}/с`];
      const key = stats.join('|');
      if (force || key !== lastStats) {
        api.setStats(stats);
        lastStats = key;
      }
      tapLabel.textContent = `👆 ${fmt(tapPower(c) * (frenzy > 0 ? FRENZY_MUL : 1))} за тап`;
      UPGRADES.forEach((u, i) => {
        const b = btns[i];
        const lv = lvl(c, u);
        const maxed = u.max != null && lv >= u.max;
        const cost = costOf(c, u);
        b.classList.toggle('no', maxed || c.hearts < cost);
        b.classList.toggle('max', maxed);
        b.querySelector('[data-lv]').textContent = lv || '';
        b.querySelector('[data-cost]').textContent = maxed ? 'макс.' : `❤️ ${fmt(cost)}`;
      });
    }

    // ---------------------------------------------------------------- effects
    function float(x, y, text, color = '#fff', size = 22) {
      parts.push({ kind: 'text', x, y, vx: 0, vy: -70, life: 1, max: 1, text, color, size });
    }
    function burst(x, y, n, emoji = '❤️') {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 120 + Math.random() * 160;
        parts.push({ kind: 'emoji', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: 0.8, max: 0.8, text: emoji, size: 9 + Math.random() * 7 });
      }
      if (parts.length > 120) parts.splice(0, parts.length - 120);
    }
    function give(n) {
      c.hearts += n;
      c.total += n;
      earned += n;
    }

    function spawnGolden() {
      for (let k = 0; k < 12; k++) {
        const x = L.x0 + 46 + Math.random() * Math.max(1, L.x1 - L.x0 - 92);
        const y = L.y0 + 46 + Math.random() * Math.max(1, L.y1 - L.y0 - 92);
        const dx = (x - L.cx) / (L.pw * 0.6 + 30);
        const dy = (y - L.cy) / (L.ph * 0.6 + 30);
        if (dx * dx + dy * dy > 1 || k === 11) {
          golden = { x, y, life: 8 };
          return;
        }
      }
    }

    // ---------------------------------------------------------------- layout
    function layout() {
      const cr = api.canvas.getBoundingClientRect();
      const top = api.root.querySelector('.mg-top').getBoundingClientRect().bottom - cr.top;
      const sr = shop.getBoundingClientRect();
      const side = sr.top - cr.top < api.H * 0.4; // landscape: the shop sits on the right
      L.x0 = 0;
      L.x1 = side ? sr.left - cr.left : api.W;
      L.y0 = top + 6;
      L.y1 = side ? api.H : sr.top - cr.top;
      const w = L.x1 - L.x0;
      const h = L.y1 - L.y0;
      // photo + ribbon (≈0.16·pw below the oval) + heat bar (≈34px)
      L.pw = Math.max(60, Math.min(w * 0.74, 360, (h - 50) / (ASPECT + 0.16)));
      L.ph = L.pw * ASPECT;
      L.cx = (L.x0 + L.x1) / 2;
      L.cy = L.y0 + (h - (L.ph + L.pw * 0.16 + 34)) / 2 + L.ph / 2;
    }

    // ---------------------------------------------------------------- drawing
    function drawBackground() {
      const { W, H } = api;
      const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
      g.addColorStop(0, '#7cc4f6');
      g.addColorStop(0.55, '#4b97e0');
      g.addColorStop(1, '#2f6fc4');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // soft light rays from the top-right corner
      ctx.save();
      ctx.translate(W * 0.9, -H * 0.05);
      ctx.rotate(t * 0.03);
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      for (let i = 0; i < 9; i++) {
        ctx.rotate((Math.PI * 2) / 9);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.max(W, H) * 1.6, -Math.max(W, H) * 0.18);
        ctx.lineTo(Math.max(W, H) * 1.6, Math.max(W, H) * 0.18);
        ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = '#fff';
      for (const [sx, sy, s, ph] of SPARKLES) {
        const k = 0.5 + 0.5 * Math.sin(t * 2 + ph);
        ctx.globalAlpha = 0.35 + 0.6 * k;
        sparkle(ctx, sx * W, sy * H, (5 + 9 * s) * (0.6 + 0.4 * k));
      }
      ctx.globalAlpha = 1;
    }

    function drawPhoto() {
      const { cx, cy, pw, ph } = L;
      const s = 1 - squish * 0.07;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.scale(s * (1 + squish * 0.02), s);
      // glow
      if (frenzy > 0) {
        ctx.shadowColor = `rgba(255,${120 + 60 * Math.sin(t * 12)},60,0.95)`;
        ctx.shadowBlur = 34;
      } else {
        ctx.shadowColor = 'rgba(20,40,90,0.35)';
        ctx.shadowBlur = 22;
        ctx.shadowOffsetY = 8;
      }
      // golden oval frame, like on the kindergarten board
      const fr = ctx.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2);
      fr.addColorStop(0, '#fff3b8');
      fr.addColorStop(0.45, '#e3b84e');
      fr.addColorStop(0.7, '#fff0a8');
      fr.addColorStop(1, '#b8862a');
      ctx.fillStyle = fr;
      ctx.beginPath();
      ctx.ellipse(0, 0, pw / 2 + 8, ph / 2 + 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.ellipse(0, 0, pw / 2, ph / 2, 0, 0, Math.PI * 2);
      ctx.save();
      ctx.clip();
      if (img.complete && img.naturalWidth) ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph);
      else {
        ctx.fillStyle = '#cfe8fb';
        ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
      }
      if (squish > 0.3) {
        ctx.fillStyle = `rgba(255,255,255,${(squish - 0.3) * 0.35})`;
        ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(120,80,20,0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    function drawRibbon() {
      const { cx, cy, pw, ph } = L;
      const bw = pw * 1.02;
      const bh = Math.max(26, pw * 0.17);
      const y = cy + ph / 2 - bh * 0.35;
      const tail = bh * 0.7;
      // tails
      ctx.fillStyle = '#c9a046';
      for (const d of [-1, 1]) {
        const x = cx + d * (bw / 2 - tail * 0.2);
        ctx.beginPath();
        ctx.moveTo(x, y + bh * 0.25);
        ctx.lineTo(x + d * tail, y + bh * 0.25);
        ctx.lineTo(x + d * tail * 0.7, y + bh * 0.7);
        ctx.lineTo(x + d * tail, y + bh * 1.15);
        ctx.lineTo(x, y + bh * 1.15);
        ctx.closePath();
        ctx.fill();
      }
      const g = ctx.createLinearGradient(0, y, 0, y + bh);
      g.addColorStop(0, '#fff2b0');
      g.addColorStop(0.5, '#ecd27a');
      g.addColorStop(1, '#d4ad52');
      ctx.fillStyle = g;
      ctx.shadowColor = 'rgba(40,30,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      roundRect(ctx, cx - bw / 2, y, bw, bh, bh * 0.22);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#b28a35';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = `${Math.round(bh * 0.78)}px "Marck Script", cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#fff6cc';
      ctx.lineWidth = 4;
      ctx.strokeText(NAME, cx, y + bh * 0.54);
      ctx.fillStyle = '#2b1a10';
      ctx.fillText(NAME, cx, y + bh * 0.54);
      ctx.textBaseline = 'alphabetic';
      return y + bh;
    }

    function drawHeat(y) {
      const w = Math.min(L.pw * 0.86, 280);
      const x = L.cx - w / 2;
      y += 14;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      roundRect(ctx, x, y, w, 12, 6);
      ctx.fill();
      const k = frenzy > 0 ? frenzy / FRENZY_TIME : heat;
      if (k > 0.01) {
        const g = ctx.createLinearGradient(x, 0, x + w, 0);
        g.addColorStop(0, '#ffc23d');
        g.addColorStop(1, frenzy > 0 ? '#ff3d6e' : '#ff7a2e');
        ctx.fillStyle = g;
        roundRect(ctx, x, y, Math.max(12, w * k), 12, 6);
        ctx.fill();
      }
      ctx.font = '900 13px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 4;
      ctx.fillText(frenzy > 0 ? `🔥 В ударе! Тап ×${FRENZY_MUL}` : '🔥 Тапай быстрее — будет ×3', L.cx, y + 30);
      ctx.shadowColor = 'transparent';
    }

    function drawGolden() {
      if (!golden) return;
      const k = Math.min(1, golden.life / 0.6); // fade out at the end
      const y = golden.y + Math.sin(t * 3) * 6;
      ctx.globalAlpha = k;
      ctx.fillStyle = `rgba(255,236,140,${0.3 + 0.2 * Math.sin(t * 6)})`;
      ctx.beginPath();
      ctx.arc(golden.x, y, 34 + 4 * Math.sin(t * 6), 0, Math.PI * 2);
      ctx.fill();
      drawMandarin(ctx, golden.x, y, 22, true);
      ctx.fillStyle = '#fff';
      sparkle(ctx, golden.x + 18, y - 18, 6 + 3 * Math.sin(t * 8));
      ctx.globalAlpha = 1;
    }

    function drawParts() {
      ctx.textAlign = 'center';
      for (const p of parts) {
        ctx.globalAlpha = Math.max(0, Math.min(1, (p.life / p.max) * 1.6));
        if (p.kind === 'emoji') drawEmoji(ctx, p.text, p.x, p.y, p.size);
        else {
          ctx.font = `900 ${p.size}px Nunito, sans-serif`;
          ctx.lineJoin = 'round';
          ctx.strokeStyle = 'rgba(80,30,70,0.55)';
          ctx.lineWidth = 4;
          ctx.strokeText(p.text, p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, p.x, p.y);
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawBanner() {
      if (!banner) return;
      const a = Math.min(1, banner.life * 2, (banner.max - banner.life) * 4);
      ctx.globalAlpha = a;
      ctx.font = '900 15px Nunito, sans-serif';
      const w = ctx.measureText(banner.text).width + 28;
      const x = L.cx - w / 2;
      const y = L.y0 + 4;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      roundRect(ctx, x, y, w, 32, 16);
      ctx.fill();
      ctx.fillStyle = '#4a2e45';
      ctx.textAlign = 'center';
      ctx.fillText(banner.text, L.cx, y + 21);
      ctx.globalAlpha = 1;
    }

    const insidePhoto = (x, y) => {
      const dx = (x - L.cx) / (L.pw / 2 + 14);
      const dy = (y - L.cy) / (L.ph / 2 + 14);
      return dx * dx + dy * dy <= 1;
    };

    function result() {
      c.last = Date.now();
      save();
      return {
        stars: starsFor(taps, [40, 150, 300]),
        score: Math.floor(earned),
        taps,
        title: ['Заходи ещё!', 'Неплохо!', 'Отлично!', 'Тап-мастер!'][starsFor(taps, [40, 150, 300])],
        text: `Тапов: ${taps}. Всего собрано: ${fmt(c.total)} ❤️`,
      };
    }

    return {
      resize: layout,
      start() {
        layout();
        if (offline > 0) {
          give(offline);
          earned -= offline; // the session score counts only what was earned while playing
          banner = { text: `Пока тебя не было: +${fmt(offline)} ❤️`, life: 4, max: 4 };
        }
        c.last = Date.now();
        updateUi(true);
      },
      pointerdown(x, y) {
        if (golden && Math.hypot(x - golden.x, y - golden.y) < 44) {
          const bonus = Math.max(25 * tapPower(c), Math.round(30 * perSecond(c)), 50);
          give(bonus);
          burst(golden.x, golden.y, 14, '🍊');
          float(golden.x, golden.y - 20, `+${fmt(bonus)} ❤️`, '#fff2a0', 28);
          banner = { text: '🍊 Золотой мандарин!', life: 2, max: 2 };
          golden = null;
          nextGolden = 18 + Math.random() * 17;
          api.sfx('coin');
          api.vibrate(25);
          return;
        }
        if (!insidePhoto(x, y)) return;
        const n = tapPower(c) * (frenzy > 0 ? FRENZY_MUL : 1);
        give(n);
        taps++;
        c.taps++;
        squish = 1;
        squishV = 0;
        tilt = (x < L.cx ? -1 : 1) * 0.035;
        float(x + (Math.random() - 0.5) * 20, y - 10, `+${fmt(n)}`, frenzy > 0 ? '#ffe36b' : '#fff', frenzy > 0 ? 28 : 24);
        burst(x, y, frenzy > 0 ? 2 : 1);
        api.sfx('tap');
        api.vibrate(6);
        if (frenzy <= 0) {
          heat = Math.min(1, heat + HEAT_PER_TAP);
          if (heat >= 1) {
            frenzy = FRENZY_TIME;
            heat = 0;
            banner = { text: `🔥 ${NAME} в ударе! Тап ×${FRENZY_MUL}`, life: 2.2, max: 2.2 };
            api.sfx('levelup');
            api.vibrate(40);
          }
        }
        updateUi();
      },
      update(dt) {
        t += dt;
        // passive income
        const ps = perSecond(c);
        if (ps) give(ps * dt);
        if (frenzy > 0) frenzy = Math.max(0, frenzy - dt);
        else heat = Math.max(0, heat - HEAT_DECAY * dt);
        // squish spring
        squishV += (-squish * 260 - squishV * 18) * dt;
        squish = Math.max(-0.3, squish + squishV * dt);
        tilt *= Math.pow(0.02, dt);
        // golden mandarin
        if (golden) {
          golden.life -= dt;
          if (golden.life <= 0) {
            golden = null;
            nextGolden = 18 + Math.random() * 17;
          }
        } else if ((nextGolden -= dt) <= 0) spawnGolden();
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.life -= dt;
          if (p.life <= 0) {
            parts.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.kind === 'emoji') p.vy += 420 * dt;
        }
        if (banner && (banner.life -= dt) <= 0) banner = null;
        if ((uiIn -= dt) <= 0) {
          uiIn = 0.2;
          updateUi();
        }
        if ((saveIn -= dt) <= 0) {
          saveIn = 10;
          c.last = Date.now();
          save();
        }
      },
      draw() {
        if (!L.pw) layout();
        drawBackground();
        drawPhoto();
        drawHeat(drawRibbon());
        drawGolden();
        drawParts();
        drawBanner();
      },
      quit() {
        api.end(result());
      },
      destroy() {
        c.last = Date.now();
        save();
      },
    };
  },
};
