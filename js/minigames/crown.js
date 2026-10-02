// «Идеальная коронка» — dental technician minigame.
// 1) shade matching (VITA scale) → 2) carve wax to the outline → 3) polish to a shine.
import { roundRect, starsFor } from './framework.js';

const SHADES = [
  { id: 'A1', c: '#f6eedc' },
  { id: 'A2', c: '#efe1c3' },
  { id: 'A3', c: '#e6d0a6' },
  { id: 'B1', c: '#f8f3e6' },
  { id: 'B2', c: '#eee0bb' },
  { id: 'C1', c: '#e6e0d0' },
  { id: 'C2', c: '#dad0b8' },
  { id: 'D2', c: '#e3d6c4' },
];

// Tooth outlines in a unit box (-1..1), front view of the crown.
const SHAPES = {
  incisor: { name: 'Резец', path: (p) => { p.moveTo(-0.62, -0.9); p.bezierCurveTo(-0.2, -1.02, 0.2, -1.02, 0.62, -0.9); p.bezierCurveTo(0.74, -0.3, 0.7, 0.4, 0.5, 0.82); p.bezierCurveTo(0.3, 1.02, -0.3, 1.02, -0.5, 0.82); p.bezierCurveTo(-0.7, 0.4, -0.74, -0.3, -0.62, -0.9); } },
  canine: { name: 'Клык', path: (p) => { p.moveTo(-0.55, -0.9); p.bezierCurveTo(-0.2, -1.0, 0.2, -1.0, 0.55, -0.9); p.bezierCurveTo(0.78, -0.2, 0.62, 0.45, 0.3, 0.75); p.lineTo(0, 1.0); p.lineTo(-0.3, 0.75); p.bezierCurveTo(-0.62, 0.45, -0.78, -0.2, -0.55, -0.9); } },
  premolar: { name: 'Премоляр', path: (p) => { p.moveTo(-0.72, -0.7); p.bezierCurveTo(-0.4, -1.0, 0.4, -1.0, 0.72, -0.7); p.bezierCurveTo(0.95, -0.2, 0.86, 0.5, 0.5, 0.78); p.quadraticCurveTo(0.25, 1.0, 0, 0.82); p.quadraticCurveTo(-0.25, 1.0, -0.5, 0.78); p.bezierCurveTo(-0.86, 0.5, -0.95, -0.2, -0.72, -0.7); } },
  molar: { name: 'Моляр', path: (p) => { p.moveTo(-0.85, -0.6); p.bezierCurveTo(-0.5, -0.95, 0.5, -0.95, 0.85, -0.6); p.bezierCurveTo(1.02, -0.1, 0.95, 0.5, 0.7, 0.75); p.quadraticCurveTo(0.5, 1.0, 0.3, 0.78); p.quadraticCurveTo(0.15, 0.98, 0, 0.8); p.quadraticCurveTo(-0.15, 0.98, -0.3, 0.78); p.quadraticCurveTo(-0.5, 1.0, -0.7, 0.75); p.bezierCurveTo(-0.95, 0.5, -1.02, -0.1, -0.85, -0.6); } },
};

