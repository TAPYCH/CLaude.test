// «Хачапури с мамой» — five quick cooking stages: knead, roll, cheese, bake, egg.
import { roundRect } from './framework.js';

const STAGES = [
  { id: 'knead', name: 'Замеси тесто', hint: 'Быстро тапай по тесту!', time: 5 },
  { id: 'roll', name: 'Раскатай', hint: 'Останови скалку в зелёной зоне', time: 6 },
  { id: 'cheese', name: 'Сыр!', hint: 'Тапай, когда лодочка под сыром', time: 9 },
  { id: 'bake', name: 'В печь', hint: 'Достань, когда корочка станет золотой', time: 9 },
  { id: 'egg', name: 'Яйцо и масло', hint: 'Урони яйцо точно в центр', time: 6 },
];

const lerp = (a, b, t) => a + (b - a) * t;
function mix(c1, c2, t) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [a, b] = [p(c1), p(c2)];
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',')})`;
}
function crust(p) {
  if (p < 0.9) return mix('#f8e3b8', '#eaa24c', Math.max(0, p / 0.9));
  return mix('#eaa24c', '#6f3f1e', Math.min(1, (p - 0.9) / 0.55));
}

export default {
  id: 'khachapuri',
  title: 'Хачапури с мамой',
  icon: '🫓',
  scoreLabel: 'баллов',
  howto: 'Мамин рецепт аджарского хачапури: замеси, раскатай, положи сыр, испеки и добавь яйцо. Пять быстрых этапов — каждый оценивает мама!\n⭐ 55 · ⭐⭐ 72 · ⭐⭐⭐ 88',
  create(api) {
    const { ctx } = api;
    const level = api.opts.level || 1;
    const scores = [];
    let s = 0;
    let phase = 'title'; // title → play → verdict
    let pt = 0; // phase time
    let verdict = '';
    let verdictCol = '#3fcfae';

    // stage state
    let taps = 0;
    let squish = 0;
    let needle = 0;
    let zone = { c: 0.5, w: 0.16 };
    const cheese = [];
    let drops = 0;
    let hits = 0;
    let bake = 0;
    let egg = null;
    let landed = null;
    const sparks = [];

    const target = 26;
    const geo = () => {
      const bw = Math.min(api.W * 0.78, 420);
      return { cx: api.W / 2, cy: api.H * 0.6, bw, bh: bw * 0.42 };
    };
    const boatX = () => {
      const g = geo();
      return STAGES[s].id === 'cheese' && phase === 'play' ? g.cx + Math.sin(pt * (1.7 + level * 0.04)) * Math.min(api.W * 0.28, 150) : g.cx;
    };

    function begin(i) {
      s = i;
      phase = 'title';
      pt = 0;
      api.hint(STAGES[i].hint);
      if (STAGES[i].id === 'roll') zone = { c: 0.3 + Math.random() * 0.4, w: Math.min(0.24, 0.14 + level * 0.008) };
    }

    function score(v, msg) {
      v = Math.max(0, Math.min(100, Math.round(v)));
      scores.push(v);
      verdict = msg || (v >= 90 ? 'Идеально! 😍' : v >= 70 ? 'Хорошо! 👍' : v >= 45 ? 'Сойдёт 🙂' : 'Ой-ой… 😅');
      verdictCol = v >= 70 ? '#3fcfae' : v >= 45 ? '#ffb35e' : '#ff6f8a';
      phase = 'verdict';
      pt = 0;
      api.sfx(v >= 70 ? 'success' : v >= 45 ? 'pop' : 'bad');
      const g = geo();
      for (let k = 0; k < (v >= 70 ? 18 : 6); k++) sparks.push({ x: g.cx, y: g.cy - 40, vx: (Math.random() - 0.5) * 320, vy: -Math.random() * 300 - 80, life: 1, c: ['#ffc23d', '#ff6f9c', '#3fcfae'][k % 3] });
    }

    function tap(x, y) {
      if (phase !== 'play') return;
      const st = STAGES[s].id;
      const g = geo();
      if (st === 'knead') {
        taps++;
        squish = 1;
        api.sfx('tap');
        if (taps >= target) score(100);
      } else if (st === 'roll') {
        const d = Math.abs(needle - zone.c);
        score(d <= zone.w / 2 ? 100 - (d / (zone.w / 2)) * 22 : 78 - (d - zone.w / 2) * 330);
      } else if (st === 'cheese') {
        if (drops >= 6) return;
        drops++;
        cheese.push({ x: g.cx + (Math.random() - 0.5) * 10, y: g.cy - g.bh * 2.2, vy: 0, done: false, r: Math.random() * 6 });
        api.sfx('pop');
      } else if (st === 'bake') {
        const d = Math.abs(bake - 0.93);
        score(d <= 0.07 ? 100 : 100 - (d - 0.07) * 260, bake < 0.86 ? 'Бледновато 🙈' : bake > 1.0 ? 'Подгорело! 🔥' : null);
      } else if (st === 'egg') {
        if (egg && !egg.falling) {
          egg.falling = true;
          egg.vy = 0;
          api.sfx('whoosh');
        }
      }
      void x;
      void y;
    }

    function update(dt) {
      pt += dt;
      for (const p of sparks) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 700 * dt;
        p.life -= dt * 1.4;
      }
      for (let k = sparks.length - 1; k >= 0; k--) if (sparks[k].life <= 0) sparks.splice(k, 1);
      squish = Math.max(0, squish - dt * 6);
      if (phase === 'title') {
        if (pt > 1.1) {
          phase = 'play';
          pt = 0;
          if (STAGES[s].id === 'egg') egg = { x: geo().cx, y: geo().cy - geo().bh * 2, falling: false, vy: 0 };
        }
        return;
      }
      if (phase === 'verdict') {
        if (pt > 1.1) {
          if (s + 1 < STAGES.length) begin(s + 1);
          else finish();
        }
        return;
      }
      const st = STAGES[s];
      const g = geo();
      if (st.id === 'knead' && pt >= st.time) score((taps / target) * 100);
      if (st.id === 'roll') {
        needle = (Math.sin(pt * (2.4 + level * 0.05) - Math.PI / 2) + 1) / 2;
        if (pt >= st.time) score(0, 'Не успела! ⏰');
      }
      if (st.id === 'cheese') {
        const bx = boatX();
        for (const c of cheese) {
          if (c.done) continue;
          c.vy += 1500 * dt;
          c.y += c.vy * dt;
          if (c.y >= g.cy - g.bh * 0.15) {
            c.done = true;
            const off = c.x - bx;
            if (Math.abs(off) < g.bw * 0.3) {
              hits++;
              c.inside = off;
              api.sfx('catch');
            } else {
              c.miss = true;
              api.sfx('bad');
            }
          }
        }
        if ((drops >= 6 && cheese.every((c) => c.done)) || pt >= st.time) score((hits / 6) * 100, hits === 6 ? 'Сырная лодочка! 🧀' : null);
      }
      if (st.id === 'bake') {
        bake += dt * (0.22 + level * 0.004);
        if (bake >= 1.45) score(0, 'Сгорело! 🔥');
      }
      if (st.id === 'egg' && egg) {
        if (!egg.falling) egg.x = g.cx + Math.sin(pt * (2.2 + level * 0.05)) * Math.min(api.W * 0.3, 160);
        else {
          egg.vy += 1600 * dt;
          egg.y += egg.vy * dt;
          if (egg.y >= g.cy - g.bh * 0.1) {
            const d = Math.abs(egg.x - g.cx);
            landed = egg.x - g.cx;
            egg = null;
            api.sfx('splash');
            score(100 - (d / (g.bw * 0.32)) * 100, d < g.bw * 0.06 ? 'В самый центр! 🍳' : null);
          }
        }
        if (egg && !egg.falling && pt >= st.time) {
          egg.falling = true;
        }
      }
    }

    function finish() {
      const total = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const stars = total >= 88 ? 3 : total >= 72 ? 2 : total >= 55 ? 1 : 0;
      api.end({
        score: total,
        stars,
        text: ['Мама: «Ничего, в следующий раз получится!»', 'Мама: «Вкусно! Ещё немного практики»', 'Мама: «Ммм, совсем как у меня!»', 'Мама: «Лучше, чем у меня! Бабушка гордилась бы» 🥹'][stars],
      });
    }

    // ------------------------------------------------------------ drawing
    function bg() {
      const g = ctx.createLinearGradient(0, 0, 0, api.H);
      g.addColorStop(0, '#fff5e6');
      g.addColorStop(1, '#ffe2c4');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, api.W, api.H);
      ctx.strokeStyle = 'rgba(214,160,110,.18)';
      ctx.lineWidth = 2;
      const t = 46;
      for (let x = 0; x < api.W; x += t) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, api.H * 0.45);
        ctx.stroke();
      }
      for (let y = 0; y < api.H * 0.45; y += t) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(api.W, y);
        ctx.stroke();
      }
      // counter
      ctx.fillStyle = '#e9c398';
      ctx.fillRect(0, api.H * 0.45, api.W, api.H * 0.55);
      ctx.fillStyle = '#d9ad7c';
      ctx.fillRect(0, api.H * 0.45, api.W, 10);
      // board
      const { cx, cy, bw, bh } = geo();
      ctx.fillStyle = 'rgba(120,70,30,.18)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + bh * 0.75, bw * 0.62, bh * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c98f55';
      roundRect(ctx, cx - bw * 0.62, cy - bh * 0.95, bw * 1.24, bh * 1.75, 28);
      ctx.fill();
      ctx.fillStyle = '#d9a066';
      roundRect(ctx, cx - bw * 0.6, cy - bh * 0.95, bw * 1.2, bh * 1.65, 26);
      ctx.fill();
      ctx.strokeStyle = 'rgba(150,95,50,.25)';
      ctx.lineWidth = 2;
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.moveTo(cx - bw * 0.55, cy - bh * 0.7 + k * bh * 0.3);
        ctx.bezierCurveTo(cx - bw * 0.2, cy - bh * 0.6 + k * bh * 0.3, cx + bw * 0.2, cy - bh * 0.8 + k * bh * 0.3, cx + bw * 0.55, cy - bh * 0.7 + k * bh * 0.3);
        ctx.stroke();
      }
      // flour dust
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      for (let k = 0; k < 24; k++) {
        ctx.beginPath();
        ctx.arc(cx + Math.sin(k * 12.9) * bw * 0.5, cy + Math.cos(k * 7.7) * bh * 0.6, 2 + (k % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function boatPath(x, y, w, h) {
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y);
      ctx.bezierCurveTo(x - w * 0.32, y - h * 0.95, x + w * 0.32, y - h * 0.95, x + w / 2, y);
      ctx.bezierCurveTo(x + w * 0.32, y + h * 0.95, x - w * 0.32, y + h * 0.95, x - w / 2, y);
      ctx.closePath();
    }

    function drawBoat(x, cheeseLevel, p) {
      const { cy, bw, bh } = geo();
      const col = crust(p);
      ctx.fillStyle = 'rgba(110,60,25,.22)';
      boatPath(x, cy + 8, bw * 1.0, bh * 1.0);
      ctx.fill();
      ctx.fillStyle = col;
      boatPath(x, cy, bw, bh);
      ctx.fill();
      // twisted tips
      ctx.fillStyle = mix('#f8e3b8', '#c97a2c', Math.min(1, p));
      for (const d of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(x + d * bw * 0.49, cy, bw * 0.06, bh * 0.14, d * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // inner well
      ctx.fillStyle = cheeseLevel > 0 ? mix('#fff6d6', '#ffd768', Math.min(1, p * 0.9)) : mix('#fbebc9', '#f0c27a', Math.min(1, p * 0.5));
      boatPath(x, cy, bw * 0.74, bh * 0.56);
      ctx.fill();
      // shine
      ctx.strokeStyle = 'rgba(255,255,255,.45)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - bw * 0.3, cy - bh * 0.62);
      ctx.quadraticCurveTo(x, cy - bh * 0.78, x + bw * 0.25, cy - bh * 0.64);
      ctx.stroke();
    }

    function cheeseBlob(x, y, r, a = 1) {
      ctx.globalAlpha = a;
      ctx.fillStyle = '#fff3b0';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.arc(x + r * 0.7, y + r * 0.2, r * 0.75, 0, Math.PI * 2);
      ctx.arc(x - r * 0.6, y + r * 0.3, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,214,80,.6)';
      ctx.beginPath();
      ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function drawEgg(x, y, cooked = false) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(x, y, 34, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = cooked ? '#ffb020' : '#ffc23d';
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.beginPath();
      ctx.arc(x - 4, y - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    function meter(x, y, w, val, z) {
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      roundRect(ctx, x - 8, y - 8, w + 16, 34, 17);
      ctx.fill();
      ctx.fillStyle = '#f4e6ee';
      roundRect(ctx, x, y, w, 18, 9);
      ctx.fill();
      if (z) {
        ctx.fillStyle = '#7fe0c5';
        roundRect(ctx, x + (z.c - z.w / 2) * w, y, z.w * w, 18, 9);
        ctx.fill();
      }
      ctx.fillStyle = '#5b2f4f';
      roundRect(ctx, x + val * w - 4, y - 6, 8, 30, 4);
      ctx.fill();
    }

    function draw() {
      bg();
      const { cx, cy, bw, bh } = geo();
      const st = STAGES[s].id;
      const done = (id) => STAGES.findIndex((x) => x.id === id) < s || (STAGES[s].id === id && phase === 'verdict');
      if (st === 'knead') {
        const k = Math.min(1, taps / target);
        const r = bw * 0.22;
        const sq = squish * 0.18;
        ctx.fillStyle = 'rgba(110,60,25,.2)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.7, r * 1.15, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = mix('#f3dfb6', '#fbecd0', k);
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * sq, r * (1 + sq), r * (0.82 - sq), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.35, cy - r * 0.35, r * 0.25, r * 0.12, -0.4, 0, Math.PI * 2);
        ctx.fill();
        meter(cx - 110, api.H * 0.16, 220, k, null);
      } else if (st === 'roll') {
        ctx.fillStyle = '#f6e3bd';
        ctx.beginPath();
        ctx.ellipse(cx, cy, bw * (0.3 + (phase === 'verdict' ? 0.18 : needle * 0.18)), bh * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        // rolling pin
        const px = cx - bw * 0.45 + needle * bw * 0.9;
        ctx.save();
        ctx.translate(px, cy);
        ctx.fillStyle = '#b77a43';
        roundRect(ctx, -12, -bh * 0.9, 24, bh * 1.8, 12);
        ctx.fill();
        ctx.fillStyle = '#9a6233';
        roundRect(ctx, -7, -bh * 0.9 - 30, 14, 34, 7);
        ctx.fill();
        roundRect(ctx, -7, bh * 0.9 - 4, 14, 34, 7);
        ctx.fill();
        ctx.restore();
        meter(cx - 130, api.H * 0.16, 260, needle, zone);
      } else {
        const p = st === 'bake' ? bake : done('bake') ? 0.93 : 0;
        const bx = boatX();
        if (st === 'bake') {
          // oven glow
          const og = ctx.createRadialGradient(cx, cy, 20, cx, cy, bw);
          og.addColorStop(0, 'rgba(255,150,60,.35)');
          og.addColorStop(1, 'rgba(255,120,40,0)');
          ctx.fillStyle = og;
          ctx.fillRect(0, 0, api.W, api.H);
        }
        drawBoat(bx, hits, p);
        for (const c of cheese) if (c.inside != null) cheeseBlob(bx + c.inside * 0.6, cy - 4 + (c.r - 3) * 2, 15 + c.r * 0.8);
        if (landed != null) {
          drawEgg(cx + landed * 0.8, cy - 2, true);
          ctx.fillStyle = '#fff8d0';
          roundRect(ctx, cx + landed * 0.8 + 22, cy - 22, 22, 18, 4);
          ctx.fill();
        }
        if (st === 'cheese') {
          // cheese grater at top
          ctx.fillStyle = '#c9ced8';
          roundRect(ctx, cx - 32, cy - bh * 2.6, 64, 46, 10);
          ctx.fill();
          ctx.fillStyle = '#9aa2b3';
          for (let k = 0; k < 6; k++) ctx.fillRect(cx - 24 + (k % 3) * 18, cy - bh * 2.6 + 10 + Math.floor(k / 3) * 16, 10, 4);
          for (const c of cheese) if (!c.done || c.miss) cheeseBlob(c.x, c.y, 14, c.miss ? 0.5 : 1);
          ctx.font = '900 16px Nunito, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#7d6078';
          ctx.fillText(`🧀 ${6 - drops} осталось`, cx, cy + bh * 1.35);
        }
        if (st === 'bake') {
          meter(cx - 130, api.H * 0.16, 260, Math.min(1, bake / 1.45), { c: 0.93 / 1.45, w: 0.14 / 1.45 });
          ctx.font = '900 15px Nunito, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#7d6078';
          ctx.fillText(phase === 'play' ? 'Тапни, чтобы достать!' : '', cx, api.H * 0.16 + 52);
        }
        if (st === 'egg' && egg) drawEgg(egg.x, egg.y);
        if (st === 'egg' && phase === 'play' && egg && !egg.falling) {
          ctx.strokeStyle = 'rgba(91,47,79,.25)';
          ctx.setLineDash([6, 8]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy - bh * 1.6);
          ctx.lineTo(cx, cy - 10);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      // stage dots
      const dotsY = api.H - 86;
      STAGES.forEach((x, k) => {
        ctx.fillStyle = k < scores.length ? (scores[k] >= 70 ? '#3fcfae' : scores[k] >= 45 ? '#ffb35e' : '#ff6f8a') : k === s ? '#ff6f9c' : 'rgba(125,96,120,.25)';
        ctx.beginPath();
        ctx.arc(api.W / 2 + (k - 2) * 26, dotsY, k === s ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();
      });
      for (const p of sparks) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // titles
      if (phase === 'title' || phase === 'verdict') {
        const a = phase === 'title' ? Math.min(1, pt * 4, (1.1 - pt) * 4) : Math.min(1, pt * 5, (1.1 - pt) * 4);
        ctx.globalAlpha = Math.max(0, a);
        ctx.textAlign = 'center';
        ctx.font = `900 ${Math.min(40, api.W * 0.09)}px Nunito, sans-serif`;
        const txt = phase === 'title' ? `${s + 1}. ${STAGES[s].name}` : verdict;
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#fff';
        ctx.strokeText(txt, api.W / 2, api.H * 0.3);
        ctx.fillStyle = phase === 'title' ? '#ff6f9c' : verdictCol;
        ctx.fillText(txt, api.W / 2, api.H * 0.3);
        ctx.globalAlpha = 1;
      }
    }

    return {
      start() {
        begin(0);
      },
      update(dt) {
        update(dt);
        const st = STAGES[s].id;
        const left = phase === 'play' && st !== 'bake' && st !== 'cheese' ? Math.max(0, Math.ceil(STAGES[s].time - pt)) : null;
        api.setStats([`🫓 ${s + 1}/${STAGES.length}`, `⭐ ${scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : '—'}`, ...(left != null ? [`⏱ ${left}`] : [])]);
      },
      draw,
      pointerdown: tap,
      key(k, down) {
        if (down && (k === ' ' || k === 'Enter')) tap(0, 0);
      },
    };
  },
};
