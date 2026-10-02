// «Танцы на набережной» — 4-lane rhythm game with its own beat; Lana dances along.
import { svgImage, roundRect } from './framework.js';
import { renderLana } from '../art/character.js';
import { S } from '../core/state.js';
import { playMusic, playNote, sfx } from '../audio.js';

const BPM = 116;
const BEAT = 60 / BPM;
const LANES = [
  { icon: '💖', col: '#ff6f9c', key: ['ArrowLeft', 'd', 'в'], note: 72 },
  { icon: '⭐', col: '#ffc23d', key: ['ArrowDown', 'f', 'а'], note: 76 },
  { icon: '🌸', col: '#9a7bff', key: ['ArrowUp', 'j', 'о'], note: 79 },
  { icon: '🎵', col: '#3fcfae', key: ['ArrowRight', 'k', 'л'], note: 84 },
];
const POSES = [
  { armL: 140, armR: -20, legL: 10 },
  { armL: 70, armR: -70, legL: -12, legR: 12 },
  { armL: 155, armR: -155 },
  { armL: 20, armR: -140, legR: -10 },
];
const BASS = [48, 45, 41, 43]; // C A F G

/** Builds the chart: list of {t, lane}. Density grows through the song and with level. */
function chart(level) {
  const notes = [];
  const bars = 16;
  let lane = 1;
  const step = () => {
    const r = Math.random();
    lane = r < 0.4 ? (lane + 1) % 4 : r < 0.8 ? (lane + 3) % 4 : Math.floor(Math.random() * 4);
    return lane;
  };
  for (let b = 1; b < bars; b++) {
    const phase = b < 5 ? 0 : b < 9 ? 1 : b < 13 ? 2 : 3;
    const dens = Math.min(3, phase + (level >= 6 ? 1 : 0));
    for (let e = 0; e < 8; e++) {
      const t = (b * 4 + e / 2) * BEAT;
      const onBeat = e % 2 === 0;
      let put = false;
      if (dens === 0) put = e === 0 || e === 4 || (e === 2 && Math.random() < 0.5);
      else if (dens === 1) put = onBeat || (e === 7 && Math.random() < 0.5);
      else if (dens === 2) put = onBeat || Math.random() < 0.35;
      else put = onBeat || Math.random() < 0.55;
      if (!put) continue;
      const l = step();
      notes.push({ t, lane: l });
      if (dens >= 2 && onBeat && e === 0 && Math.random() < 0.5) notes.push({ t, lane: (l + 2) % 4 });
    }
  }
  return { notes, end: bars * 4 * BEAT + 1.2 };
}