export default {
  id: 'crown',
  title: 'Идеальная коронка',
  icon: '🦷',
  scoreLabel: 'баллов качества',
  noCountdown: true,
  howto: (mode) =>
    ({ exam: 'ЭКЗАМЕН! Нужно 3 звезды.\n\n', olympiad: 'ОЛИМПИАДА! Строгое жюри и меньше времени — нужна идеальная работа.\n\n', orders: 'Заказ клиента: меньше времени, оплата зависит от качества.\n\n', lab: 'Заказ в «Lana Dental». Оборудование помогает: фрезер даёт +4 с, микроскоп — точность.\n\n' }[mode] || '') +
    '1. Подбери оттенок по шкале VITA.\n2. Срежь лишний воск по контуру зуба — води пальцем.\n3. Отполируй коронку до блеска!',
  create(api) {
    const { ctx } = api;
    const mode = api.mode;
    const shapeKeys = Object.keys(SHAPES);
    const shapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
    const shape = SHAPES[shapeKey];
    let phase = 'shade';
    const target = SHADES[Math.floor(Math.random() * SHADES.length)];
    const options = shuffle([target, ...shuffle(SHADES.filter((s) => s !== target)).slice(0, 3)]);
    let shadeOk = null;
    let shadePick = null;
    const lab = api.opts.lab || [];
    // harder modes give less time; a CAD/CAM mill in Lana's own lab buys some back
    let carveTime = { exam: 22, olympiad: 20, orders: 24, lab: 23 }[mode] || 26;
    if (mode === 'lab' && lab.includes('mill')) carveTime += 4;
    const precision = mode === 'lab' && lab.includes('microscope') ? 0.42 : 0.45;
    const thresholds = mode === 'olympiad' ? [45, 72, 88] : [40, 66, 84];
    let polish = 0;
    let polishTime = 9;
    let iou = 0;
    let t = 0;
    let lastIou = 0;
    let drag = false;
    let sparkles = [];
    let lastPt = null;
    // layout
    let cx = 0, cy = 0, R = 100;
    const wax = document.createElement('canvas');
    const wctx = wax.getContext('2d', { willReadFrequently: true });
    let samples = [];
    let doneBtn = null;

    function layout() {
      cx = api.W / 2;
      cy = api.H * 0.5;
      R = Math.min(api.W * 0.36, api.H * 0.28);
    }

    function toothPath(c, scale = 1, ox = cx, oy = cy) {
      c.beginPath();
      const p = {
        moveTo: (x, y) => c.moveTo(ox + x * R * scale, oy + y * R * scale),
        lineTo: (x, y) => c.lineTo(ox + x * R * scale, oy + y * R * scale),
        bezierCurveTo: (a, b, d, e, f, g) => c.bezierCurveTo(ox + a * R * scale, oy + b * R * scale, ox + d * R * scale, oy + e * R * scale, ox + f * R * scale, oy + g * R * scale),
        quadraticCurveTo: (a, b, d, e) => c.quadraticCurveTo(ox + a * R * scale, oy + b * R * scale, ox + d * R * scale, oy + e * R * scale),
      };
      shape.path(p);
      c.closePath();
    }

    function initWax() {
      wax.width = Math.round(api.W * api.dpr);
      wax.height = Math.round(api.H * api.dpr);
      wctx.setTransform(api.dpr, 0, 0, api.dpr, 0, 0);
      const pts = [];
      const n = 12;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = R * (1.36 + Math.sin(i * 2.3) * 0.07 + Math.cos(i * 1.7) * 0.05);
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.08]);
      }
      wctx.beginPath();
      const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      let m0 = mid(pts[n - 1], pts[0]);
      wctx.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) {
        const m = mid(pts[i], pts[(i + 1) % n]);
        wctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
      }
      wctx.closePath();
      const wg = wctx.createRadialGradient(cx - R * 0.5, cy - R * 0.6, R * 0.1, cx, cy, R * 1.5);
      wg.addColorStop(0, '#ffd98a');
      wg.addColorStop(0.5, '#f0b450');
      wg.addColorStop(1, '#d9952e');
      wctx.fillStyle = wg;
      wctx.fill();
      wctx.fillStyle = 'rgba(255,255,255,.18)';
      for (let i = 0; i < 18; i++) {
        wctx.beginPath();
        wctx.arc(cx + Math.cos(i * 2.4) * R * (0.3 + (i % 5) * 0.2), cy + Math.sin(i * 1.9) * R * (0.3 + (i % 4) * 0.22), 3 + (i % 3) * 2, 0, Math.PI * 2);
        wctx.fill();
      }
      // sample grid for IoU
      samples = [];
      const step = R / 16;
      const test = document.createElement('canvas').getContext('2d');
      toothPath(test);
      for (let y = cy - R * 1.6; y <= cy + R * 1.6; y += step)
        for (let x = cx - R * 1.6; x <= cx + R * 1.6; x += step) samples.push({ x, y, inT: test.isPointInPath(x, y) });
    }

    function measure() {
      const img = wctx.getImageData(0, 0, wax.width, wax.height).data;
      let inter = 0, uni = 0;
      for (const s of samples) {
        const px = Math.round(s.x * api.dpr);
        const py = Math.round(s.y * api.dpr);
        const a = img[(py * wax.width + px) * 4 + 3] > 40;
        if (a && s.inT) inter++;
        if (a || s.inT) uni++;
      }
      return uni ? inter / uni : 0;
    }

    function carve(x, y) {
      const r = R * 0.1;
      wctx.save();
      wctx.globalCompositeOperation = 'destination-out';
      wctx.beginPath();
      if (lastPt) {
        wctx.lineWidth = r * 2;
        wctx.lineCap = 'round';
        wctx.moveTo(lastPt.x, lastPt.y);
        wctx.lineTo(x, y);
        wctx.stroke();
      } else {
        wctx.arc(x, y, r, 0, Math.PI * 2);
        wctx.fill();
      }
      wctx.restore();
      lastPt = { x, y };
      if (Math.random() < 0.5) {
        sparkles.push({ x, y, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 120 - 40, life: 0.6, c: '#e8b04a', r: 3 + Math.random() * 3 });
        api.sfx('scrape');
      }
    }

    function showShadeUI() {
      api.hint('Какой оттенок подходит? Сравни с соседним зубом');
      const box = document.createElement('div');
      box.className = 'crown-shades';
      box.style.cssText = 'position:absolute;left:0;right:0;bottom:calc(70px + var(--safe-b));display:flex;justify-content:center;gap:10px;z-index:3;padding:0 10px';
      for (const s of options) {
        const b = document.createElement('button');
        b.style.cssText = `width:68px;height:96px;border-radius:14px 14px 30px 30px;background:linear-gradient(180deg,#fff,${s.c} 40%,${s.c});box-shadow:0 6px 16px rgba(0,0,0,.25);font-weight:900;font-size:16px;color:#7a6a50;display:flex;align-items:flex-end;justify-content:center;padding-bottom:10px;border:3px solid #fff`;
        b.textContent = s.id;
        b.addEventListener('click', () => {
          if (shadePick) return; // one choice only (double taps used to start carving twice)
          shadePick = s;
          shadeOk = s === target;
          api.sfx(shadeOk ? 'success' : 'bad');
          box.querySelectorAll('button').forEach((x) => (x.style.opacity = x === b ? '1' : '.35'));
          b.style.borderColor = shadeOk ? '#3fcfae' : '#ff5a6e';
          api.hint(shadeOk ? `Точно! Оттенок ${target.id} ✨` : `Почти… нужен был ${target.id}`);
          setTimeout(() => {
            box.remove();
            startCarve();
          }, 1100);
        });
        box.appendChild(b);
      }
      api.root.appendChild(box);
    }

    function startCarve() {
      if (phase !== 'shade') return;
      phase = 'carve';
      t = 0;
      initWax();
      api.hint('Води пальцем — срезай воск вне пунктира');
      doneBtn = document.createElement('button');
      doneBtn.className = 'btn mint';
      doneBtn.textContent = 'Готово ✓';
      doneBtn.style.cssText = 'position:absolute;right:16px;bottom:calc(70px + var(--safe-b));z-index:3';
      doneBtn.addEventListener('click', () => startPolish());
      api.root.appendChild(doneBtn);
    }

    function startPolish() {
      if (phase !== 'carve') return;
      iou = measure();
      phase = 'polish';
      t = 0;
      if (doneBtn) doneBtn.remove();
      api.sfx('pop');
      api.hint('Натирай коронку до блеска! ✨');
    }

    function finish() {
      phase = 'end';
      const shadePts = shadeOk ? 20 : 6;
      const carvePts = Math.max(0, Math.min(1, (iou - precision) / (0.9 - precision))) * 60;
      const polishPts = (polish / 100) * 20;
      const score = Math.round(shadePts + carvePts + polishPts);
      const stars = starsFor(score, thresholds);
      const fb = [];
      fb.push(shadeOk ? `Оттенок ${target.id} подобран идеально.` : `Оттенок промах: нужен был ${target.id}.`);
      fb.push(`Точность формы: ${Math.round(iou * 100)}%.`);
      fb.push(`Блеск: ${Math.round(polish)}%.`);
      setTimeout(() => api.end({ score, stars, text: `${shape.name}. ${fb.join(' ')}` }), 500);
    }

    function drawBg() {
      const g = ctx.createLinearGradient(0, 0, 0, api.H);
      g.addColorStop(0, '#e9f8f4');
      g.addColorStop(1, '#cdeee6');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, api.W, api.H);
      // work mat
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, api.W * 0.06, api.H * 0.16, api.W * 0.88, api.H * 0.7, 30);
      ctx.fill();
      ctx.strokeStyle = '#d5ece5';
      ctx.lineWidth = 4;
      ctx.stroke();
      // grid
      ctx.strokeStyle = 'rgba(63,207,174,.10)';
      ctx.lineWidth = 1;
      for (let x = api.W * 0.06; x < api.W * 0.94; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, api.H * 0.16);
        ctx.lineTo(x, api.H * 0.86);
        ctx.stroke();
      }
    }

    return {
      resize() {
        layout();
      },
      start() {
        layout();
        showShadeUI();
      },
      update(dt) {
        t += dt;
        for (const s of sparkles) {
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.vy += 300 * dt;
          s.life -= dt;
        }
        sparkles = sparkles.filter((s) => s.life > 0);
        if (phase === 'carve') {
          if (t - lastIou > 0.25) {
            lastIou = t;
            iou = measure();
          }
          if (t >= carveTime) startPolish();
        } else if (phase === 'polish') {
          if (t >= polishTime || polish >= 100) finish();
        }
        const left = phase === 'carve' ? Math.ceil(carveTime - t) : phase === 'polish' ? Math.ceil(polishTime - t) : null;
        const stats = [`${{ exam: '📜 Экзамен', olympiad: '🏅 Олимпиада', orders: '💼 Заказ', lab: '🦷 Lana Dental' }[mode] || '🦷 ' + shape.name}`];
        if (phase === 'carve') stats.push(`🎯 ${Math.round(iou * 100)}%`);
        if (phase === 'polish') stats.push(`✨ ${Math.round(polish)}%`);
        if (left != null) stats.push(`⏱ ${Math.max(0, left)}`);
        api.setStats(stats);
      },
      draw() {
        drawBg();
        if (phase === 'shade') {
          const sc = 0.55;
          const y = cy - R * 0.1;
          const gap = R * 0.82;
          // upper gum with a scalloped edge
          ctx.fillStyle = '#f59cb0';
          ctx.beginPath();
          ctx.moveTo(cx - gap * 2.2, y - R * 1.15);
          ctx.lineTo(cx + gap * 2.2, y - R * 1.15);
          ctx.lineTo(cx + gap * 2.2, y - R * 0.5);
          for (let k = 2; k >= -2; k--) ctx.quadraticCurveTo(cx + (k + 0.5) * gap, y - R * 0.2, cx + (k - 0.5) * gap, y - R * 0.5);
          ctx.closePath();
          ctx.fill();
          for (const dx of [-2, 2]) {
            toothPath(ctx, sc, cx + dx * gap, y);
            ctx.fillStyle = shade(target.c, -6);
            ctx.fill();
          }
          for (const dx of [-1, 1]) {
            toothPath(ctx, sc, cx + dx * gap, y);
            const g = ctx.createLinearGradient(0, y - R * 0.6, 0, y + R * 0.6);
            g.addColorStop(0, '#ffffff');
            g.addColorStop(0.35, target.c);
            g.addColorStop(1, target.c);
            ctx.fillStyle = g;
            ctx.fill();
            ctx.strokeStyle = shade(target.c, -40);
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.setLineDash([8, 8]);
          ctx.strokeStyle = '#ff6f9c';
          ctx.lineWidth = 3;
          toothPath(ctx, sc, cx, y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#ff6f9c';
          ctx.font = '900 34px Nunito, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('?', cx, y + 12);
          ctx.fillStyle = '#7d6078';
          ctx.font = '900 18px Nunito, sans-serif';
          ctx.fillText('Пациент ждёт коронку', cx, y - R * 1.35);
          ctx.font = '700 14px Nunito, sans-serif';
          ctx.fillText('Подбери цвет под соседние зубы', cx, y - R * 1.35 + 22);
        }
        if (phase === 'carve' || phase === 'polish' || phase === 'end') {
          if (phase === 'carve') {
            ctx.drawImage(wax, 0, 0, api.W, api.H);
            // wax texture shading
            ctx.setLineDash([10, 8]);
            ctx.strokeStyle = '#ff6f9c';
            ctx.lineWidth = 3;
            toothPath(ctx);
            ctx.stroke();
            ctx.setLineDash([]);
          } else {
            // the result: wax shape converted to ceramic in the picked shade
            ctx.save();
            ctx.drawImage(wax, 0, 0, api.W, api.H);
            ctx.globalCompositeOperation = 'source-atop';
            const fill = shadePick ? shadePick.c : target.c;
            const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.1, cx, cy, R * 1.3);
            g.addColorStop(0, '#ffffff');
            g.addColorStop(0.55, fill);
            g.addColorStop(1, shade(fill, -22));
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, api.W, api.H);
            ctx.restore();
            const gloss = Math.min(0.9, polish / 100);
            ctx.save();
            ctx.globalAlpha = gloss;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(cx - R * 0.3, cy - R * 0.35, R * 0.16, R * 0.45, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.setLineDash([6, 8]);
            ctx.strokeStyle = 'rgba(255,111,156,.5)';
            ctx.lineWidth = 2;
            toothPath(ctx);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        for (const s of sparkles) {
          ctx.globalAlpha = Math.max(0, s.life / 0.6);
          ctx.fillStyle = s.c;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (phase === 'polish') {
          const w = api.W * 0.6;
          const x = (api.W - w) / 2;
          const y = api.H * 0.2;
          ctx.fillStyle = '#eef7f4';
          roundRect(ctx, x, y, w, 16, 8);
          ctx.fill();
          ctx.fillStyle = '#ffc23d';
          roundRect(ctx, x, y, (w * polish) / 100, 16, 8);
          ctx.fill();
        }
      },
      pointerdown(x, y) {
        drag = true;
        lastPt = null;
        if (phase === 'carve') carve(x, y);
      },
      pointermove(x, y, e) {
        if (!drag && e && e.buttons & 1) {
          drag = true;
          lastPt = null;
        }
        if (!drag) return;
        if (phase === 'carve') carve(x, y);
        else if (phase === 'polish') {
          const inside = Math.hypot(x - cx, y - cy) < R * 1.1;
          if (inside && lastPt) {
            polish = Math.min(100, polish + Math.hypot(x - lastPt.x, y - lastPt.y) * 0.09);
            if (Math.random() < 0.3) {
              sparkles.push({ x, y, vx: (Math.random() - 0.5) * 100, vy: -60 - Math.random() * 60, life: 0.5, c: '#fff6b0', r: 2 + Math.random() * 3 });
              api.sfx('shine');
            }
          }
          lastPt = { x, y };
        }
      },
      pointerup() {
        drag = false;
        lastPt = null;
      },
      destroy() {
        if (doneBtn) doneBtn.remove();
      },
    };
  },
};

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}
