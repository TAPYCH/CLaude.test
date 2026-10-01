// Generic "catch the falling things" engine used by the mandarin harvest and the pet game.
import { svgImage, starsFor } from './framework.js';

/**
 * cfg: { duration, items: [{ kind, weight, points, r, draw(ctx,x,y,r,t), bad, stun, sfx }],
 *        catcherSvg, catcherW, catcherH, background(ctx,W,H,t), thresholds, label }
 */
export function createCatcher(api, cfg) {
  const { ctx } = api;
  const img = cfg.catcherSvg ? svgImage(cfg.catcherSvg) : null;
  let px = api.W / 2;
  let target = px;
  let time = 0;
  let spawnT = 0;
  let score = 0;
  let caught = 0;
  let combo = 0;
  let stun = 0;
  let items = [];
  let pops = [];
  let shake = 0;
  const totalW = cfg.items.reduce((a, b) => a + b.weight, 0);

  function pick() {
    let r = Math.random() * totalW;
    for (const it of cfg.items) {
      r -= it.weight;
      if (r <= 0) return it;
    }
    return cfg.items[0];
  }

  const catcher = () => {
    const w = Math.min(api.W * 0.28, 140) * (cfg.catcherScale || 1);
    const h = w * (cfg.catcherH / cfg.catcherW);
    return { x: px, y: api.H - h * 0.5 - 34, w, h };
  };

  return {
    start() {
      api.hint(cfg.hint || 'Веди пальцем влево-вправо');
      setTimeout(() => api.hint(null), 2600);
    },
    update(dt) {
      time += dt;
      const progress = time / cfg.duration;
      if (stun > 0) stun -= dt;
      else px += (target - px) * Math.min(1, dt * 14);
      spawnT -= dt;
      if (spawnT <= 0) {
        spawnT = Math.max(0.28, 0.85 - progress * 0.55) * (0.7 + Math.random() * 0.6);
        const def = pick();
        const r = (def.r || 22) * Math.min(1.2, api.W / 420 + 0.4);
        items.push({ def, x: r + Math.random() * (api.W - r * 2), y: -r, r, vy: (160 + progress * 220) * (def.speed || 1) * (0.85 + Math.random() * 0.3), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 3, wob: Math.random() * 6 });
      }
      const c = catcher();
      for (const it of items) {
        it.y += it.vy * dt;
        it.rot += it.vr * dt;
        if (it.def.zigzag) it.x += Math.sin(time * 4 + it.wob) * 90 * dt;
        if (!it.done && it.y + it.r > c.y - c.h * 0.35 && it.y < c.y + c.h * 0.2 && Math.abs(it.x - c.x) < c.w * 0.5) {
          it.done = true;
          if (it.def.bad) {
            score = Math.max(0, score + it.def.points);
            combo = 0;
            stun = it.def.stun || 0;
            shake = 0.3;
            api.sfx('bad');
            api.vibrate(40);
            pops.push({ x: it.x, y: it.y, text: it.def.points ? `${it.def.points}` : '😵', c: '#ff5a6e', life: 1 });
          } else {
            combo++;
            const bonus = combo >= 8 ? 2 : 1;
            score += it.def.points * bonus;
            caught += 1;
            api.sfx(it.def.sfx || 'catch');
            pops.push({ x: it.x, y: it.y, text: `+${it.def.points * bonus}${bonus > 1 ? ' 🔥' : ''}`, c: it.def.points >= 5 ? '#ffc23d' : '#fff', life: 1 });
          }
        }
      }
      items = items.filter((it) => !it.done && it.y < api.H + 60);
      for (const p of pops) {
        p.y -= 60 * dt;
        p.life -= dt;
      }
      pops = pops.filter((p) => p.life > 0);
      if (shake > 0) shake -= dt;
      api.setStats([`${cfg.icon} ${score}`, `⏱ ${Math.max(0, Math.ceil(cfg.duration - time))}`, ...(combo >= 8 ? ['🔥 ×2'] : [])]);
      if (time >= cfg.duration) api.end({ score, stars: starsFor(score, cfg.thresholds), caught });
    },
    draw() {
      ctx.save();
      if (shake > 0) ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6);
      cfg.background(ctx, api.W, api.H, time);
      for (const it of items) {
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(it.def.spin === false ? 0 : it.rot * 0.3);
        it.def.draw(ctx, 0, 0, it.r, time);
        ctx.restore();
      }
      const c = catcher();
      if (img && img.complete) {
        ctx.save();
        if (stun > 0) ctx.globalAlpha = 0.6 + Math.sin(time * 30) * 0.3;
        ctx.drawImage(img, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
        ctx.restore();
      }
      if (stun > 0) {
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💫', c.x, c.y - c.h * 0.6);
      }
      ctx.font = '900 22px Nunito, sans-serif';
      ctx.textAlign = 'center';
      for (const p of pops) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0,0,0,.25)';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.c;
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    },
    pointerdown(x) {
      target = x;
    },
    pointermove(x) {
      target = x;
    },
    key(k, down) {
      if (!down) return;
      if (k === 'ArrowLeft' || k === 'a') target = Math.max(0, target - api.W * 0.12);
      if (k === 'ArrowRight' || k === 'd') target = Math.min(api.W, target + api.W * 0.12);
    },
  };
}

// ---------------------------------------------------------------- shared sprites
export function drawMandarin(ctx, x, y, r, golden = false, rotten = false) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  if (rotten) {
    g.addColorStop(0, '#b9a24a');
    g.addColorStop(1, '#6d6a2a');
  } else if (golden) {
    g.addColorStop(0, '#fff7b0');
    g.addColorStop(0.5, '#ffd23d');
    g.addColorStop(1, '#e8a010');
  } else {
    g.addColorStop(0, '#ffc777');
    g.addColorStop(0.55, '#ff9a2e');
    g.addColorStop(1, '#e8730f');
  }
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  if (rotten) {
    ctx.fillStyle = '#4a4a1a';
    ctx.beginPath();
    ctx.arc(x + r * 0.3, y + r * 0.2, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = rotten ? '#5a6a2a' : '#4caf50';
  ctx.beginPath();
  ctx.ellipse(x + r * 0.35, y - r * 0.95, r * 0.42, r * 0.18, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a4a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.85);
  ctx.lineTo(x - r * 0.05, y - r * 1.1);
  ctx.stroke();
  if (golden) {
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x - r * 0.4, y - r * 0.4, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export function drawBee(ctx, x, y, r, t) {
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  const flap = Math.sin(t * 40) * 0.3;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.3, y - r * 0.7, r * 0.45, r * 0.3, -0.6 + flap, 0, Math.PI * 2);
  ctx.ellipse(x + r * 0.3, y - r * 0.7, r * 0.45, r * 0.3, 0.6 - flap, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd23d';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.9, r * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3b2a1a';
  for (const dx of [-0.3, 0.15]) ctx.fillRect(x + dx * r, y - r * 0.6, r * 0.18, r * 1.2);
  ctx.beginPath();
  ctx.arc(x + r * 0.62, y - r * 0.12, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEmoji(ctx, e, x, y, r) {
  ctx.font = `${r * 1.8}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(e, x, y);
  ctx.textBaseline = 'alphabetic';
}
