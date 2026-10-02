// «Пазл-открытка» — sliding puzzle made from one of Lana's postcards.
import { svgImage, roundRect } from './framework.js';
import { postcardArt, EXCURSIONS } from '../data/places.js';
import { S } from '../core/state.js';

const N = 3;

export default {
  id: 'puzzle',
  title: 'Пазл-открытка',
  icon: '🧩',
  scoreLabel: 'очков',
  howto: 'Открытку перемешали! Двигай кусочки на пустое место, чтобы собрать картинку.\n⭐ собрать за 3 минуты · ⭐⭐ до 60 ходов · ⭐⭐⭐ до 36 ходов',
  create(api) {
    const { ctx } = api;
    const ids = S.postcards.length ? S.postcards : ['redsquare', 'ritsa'];
    const pid = ids[Math.floor(Math.random() * ids.length)];
    const img = svgImage(postcardArt(pid).replace('<svg ', '<svg width="800" height="520" '));
    const name = (EXCURSIONS[pid] && EXCURSIONS[pid].name) || 'Открытка';
    const limit = 180;
    // tiles[pos] = tile id (N*N-1 = empty)
    let tiles = [...Array(N * N).keys()];
    let empty = N * N - 1;
    let moves = 0;
    let t = 0;
    let solved = false;
    const anim = new Map(); // tile → {fx, fy, k}

    const nb = (p) => {
      const r = Math.floor(p / N);
      const c = p % N;
      return [r > 0 && p - N, r < N - 1 && p + N, c > 0 && p - 1, c < N - 1 && p + 1].filter((x) => x !== false);
    };
    // shuffle by random legal moves → always solvable
    let prev = -1;
    for (let k = 0; k < 90; k++) {
      const opts = nb(empty).filter((p) => p !== prev);
      const p = opts[Math.floor(Math.random() * opts.length)];
      [tiles[p], tiles[empty]] = [tiles[empty], tiles[p]];
      prev = empty;
      empty = p;
    }
    if (tiles.every((v, i) => v === i)) {
      const p = nb(empty)[0];
      [tiles[p], tiles[empty]] = [tiles[empty], tiles[p]];
      empty = p;
    }

    const geo = () => {
      const maxW = Math.min(api.W - 28, 560);
      const maxH = api.H - 170;
      let w = maxW;
      let h = (w * 260) / 400;
      if (h > maxH) {
        h = maxH;
        w = (h * 400) / 260;
      }
      return { x: (api.W - w) / 2, y: Math.max(76, (api.H - h) / 2 + 10), w, h, tw: w / N, th: h / N };
    };

    function move(p) {
      if (solved || !nb(empty).includes(p)) return false;
      const g = geo();
      const tile = tiles[p];
      anim.set(tile, { fx: (p % N) * g.tw, fy: Math.floor(p / N) * g.th, k: 0 });
      [tiles[p], tiles[empty]] = [tiles[empty], tiles[p]];
      empty = p;
      moves++;
      api.sfx('tap');
      if (tiles.every((v, i) => v === i)) {
        solved = true;
        api.sfx('success');
        setTimeout(() => {
          const stars = t > limit ? 0 : moves <= 36 ? 3 : moves <= 60 ? 2 : 1;
          api.end({ score: Math.max(10, 400 - moves * 4 - Math.round(t)), stars, text: `«${name}» · ходов: ${moves} · ${Math.round(t)} с` });
        }, 1100);
      }
      return true;
    }

    return {
      update(dt) {
        if (!solved) t += dt;
        for (const [k, a] of anim) {
          a.k += dt * 9;
          if (a.k >= 1) anim.delete(k);
        }
        api.setStats([`🧩 ${moves}`, `⏱ ${Math.max(0, Math.ceil(limit - t))}`]);
        if (!solved && t > limit + 0.5) {
          solved = true;
          api.end({ score: 0, stars: 0, text: 'Время вышло — открытка подождёт 🙂' });
        }
      },
      draw() {
        const g0 = ctx.createLinearGradient(0, 0, 0, api.H);
        g0.addColorStop(0, '#fff1e0');
        g0.addColorStop(1, '#ffe0ec');
        ctx.fillStyle = g0;
        ctx.fillRect(0, 0, api.W, api.H);
        const g = geo();
        ctx.fillStyle = 'rgba(120,60,90,.18)';
        roundRect(ctx, g.x - 10, g.y - 2, g.w + 20, g.h + 20, 18);
        ctx.fill();
        ctx.fillStyle = '#fff';
        roundRect(ctx, g.x - 10, g.y - 10, g.w + 20, g.h + 20, 18);
        ctx.fill();
        ctx.fillStyle = '#f3e3ea';
        ctx.fillRect(g.x, g.y, g.w, g.h);
        if (!img.complete) return;
        const sw = img.naturalWidth / N || 800 / N;
        const sh = img.naturalHeight / N || 520 / N;
        for (let p = 0; p < N * N; p++) {
          const tile = tiles[p];
          if (tile === N * N - 1 && !solved) continue;
          let x = (p % N) * g.tw;
          let y = Math.floor(p / N) * g.th;
          const a = anim.get(tile);
          if (a) {
            const e = 1 - Math.pow(1 - Math.min(1, a.k), 3);
            x = a.fx + (x - a.fx) * e;
            y = a.fy + (y - a.fy) * e;
          }
          const sx = (tile % N) * sw;
          const sy = Math.floor(tile / N) * sh;
          ctx.save();
          roundRect(ctx, g.x + x + 2, g.y + y + 2, g.tw - 4, g.th - 4, solved ? 0 : 8);
          ctx.clip();
          ctx.drawImage(img, sx, sy, sw, sh, g.x + x, g.y + y, g.tw, g.th);
          ctx.restore();
          if (!solved) {
            ctx.strokeStyle = 'rgba(255,255,255,.8)';
            ctx.lineWidth = 2;
            roundRect(ctx, g.x + x + 2, g.y + y + 2, g.tw - 4, g.th - 4, 8);
            ctx.stroke();
          }
        }
        // reference thumbnail
        const rw = Math.min(110, api.W * 0.26);
        const rh = (rw * 260) / 400;
        const ry = g.y + g.h + 22;
        if (ry + rh < api.H - 6) {
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = '#fff';
          roundRect(ctx, api.W / 2 - rw / 2 - 4, ry - 4, rw + 8, rh + 8, 10);
          ctx.fill();
          ctx.drawImage(img, api.W / 2 - rw / 2, ry, rw, rh);
          ctx.globalAlpha = 1;
        }
        ctx.textAlign = 'center';
        ctx.font = '900 16px Nunito, sans-serif';
        ctx.fillStyle = '#7d6078';
        ctx.fillText(`🖼️ ${name}`, api.W / 2, g.y - 20);
      },
      pointerdown(x, y) {
        const g = geo();
        if (x < g.x || y < g.y || x > g.x + g.w || y > g.y + g.h) return;
        const c = Math.floor((x - g.x) / g.tw);
        const r = Math.floor((y - g.y) / g.th);
        const p = r * N + c;
        if (!move(p)) {
          // tap in the row/column of the gap slides several tiles at once
          const er = Math.floor(empty / N);
          const ec = empty % N;
          if (r === er || c === ec) {
            let guard = 0;
            while (empty !== p && guard++ < N) {
              const step = r === er ? (c > ec ? 1 : -1) : c === ec ? (r > er ? N : -N) : 0;
              if (!move(empty + step)) break;
            }
          }
        }
      },
      key(k, down) {
        if (!down) return;
        const map = { ArrowUp: N, ArrowDown: -N, ArrowLeft: 1, ArrowRight: -1 };
        if (map[k] != null) {
          const p = empty + map[k];
          if (p >= 0 && p < N * N && nb(empty).includes(p)) move(p);
        }
      },
    };
  },
};