export default {
  id: 'dance',
  title: 'Танцы на набережной',
  icon: '💃',
  scoreLabel: 'очков',
  noCountdown: true,
  howto: () =>
    `Сердечки, звёздочки и цветы летят вниз. Тапай по своей дорожке, когда значок касается кольца!${window.matchMedia('(pointer: coarse)').matches ? '' : '\nНа компьютере: ← ↓ ↑ → или D F J K.'}\n⭐ 60% точности · ⭐⭐ 78% · ⭐⭐⭐ 90%`,
  create(api) {
    const { ctx } = api;
    const level = api.opts.level || 1;
    const { notes, end } = chart(level);
    const approach = Math.max(1.15, 1.75 - level * 0.05);
    const frames = POSES.map((p) => svgImage(renderLana({ outfit: S.outfit, expr: 'excited', pose: p })));
    const groove = [
      svgImage(renderLana({ outfit: S.outfit, expr: 'happy', pose: { armL: 34, armR: -8, legL: 6 } })),
      svgImage(renderLana({ outfit: S.outfit, expr: 'happy', pose: { armL: 8, armR: -34, legR: -6 } })),
    ];
    let t = -BEAT * 2; // two beats of lead-in
    let lastBeat = -99;
    let score = 0;
    let combo = 0;
    let maxCombo = 0;
    let pts = 0;
    let judged = 0;
    let pose = -1;
    let poseT = 0;
    const pops = [];
    const glow = [0, 0, 0, 0];
    const lights = Array.from({ length: 14 }, (_, i) => ({ i, c: ['#ff6f9c', '#ffc23d', '#9a7bff', '#3fcfae'][i % 4] }));

    const L = () => {
      const land = api.W > api.H * 1.15;
      if (land) {
        const w = Math.min(api.W * 0.56, 520);
        return { x: api.W - w - 24, w, top: 70, hit: api.H - 64, land, lana: { x: (api.W - w - 24) / 2, y: api.H * 0.52, h: api.H * 0.82 } };
      }
      const w = Math.min(api.W - 24, 480);
      return { x: (api.W - w) / 2, w, top: api.H * 0.38, hit: api.H - 96, land, lana: { x: api.W / 2, y: api.H * 0.22, h: api.H * 0.32 } };
    };

    function judge(lane) {
      const lay = L();
      glow[lane] = 1;
      // nearest unjudged note in this lane
      let best = null;
      for (const n of notes) {
        if (n.done || n.lane !== lane) continue;
        const d = Math.abs(n.t - t);
        if (d < 0.22 && (!best || d < Math.abs(best.t - t))) best = n;
      }
      const x = lay.x + (lane + 0.5) * (lay.w / 4);
      if (!best) {
        // stray tap — small penalty to combo only
        combo = 0;
        return;
      }
      best.done = true;
      const d = Math.abs(best.t - t);
      let p;
      let label;
      let col;
      if (d < 0.07) [p, label, col] = [100, 'Супер!', '#ff6f9c'];
      else if (d < 0.13) [p, label, col] = [70, 'Хорошо', '#3fcfae'];
      else [p, label, col] = [35, 'Почти', '#ffb35e'];
      combo++;
      maxCombo = Math.max(maxCombo, combo);
      pts += p;
      judged++;
      score += Math.round(p * (1 + Math.min(combo, 30) / 15));
      pops.push({ x, y: lay.hit - 50, text: label, col, life: 1 });
      playNote(LANES[lane].note + (p === 100 ? 12 : 0), { dur: 0.2, vol: 0.16 });
      pose = lane;
      poseT = 0.35;
    }

    function miss(n) {
      n.done = true;
      judged++;
      combo = 0;
      const lay = L();
      pops.push({ x: lay.x + (n.lane + 0.5) * (lay.w / 4), y: lay.hit - 50, text: 'Мимо', col: '#a99aae', life: 1 });
    }

    function finish() {
      const acc = notes.length ? pts / (notes.length * 100) : 0;
      const pct = Math.round(acc * 100);
      const stars = pct >= 90 ? 3 : pct >= 78 ? 2 : pct >= 60 ? 1 : 0;
      api.end({ score, stars, text: `Точность ${pct}% · лучшая серия ${maxCombo}` });
    }

    function drawBg() {
      const g = ctx.createLinearGradient(0, 0, 0, api.H);
      g.addColorStop(0, '#2a1f5c');
      g.addColorStop(0.55, '#6b3f8f');
      g.addColorStop(1, '#ff8fab');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, api.W, api.H);
      // sea + moon path
      ctx.fillStyle = 'rgba(30,40,110,.55)';
      ctx.fillRect(0, api.H * 0.5, api.W, api.H * 0.18);
      ctx.fillStyle = 'rgba(255,240,200,.35)';
      for (let k = 0; k < 6; k++) roundRect(ctx, api.W * 0.7 - 20 + Math.sin(t * 2 + k) * 8, api.H * 0.52 + k * 9, 40 - k * 4, 3, 2), ctx.fill();
      ctx.fillStyle = '#fff6d8';
      ctx.beginPath();
      ctx.arc(api.W * 0.82, api.H * 0.1, 22, 0, Math.PI * 2);
      ctx.fill();
      // promenade floor
      ctx.fillStyle = '#3b2a55';
      ctx.fillRect(0, api.H * 0.68, api.W, api.H * 0.32);
      // string lights
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.quadraticCurveTo(api.W / 2, 90, api.W, 30);
      ctx.stroke();
      const beatPhase = ((t % BEAT) + BEAT) % BEAT / BEAT;
      for (const l of lights) {
        const u = (l.i + 0.5) / lights.length;
        const x = u * api.W;
        const y = 30 + 4 * 60 * u * (1 - u) + 6;
        const on = (Math.floor(t / BEAT) + l.i) % 2 === 0;
        ctx.fillStyle = l.c;
        ctx.globalAlpha = on ? 1 - beatPhase * 0.5 : 0.45;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = on ? 0.25 * (1 - beatPhase) : 0;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawLana(lay) {
      const img = pose >= 0 && poseT > 0 ? frames[pose] : groove[Math.abs(Math.floor(t / BEAT)) % 2];
      if (!img.complete) return;
      const h = lay.lana.h;
      const w = (h * 200) / 450;
      const bounce = Math.abs(Math.sin((t / BEAT) * Math.PI)) * h * 0.025;
      const sway = Math.sin((t / BEAT) * Math.PI) * 0.05;
      ctx.save();
      ctx.translate(lay.lana.x, lay.lana.y + h / 2 - bounce);
      ctx.rotate(sway);
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.32, h * 0.03, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(img, -w / 2, -h, w, h);
      ctx.restore();
    }

    function drawLanes(lay) {
      const lw = lay.w / 4;
      ctx.fillStyle = 'rgba(24,12,48,.55)';
      roundRect(ctx, lay.x, lay.top - 10, lay.w, lay.hit - lay.top + 60, 24);
      ctx.fill();
      for (let k = 0; k < 4; k++) {
        const x = lay.x + k * lw;
        if (glow[k] > 0) {
          const gg = ctx.createLinearGradient(0, lay.top, 0, lay.hit + 40);
          gg.addColorStop(0, 'rgba(255,255,255,0)');
          gg.addColorStop(1, LANES[k].col);
          ctx.globalAlpha = glow[k] * 0.5;
          ctx.fillStyle = gg;
          ctx.fillRect(x + 4, lay.top, lw - 8, lay.hit - lay.top + 40);
          ctx.globalAlpha = 1;
        }
        if (k) {
          ctx.strokeStyle = 'rgba(255,255,255,.12)';
          ctx.beginPath();
          ctx.moveTo(x, lay.top);
          ctx.lineTo(x, lay.hit + 40);
          ctx.stroke();
        }
        // hit ring
        const r = Math.min(30, lw * 0.36);
        ctx.strokeStyle = LANES[k].col;
        ctx.lineWidth = 4 + glow[k] * 4;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(x + lw / 2, lay.hit, r + glow[k] * 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // notes
      const r = Math.min(28, lw * 0.34);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.round(r * 1.05)}px serif`;
      for (const n of notes) {
        if (n.done) continue;
        const u = 1 - (n.t - t) / approach;
        if (u < -0.02 || u > 1.25) continue;
        const y = lay.top + u * (lay.hit - lay.top);
        const x = lay.x + (n.lane + 0.5) * lw;
        ctx.fillStyle = LANES[n.lane].col;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, r - 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(LANES[n.lane].icon, x, y + 1);
      }
      ctx.textBaseline = 'alphabetic';
      for (const p of pops) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.font = '900 20px Nunito, sans-serif';
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(30,10,40,.6)';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.col;
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.globalAlpha = 1;
      if (combo >= 5) {
        ctx.font = '900 18px Nunito, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${combo} комбо!`, lay.x + lay.w / 2, lay.top + 20);
      }
      if (t < 0) {
        ctx.font = '900 34px Nunito, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(t < -BEAT ? 'Приготовься…' : 'Танцуем!', lay.x + lay.w / 2, (lay.top + lay.hit) / 2);
      }
    }

    return {
      start() {
        playMusic(null);
      },
      update(dt) {
        t += dt;
        // own beat: kick on beats, hats on off-beats, bass every bar
        const bi = Math.floor(t / (BEAT / 2));
        if (bi !== lastBeat && t > -BEAT * 2 + 0.01 && t < end - 1) {
          lastBeat = bi;
          if (bi % 2 === 0) {
            sfx('kick');
            if (bi >= 0 && bi % 8 === 0) playNote(BASS[Math.floor(bi / 8) % 4], { dur: BEAT * 3.5, vol: 0.2, type: 'sine' });
            if (bi % 4 === 2) sfx('snare');
          } else sfx('hat');
        }
        for (const n of notes) if (!n.done && t - n.t > 0.2) miss(n);
        for (let k = 0; k < 4; k++) glow[k] = Math.max(0, glow[k] - dt * 4);
        poseT -= dt;
        for (const p of pops) {
          p.y -= dt * 40;
          p.life -= dt * 1.6;
        }
        for (let k = pops.length - 1; k >= 0; k--) if (pops[k].life <= 0) pops.splice(k, 1);
        const acc = judged ? Math.round((pts / (judged * 100)) * 100) : 100;
        api.setStats([`💃 ${score}`, `🎯 ${acc}%`, `🔥 ${combo}`]);
        if (t >= end) finish();
      },
      draw() {
        const lay = L();
        drawBg();
        drawLana(lay);
        drawLanes(lay);
      },
      pointerdown(x) {
        const lay = L();
        const lane = Math.floor((x - lay.x) / (lay.w / 4));
        if (lane >= 0 && lane < 4) judge(lane);
      },
      key(k, down) {
        if (!down) return;
        const lane = LANES.findIndex((l) => l.key.includes(k) || l.key.includes(k.toLowerCase()));
        if (lane >= 0) judge(lane);
      },
    };
  },
};
