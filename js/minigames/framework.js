// Shared minigame shell: intro card → 3-2-1 → game loop → results with stars & rewards.
import { el, app, esc, wait, vibrate } from '../ui/dom.js';
import { sfx } from '../audio.js';
import { S } from '../core/state.js';
import { confetti } from '../ui/fx.js';

export function runMinigame(def, opts = {}) {
  return new Promise((resolve) => {
    const root = el(`<div class="minigame" data-mg="${def.id}">
        <div class="mg-canvas"><canvas></canvas></div>
        <div class="mg-top"><div class="mg-stats" style="display:flex;gap:8px"></div><button class="icon-btn" data-quit aria-label="Выйти">✕</button></div>
      </div>`);
    app().appendChild(root);
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const statsBox = root.querySelector('.mg-stats');
    const box = root.querySelector('.mg-canvas');
    let game = null;
    let raf = 0;
    let last = 0;
    let state = 'intro';
    let hintNode = null;

    const api = {
      canvas, ctx, root, box, opts, mode: opts.mode || 'normal',
      W: 0, H: 0, dpr: Math.min(2, window.devicePixelRatio || 1),
      sfx, vibrate,
      setStats(list) {
        statsBox.innerHTML = list.map((s) => `<div class="mg-stat">${s}</div>`).join('');
      },
      hint(text) {
        if (hintNode) hintNode.remove();
        hintNode = null;
        if (text) {
          hintNode = el(`<div class="mg-hint">${esc(text)}</div>`);
          root.appendChild(hintNode);
        }
      },
      end(result) {
        if (state !== 'play') return;
        state = 'done';
        cancelAnimationFrame(raf);
        finish(result);
      },
      get playing() {
        return state === 'play';
      },
    };

    function resize() {
      const r = box.getBoundingClientRect();
      api.W = r.width;
      api.H = r.height;
      canvas.width = Math.round(r.width * api.dpr);
      canvas.height = Math.round(r.height * api.dpr);
      ctx.setTransform(api.dpr, 0, 0, api.dpr, 0, 0);
      if (game && game.resize) game.resize();
      if (game && game.draw) game.draw();
    }
    window.addEventListener('resize', resize);

    const pt = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    canvas.addEventListener('pointerdown', (e) => {
      if (state !== 'play' || !game.pointerdown) return;
      canvas.setPointerCapture(e.pointerId);
      const p = pt(e);
      game.pointerdown(p.x, p.y, e);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (state !== 'play' || !game.pointermove) return;
      const p = pt(e);
      game.pointermove(p.x, p.y, e);
    });
    canvas.addEventListener('pointerup', (e) => {
      if (state !== 'play' || !game.pointerup) return;
      const p = pt(e);
      game.pointerup(p.x, p.y, e);
    });
    const onKey = (e) => {
      if (state === 'play' && game.key) game.key(e.key, e.type === 'keydown');
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    root.querySelector('[data-quit]').addEventListener('click', async () => {
      sfx('click');
      if (state === 'play') {
        const prev = state;
        state = 'paused';
        const ok = await confirmQuit(root);
        if (!ok) {
          state = prev;
          last = performance.now();
          raf = requestAnimationFrame(loop);
          return;
        }
      }
      cleanup();
      resolve(null);
    });

    function loop(t) {
      if (state !== 'play') return;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      game.update && game.update(dt);
      game.draw && game.draw();
      raf = requestAnimationFrame(loop);
    }

    function cleanup() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      if (game && game.destroy) game.destroy();
      root.style.animation = 'fade-out .25s both';
      setTimeout(() => root.remove(), 250);
    }

    async function start() {
      resize();
      game = def.create(api);
      resize();
      if (!def.noCountdown) {
        const cd = el('<div class="countdown"></div>');
        root.appendChild(cd);
        for (const n of ['3', '2', '1']) {
          cd.innerHTML = `<span>${n}</span>`;
          sfx('tap');
          await wait(650);
        }
        cd.innerHTML = '<span>Вперёд!</span>';
        cd.style.fontSize = '64px';
        sfx('pop');
        setTimeout(() => cd.remove(), 600);
      }
      state = 'play';
      last = performance.now();
      if (game.start) game.start();
      raf = requestAnimationFrame(loop);
    }

    function finish(result) {
      api.hint(null);
      const chips = opts.reward ? opts.reward(result) : [];
      const best = S.records[def.id];
      const isRecord = result.score != null && (best == null || result.score > best);
      if (result.stars >= 3) {
        confetti(80);
        sfx('fanfare');
      } else if (result.stars >= 1) sfx('success');
      else sfx('fail');
      const titles = ['Можно лучше!', 'Неплохо!', 'Отлично!', 'Идеально!'];
      const card = el(`<div class="mg-intro"><div class="dialog">
          <div class="stars">${[1, 2, 3].map((i) => `<span class="${result.stars >= i ? 'on' : ''}">⭐</span>`).join('')}</div>
          <h2>${esc(result.title || titles[result.stars] || '')}</h2>
          ${result.text ? `<p>${esc(result.text)}</p>` : ''}
          ${result.score != null ? `<p style="margin-bottom:10px"><b style="font-size:30px;color:var(--ink)">${result.score}</b> ${esc(def.scoreLabel || 'очков')}${isRecord ? ' · <span class="chip orange">🏆 рекорд!</span>' : ''}</p>` : ''}
          <div class="rewards">${chips.map((c) => `<span class="reward">${esc(c)}</span>`).join('')}</div>
          <div class="btns"><button class="btn mint">Готово</button></div>
        </div></div>`);
      root.appendChild(card);
      card.querySelector('.btn').addEventListener('click', () => {
        sfx('click');
        cleanup();
        resolve(result);
      });
    }

    // intro card
    const best = S.records[def.id];
    const intro = el(`<div class="mg-intro"><div class="dialog">
        <div class="big-ico">${def.icon}</div>
        <h2>${esc(def.title)}</h2>
        <p>${esc(typeof def.howto === 'function' ? def.howto(api.mode) : def.howto)}</p>
        ${best != null ? `<p style="margin-top:-6px"><span class="chip orange">🏆 Рекорд: ${best}</span></p>` : ''}
        <div class="btns"><button class="btn">Начать!</button></div>
      </div></div>`);
    root.appendChild(intro);
    sfx('pop');
    intro.querySelector('.btn').addEventListener('click', () => {
      sfx('click');
      intro.remove();
      start();
    });
    requestAnimationFrame(resize);
  });
}

function confirmQuit(root) {
  return new Promise((resolve) => {
    const c = el(`<div class="mg-intro"><div class="dialog"><div class="big-ico">⏸️</div><h2>Пауза</h2><p>Выйти из мини-игры? Прогресс не сохранится.</p>
      <div class="btns row"><button class="btn mint" data-v="0">Играть</button><button class="btn ghost" data-v="1">Выйти</button></div></div></div>`);
    root.appendChild(c);
    c.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        sfx('click');
        c.remove();
        resolve(b.dataset.v === '1');
      }),
    );
  });
}

// ---------------------------------------------------------------- drawing helpers
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Turn an SVG string into an Image for canvas drawing. */
export function svgImage(svg) {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return img;
}

export function starsFor(score, thresholds) {
  let s = 0;
  thresholds.forEach((t, i) => {
    if (score >= t) s = i + 1;
  });
  return s;
}
