// «Бариста» — remember the order and build the drink in the right sequence.
import { roundRect, starsFor } from './framework.js';

const ING = {
  espresso: { e: '☕', n: 'Эспрессо', c: '#5a2e18' },
  water: { e: '💧', n: 'Вода', c: '#9b6b4a' },
  milk: { e: '🥛', n: 'Молоко', c: '#f4e6d4' },
  oat: { e: '🌾', n: 'Овсяное', c: '#efdcb8' },
  cream: { e: '🍶', n: 'Сливки', c: '#fff6e8' },
  foam: { e: '☁️', n: 'Пенка', c: '#ffffff' },
  heart: { e: '❤️', n: 'Сердце', c: null },
  caramel: { e: '🍯', n: 'Карамель', c: '#d98a2a' },
  lavender: { e: '💜', n: 'Лаванда', c: '#c9a9ff' },
  chocolate: { e: '🍫', n: 'Шоколад', c: '#6b3a22' },
  ice: { e: '🧊', n: 'Лёд', c: '#d9f3ff' },
  matcha: { e: '🍵', n: 'Матча', c: '#8fc26a' },
};

const DRINKS = [
  { n: 'Эспрессо', s: ['espresso'], lvl: 0 },
  { n: 'Американо', s: ['espresso', 'water'], lvl: 0 },
  { n: 'Капучино', s: ['espresso', 'milk', 'foam'], lvl: 0 },
  { n: 'Латте с сердечком', s: ['espresso', 'milk', 'heart'], lvl: 1 },
  { n: 'Карамельный латте', s: ['espresso', 'caramel', 'milk'], lvl: 1 },
  { n: 'Матча-латте', s: ['matcha', 'oat'], lvl: 1 },
  { n: 'Раф лавандовый', s: ['espresso', 'lavender', 'cream'], lvl: 2 },
  { n: 'Айс-латте', s: ['ice', 'espresso', 'milk'], lvl: 2 },
  { n: 'Мокко', s: ['espresso', 'chocolate', 'milk', 'foam'], lvl: 2 },
  { n: 'Овсяный капучино', s: ['espresso', 'oat', 'foam', 'heart'], lvl: 3 },
  { n: 'Раф карамельный', s: ['espresso', 'caramel', 'cream', 'foam'], lvl: 3 },
];

const FACES = ['👩🏻', '👨🏻‍🦱', '👵🏻', '🧑🏻‍🎓', '👩🏼‍🦰', '👨🏻‍💼', '👱🏻‍♀️', '🧔🏻', '👩🏻‍⚕️', '🧑🏻‍🎨'];

