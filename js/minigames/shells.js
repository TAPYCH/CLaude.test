// «Ракушки» — swim in the Black Sea, collect shells & pearls, avoid jellyfish.
import { svgImage, starsFor } from './framework.js';
import { renderLanaHead } from '../art/character.js';
import { S } from '../core/state.js';

function diverSvg() {
  const head = renderLanaHead({ outfit: { ...S.outfit, hairStyle: 'ponytail' }, expr: 'happy' }).replace('<svg ', '<svg x="40" y="0" width="80" height="100" ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
    <path d="M70,70 C40,74 18,80 4,70 C14,90 40,92 72,86 Z" fill="#f9d6c3"/>
    <path d="M60,68 C80,60 110,64 128,80 C110,96 84,98 62,90 Z" fill="#ff7f6e"/>
    <path d="M126,78 C140,70 150,74 158,66 C156,84 146,90 128,88 Z" fill="#f9d6c3"/>
    ${head}
    <rect x="58" y="30" width="44" height="18" rx="9" fill="#7fd3ff" stroke="#fff" stroke-width="3" opacity=".85"/>
    <path d="M104,36 L112,6" stroke="#ffd23d" stroke-width="6" stroke-linecap="round"/>
  </svg>`;
}

const SHELL_COLORS = ['#ffd1dc', '#ffe6c4', '#e6dcff', '#d6f3ff'];

function drawShell(ctx, x, y, r, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x - r, y + r * 0.5);
  ctx.quadraticCurveTo(x, y - r * 1.4, x + r, y + r * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,120,150,.6)';
  ctx.lineWidth = 2;
  for (const d of [-0.5, 0, 0.5]) {
    ctx.beginPath();
    ctx.moveTo(x + d * r * 1.1, y + r * 0.45);
    ctx.lineTo(x + d * r * 0.3, y - r * 0.5);
    ctx.stroke();
  }
  ctx.fillStyle = c;
  ctx.fillRect(x - r * 0.25, y + r * 0.4, r * 0.5, r * 0.3);
}

function drawPearl(ctx, x, y, r, t) {
  ctx.fillStyle = '#c9a0e6';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.4, r * 1.3, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
  g.addColorStop(0, '#fff');
  g.addColorStop(1, '#e8def5');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.5 + Math.sin(t * 6) * 0.4;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + r * 0.6, y - r * 0.7, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawJelly(ctx, x, y, r, t) {
  ctx.fillStyle = 'rgba(255,140,200,.75)';
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0);
  ctx.quadraticCurveTo(x + r, y + r * 0.3, x, y + r * 0.2);
  ctx.quadraticCurveTo(x - r, y + r * 0.3, x - r, y);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,140,200,.7)';
  ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * r * 0.35, y + r * 0.2);
    ctx.quadraticCurveTo(x + i * r * 0.35 + Math.sin(t * 5 + i) * 8, y + r * 0.9, x + i * r * 0.35, y + r * 1.5);
    ctx.stroke();
  }
  ctx.fillStyle = '#4a2e45';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.3, 2.6, 0, Math.PI * 2);
  ctx.arc(x + r * 0.3, y - r * 0.3, 2.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawFish(ctx, x, y, r, dir, c) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-r * 0.8, 0);
  ctx.lineTo(-r * 1.5, -r * 0.5);
  ctx.lineTo(-r * 1.5, r * 0.5);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(r * 0.5, -r * 0.1, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(r * 0.55, -r * 0.1, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default {
  id: 'shells',
  title: 'Ракушки',
  icon: '🐚',
  scoreLabel: 'ракушек',
  howto: 'Ныряй в Чёрное море! Веди пальцем — Лана плывёт за ним.\n🐚 ракушка +1 · 🦪 жемчуг +3 (и 150 ₽)\nМедузы жалятся — у тебя 3 сердечка.',
  create(api) {
    const { ctx } = api;
    const img = svgImage(diverSvg());
    const DURATION = 40;
    let t = 0;
    let p = { x: api.W * 0.3, y: api.H * 0.5 };
    let target = { ...p };
    let facing = 1;
    let score = 0;
    let pearls = 0;
    let hearts = 3;
    let inv = 0;
    let things = [];
    let fish = [];
    let bubbles = [];
    let spawn = 0;
    let pops = [];

    for (let i = 0; i < 6; i++) fish.push({ x: Math.random() * api.W, y: api.H * (0.2 + Math.random() * 0.6), r: 10 + Math.random() * 10, dir: Math.random() < 0.5 ? 1 : -1, c: ['#ffb02e', '#4fb3ff', '#ff8fab', '#7fe0c4'][i % 4], sp: 30 + Math.random() * 50 });

    function spawnThing() {
      const r = Math.random();
      const fromRight = Math.random() < 0.5;
      const y = api.H * (0.18 + Math.random() * 0.66);
      const x = fromRight ? api.W + 30 : -30;
      const vx = (fromRight ? -1 : 1) * (50 + Math.random() * 60 + t * 2);
      if (r < 0.1 + Math.min(0.1, t * 0.004)) things.push({ k: 'jelly', x, y, vx: vx * 0.7, r: 22, ph: Math.random() * 6 });
      else if (r < 0.28) things.push({ k: 'pearl', x, y, vx, r: 14, ph: 0 });
      else things.push({ k: 'shell', x, y, vx, r: 16, c: SHELL_COLORS[Math.floor(Math.random() * 4)], ph: Math.random() * 6 });
    }

    function bg() {
      const g = ctx.createLinearGradient(0, 0, 0, api.H);
      g.addColorStop(0, '#5cd0f5');
      g.addColorStop(0.5, '#1f9bd6');
      g.addColorStop(1, '#0f5f96');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, api.W, api.H);
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) {
        const x = ((i * api.W) / 4 + Math.sin(t * 0.5 + i) * 30) % (api.W + 100);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 60, 0);
        ctx.lineTo(x - 80, api.H);
        ctx.lineTo(x - 160, api.H);
        ctx.fill();
      }
      ctx.restore();
      // sandy bottom with seaweed
      ctx.fillStyle = '#e8d3a8';
      ctx.beginPath();
      ctx.moveTo(0, api.H);
      for (let x = 0; x <= api.W; x += 40) ctx.lineTo(x, api.H - 40 - Math.sin(x * 0.03) * 10);
      ctx.lineTo(api.W, api.H);
      ctx.fill();
      ctx.strokeStyle = '#2fa86a';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const x = (i * api.W) / 7 + 20;
        ctx.beginPath();
        ctx.moveTo(x, api.H - 40);
        ctx.quadraticCurveTo(x + Math.sin(t * 2 + i) * 20, api.H - 100, x + Math.sin(t * 2 + i + 1) * 10, api.H - 150 - (i % 3) * 20);
        ctx.stroke();
      }
      // surface
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let x = 0; x <= api.W; x += 20) ctx.lineTo(x, 14 + Math.sin(x * 0.05 + t * 3) * 5);
      ctx.lineTo(api.W, 0);
      ctx.fill();
    }

    return {
      start() {
        api.hint('Веди пальцем — Лана плывёт следом');
        setTimeout(() => api.hint(null), 2500);
      },
      update(dt) {
        t += dt;
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        p.x += dx * Math.min(1, dt * 4);
        p.y += dy * Math.min(1, dt * 4);
        p.y = Math.max(api.H * 0.1, Math.min(api.H - 70, p.y));
        if (Math.abs(dx) > 4) facing = dx > 0 ? 1 : -1;
        if (inv > 0) inv -= dt;
        spawn -= dt;
        if (spawn <= 0) {
          spawn = Math.max(0.35, 0.9 - t * 0.012);
          spawnThing();
        }
        for (const f of fish) {
          f.x += f.dir * f.sp * dt;
          if (f.x > api.W + 40) f.x = -40;
          if (f.x < -40) f.x = api.W + 40;
        }
        if (Math.random() < dt * 4) bubbles.push({ x: p.x + facing * 30, y: p.y - 20, r: 2 + Math.random() * 4, vy: 40 + Math.random() * 40 });
        for (const b of bubbles) {
          b.y -= b.vy * dt;
          b.x += Math.sin(t * 4 + b.r) * 0.5;
        }
        bubbles = bubbles.filter((b) => b.y > 0);
        for (const th of things) {
          th.x += th.vx * dt;
          th.ph += dt;
          if (th.k === 'jelly') th.y += Math.sin(th.ph * 2) * 30 * dt;
          const hit = Math.hypot(th.x - p.x, th.y - p.y) < th.r + 30;
          if (hit && !th.done) {
            if (th.k === 'jelly') {
              if (inv <= 0) {
                hearts--;
                inv = 1.5;
                api.sfx('bad');
                api.vibrate(60);
                pops.push({ x: p.x, y: p.y - 40, text: '💔', life: 1 });
              }
            } else {
              th.done = true;
              const pts = th.k === 'pearl' ? 3 : 1;
              score += pts;
              if (th.k === 'pearl') pearls++;
              api.sfx(th.k === 'pearl' ? 'coin' : 'catch');
              pops.push({ x: th.x, y: th.y, text: `+${pts}`, life: 1 });
            }
          }
        }
        things = things.filter((th) => !th.done && th.x > -60 && th.x < api.W + 60);
        for (const q of pops) {
          q.y -= 50 * dt;
          q.life -= dt;
        }
        pops = pops.filter((q) => q.life > 0);
        api.setStats([`🐚 ${score}`, `${'❤️'.repeat(Math.max(0, hearts))}${'🤍'.repeat(3 - Math.max(0, hearts))}`, `⏱ ${Math.max(0, Math.ceil(DURATION - t))}`]);
        if (hearts <= 0 || t >= DURATION) api.end({ score, pearls, stars: hearts <= 0 ? Math.min(1, starsFor(score, [8, 16, 24])) : starsFor(score, [8, 16, 24]), text: hearts <= 0 ? 'Медузы победили, но ракушки — твои!' : `Жемчужин: ${pearls}` });
      },
      draw() {
        bg();
        for (const f of fish) drawFish(ctx, f.x, f.y, f.r, f.dir, f.c);
        for (const th of things) {
          if (th.k === 'jelly') drawJelly(ctx, th.x, th.y, th.r, t);
          else if (th.k === 'pearl') drawPearl(ctx, th.x, th.y, th.r, t);
          else drawShell(ctx, th.x, th.y + Math.sin(th.ph * 3) * 4, th.r, th.c);
        }
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        for (const b of bubbles) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        }
        if (img.complete) {
          ctx.save();
          ctx.translate(p.x, p.y + Math.sin(t * 4) * 3);
          ctx.scale(facing, 1);
          if (inv > 0) ctx.globalAlpha = 0.5 + Math.sin(t * 30) * 0.3;
          const w = Math.min(150, api.W * 0.34);
          ctx.drawImage(img, -w / 2, -w * 0.4, w, w * 0.75);
          ctx.restore();
        }
        ctx.font = '900 22px Nunito, sans-serif';
        ctx.textAlign = 'center';
        for (const q of pops) {
          ctx.globalAlpha = Math.max(0, q.life);
          ctx.fillStyle = '#fff';
          ctx.fillText(q.text, q.x, q.y);
        }
        ctx.globalAlpha = 1;
      },
      pointerdown(x, y) {
        target = { x, y };
      },
      pointermove(x, y) {
        target = { x, y };
      },
      key(k, down) {
        if (!down) return;
        const s = 60;
        if (k === 'ArrowLeft') target.x -= s;
        if (k === 'ArrowRight') target.x += s;
        if (k === 'ArrowUp') target.y -= s;
        if (k === 'ArrowDown') target.y += s;
      },
    };
  },
};