export default {
  id: 'barista',
  title: 'Смена бариста',
  icon: '☕',
  scoreLabel: 'заказов',
  howto: 'Гость называет заказ — запомни рецепт!\nПотом нажимай ингредиенты строго по порядку.\nЧем быстрее, тем больше чаевые 💸',
  create(api) {
    const { ctx } = api;
    const SHIFT = 80;
    let t = 0;
    let served = 0;
    let failed = 0;
    let tips = 0;
    let streak = 0;
    let order = null;
    let cup = [];
    let shake = 0;
    let happy = 0;
    let steam = [];

    const ui = document.createElement('div');
    ui.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;flex-direction:column';
    ui.innerHTML = `
      <div data-guest style="margin:calc(70px + var(--safe-t)) auto 0;display:flex;align-items:flex-start;gap:10px;max-width:94%;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s">
        <div data-face style="font-size:56px;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.2))"></div>
        <div data-bubble style="background:#fff;border-radius:20px;padding:10px 14px;box-shadow:0 8px 24px rgba(0,0,0,.2);min-width:170px;position:relative">
          <div data-name style="font-weight:900;font-size:16px"></div>
          <div data-recipe style="font-size:28px;letter-spacing:4px;margin-top:4px;min-height:36px"></div>
          <div style="height:6px;border-radius:3px;background:#f3e8ef;margin-top:6px;overflow:hidden"><i data-timer style="display:block;height:100%;background:linear-gradient(90deg,#3fcfae,#ffc23d,#ff5a6e);width:100%"></i></div>
        </div>
      </div>
      <div style="flex:1"></div>
      <div data-pad style="pointer-events:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:10px 12px;background:rgba(255,255,255,.85);border-radius:24px 24px 0 0;box-shadow:0 -8px 24px rgba(0,0,0,.15)"></div>
      <div style="pointer-events:auto;display:flex;gap:8px;padding:0 12px calc(12px + var(--safe-b));background:rgba(255,255,255,.85)">
        <button class="btn ghost small" data-trash style="flex:1">🗑️ Вылить</button>
      </div>`;
    api.root.appendChild(ui);
    const pad = ui.querySelector('[data-pad]');
    const wide = window.innerWidth > window.innerHeight * 1.2;
    if (wide) pad.style.gridTemplateColumns = 'repeat(6,1fr)';
    for (const [k, v] of Object.entries(ING)) {
      const b = document.createElement('button');
      b.style.cssText = (wide ? 'height:52px;' : 'height:64px;') + 'border-radius:16px;background:#fff;box-shadow:0 3px 0 #ecd5e1,0 4px 10px rgba(0,0,0,.08);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:24px;line-height:1;transition:transform .1s';
      b.innerHTML = `${v.e}<span style="font-size:11px;font-weight:900;margin-top:4px;color:#7d6078">${v.n}</span>`;
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        b.style.transform = 'scale(.9)';
        setTimeout(() => (b.style.transform = ''), 120);
        add(k);
      });
      pad.appendChild(b);
    }
    ui.querySelector('[data-trash]').addEventListener('click', () => {
      cup = [];
      api.sfx('splash');
    });

    function level() {
      return served < 2 ? 0 : served < 4 ? 1 : served < 7 ? 2 : 3;
    }
    function next() {
      const pool = DRINKS.filter((d) => d.lvl <= level());
      const d = pool[Math.floor(Math.random() * pool.length)];
      const time = 9 + d.s.length * 2.2;
      order = { d, face: FACES[Math.floor(Math.random() * FACES.length)], time, left: time, showFor: served < 3 ? 99 : 2.6 + d.s.length * 0.4 };
      cup = [];
      const g = ui.querySelector('[data-guest]');
      g.style.transform = 'translateX(120%)';
      g.style.opacity = '0';
      requestAnimationFrame(() =>
        setTimeout(() => {
          g.style.transform = '';
          g.style.opacity = '1';
        }, 30),
      );
      ui.querySelector('[data-face]').textContent = order.face;
      ui.querySelector('[data-name]').textContent = d.n;
      ui.querySelector('[data-recipe]').textContent = d.s.map((s) => ING[s].e).join(' ');
      api.sfx('pop');
    }
    function add(k) {
      if (!order || !api.playing) return;
      const expected = order.d.s[cup.length];
      cup.push(k);
      if (k !== expected) {
        api.sfx('bad');
        api.vibrate(40);
        shake = 0.4;
        failed++;
        streak = 0;
        ui.querySelector('[data-face]').textContent = '😕';
        ui.querySelector('[data-recipe]').textContent = `${order.d.s.map((s) => ING[s].e).join(' ')}`;
        order = null;
        setTimeout(() => api.playing && next(), 900);
        return;
      }
      api.sfx('tap');
      if (cup.length === order.d.s.length) {
        served++;
        streak++;
        const tip = Math.round(40 + (order.left / order.time) * 120 + (streak >= 3 ? 50 : 0));
        tips += tip;
        happy = 1;
        api.sfx('coin');
        ui.querySelector('[data-face]').textContent = '😍';
        ui.querySelector('[data-recipe]').textContent = `+${tip} ₽ чаевых`;
        order = null;
        setTimeout(() => api.playing && next(), 900);
      }
    }

    function drawCup() {
      const W = api.W;
      const H = api.H;
      const cx = W / 2 + (shake > 0 ? Math.sin(t * 60) * 8 : 0);
      const base = H * (wide ? 0.55 : 0.66);
      const cw = Math.min(150, W * 0.36, H * 0.26);
      const ch = cw * 1.05;
      // saucer
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(cx, base + 6, cw * 0.85, cw * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd6e4';
      ctx.beginPath();
      ctx.ellipse(cx, base + 4, cw * 0.6, cw * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();
      // glass body
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - cw / 2, base - ch);
      ctx.lineTo(cx + cw / 2, base - ch);
      ctx.lineTo(cx + cw * 0.4, base);
      ctx.lineTo(cx - cw * 0.4, base);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fill();
      ctx.clip();
      const fills = cup.filter((k) => ING[k].c);
      const layerH = (ch * 0.9) / Math.max(4, fills.length);
      fills.forEach((k, i) => {
        ctx.fillStyle = ING[k].c;
        ctx.fillRect(cx - cw, base - layerH * (i + 1), cw * 2, layerH + 1);
      });
      if (cup.includes('ice'))
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = 'rgba(255,255,255,.8)';
          roundRect(ctx, cx - cw * 0.3 + i * cw * 0.2, base - layerH * fills.length + 6 + (i % 2) * 10, cw * 0.18, cw * 0.18, 6);
          ctx.fill();
        }
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.95)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - cw / 2, base - ch);
      ctx.lineTo(cx - cw * 0.4, base);
      ctx.lineTo(cx + cw * 0.4, base);
      ctx.lineTo(cx + cw / 2, base - ch);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + cw * 0.5, base - ch * 0.55, cw * 0.18, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      if (cup.includes('heart')) {
        const fillsN = fills.length;
        const y = base - layerH * fillsN + 10;
        ctx.fillStyle = '#c98a5a';
        ctx.font = `${cw * 0.3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('🤍', cx, y + cw * 0.12);
      }
      if (happy > 0) {
        ctx.font = '900 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = happy;
        ctx.fillText('✨', cx - cw * 0.7, base - ch - 10 + happy * 10);
        ctx.fillText('✨', cx + cw * 0.7, base - ch + 10 - happy * 10);
        ctx.globalAlpha = 1;
      }
      // steam
      ctx.strokeStyle = 'rgba(255,255,255,.7)';
      ctx.lineWidth = 4;
      for (const s of steam) {
        ctx.globalAlpha = s.life;
        ctx.beginPath();
        ctx.moveTo(cx + s.x, base - ch - 6);
        ctx.quadraticCurveTo(cx + s.x + Math.sin(t * 3 + s.x) * 12, base - ch - 30 - (1 - s.life) * 40, cx + s.x, base - ch - 60 - (1 - s.life) * 60);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    return {
      start() {
        next();
      },
      update(dt) {
        t += dt;
        if (shake > 0) shake -= dt;
        if (happy > 0) happy -= dt;
        if (Math.random() < dt * 2 && cup.includes('espresso')) steam.push({ x: (Math.random() - 0.5) * 40, life: 1 });
        for (const s of steam) s.life -= dt * 0.8;
        steam = steam.filter((s) => s.life > 0);
        if (order) {
          order.left -= dt;
          order.showFor -= dt;
          const timer = ui.querySelector('[data-timer]');
          timer.style.width = `${Math.max(0, (order.left / order.time) * 100)}%`;
          const rec = ui.querySelector('[data-recipe]');
          if (order.showFor <= 0 && rec.dataset.hidden !== '1') {
            rec.dataset.hidden = '1';
            rec.textContent = '🤔 ' + '❔'.repeat(order.d.s.length);
          } else if (order.showFor > 0) rec.dataset.hidden = '';
          if (order.left <= 0) {
            failed++;
            streak = 0;
            ui.querySelector('[data-face]').textContent = '😤';
            api.sfx('fail');
            order = null;
            setTimeout(() => api.playing && next(), 800);
          }
        }
        api.setStats([`☕ ${served}`, `💸 ${tips}`, `⏱ ${Math.max(0, Math.ceil(SHIFT - t))}`]);
        if (t >= SHIFT) {
          ui.remove();
          api.end({ score: served, tips, stars: starsFor(served, [4, 7, 10]), text: `Чаевые: ${tips} ₽ · ошибок: ${failed}` });
        }
      },
      draw() {
        const W = api.W;
        const H = api.H;
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#ffe9da');
        g.addColorStop(1, '#ffd8c2');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#f6c9b0';
        for (let y = 0; y < H * 0.7; y += 34)
          for (let x = (y / 34) % 2 ? -40 : 0; x < W; x += 80) {
            roundRect(ctx, x + 3, y + 3, 74, 28, 4);
            ctx.fill();
          }
        ctx.fillStyle = '#c98b5a';
        const ct = H * (wide ? 0.55 : 0.66);
        ctx.fillRect(0, ct, W, H - ct);
        ctx.fillStyle = '#f3e2d3';
        ctx.fillRect(0, ct - 8, W, 16);
        drawCup();
      },
      destroy() {
        ui.remove();
      },
    };
  },
};
