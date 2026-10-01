// «Мемори: инструменты» — flip cards and find pairs.
import { starsFor } from './framework.js';

const SETS = [
  [['🦷', 'Зуб'], ['🪥', 'Щётка'], ['🔬', 'Микроскоп'], ['🧪', 'Гипс'], ['🩺', 'Стетоскоп'], ['😁', 'Улыбка'], ['🍊', 'Мандарин'], ['🌴', 'Пальма']],
  [['🦷', 'Зуб'], ['🪞', 'Зеркальце'], ['💉', 'Шприц'], ['🧴', 'Паста'], ['🥼', 'Халат'], ['🏔️', 'Рица'], ['🌊', 'Море'], ['🏙️', 'Москва']],
];

export default {
  id: 'memory',
  title: 'Мемори: инструменты',
  icon: '🃏',
  scoreLabel: 'очков',
  noCountdown: true,
  howto: 'Открывай по две карточки и находи пары.\nЧем меньше ходов — тем больше звёзд!',
  create(api) {
    const { ctx } = api;
    const set = SETS[Math.floor(Math.random() * SETS.length)];
    const deck = shuffle([...set, ...set].map((c, i) => ({ id: i, e: c[0], n: c[1], open: false, done: false })));
    let first = null;
    let lock = false;
    let moves = 0;
    let pairs = 0;
    let t = 0;

    const grid = document.createElement('div');
    grid.style.cssText = 'position:absolute;left:50%;top:54%;transform:translate(-50%,-50%);z-index:2;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:min(92vw,460px);perspective:800px';
    deck.forEach((c) => {
      const b = document.createElement('button');
      b.style.cssText = 'aspect-ratio:3/4;position:relative;transform-style:preserve-3d;transition:transform .4s cubic-bezier(.34,1.56,.64,1)';
      b.innerHTML = `
        <div style="position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:16px;background:linear-gradient(160deg,#9be7c4,#3fcfae);box-shadow:0 4px 0 #22a888,0 6px 14px rgba(0,0,0,.15);display:grid;place-items:center;font-size:30px;color:#fff;font-weight:900">✦</div>
        <div style="position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);border-radius:16px;background:#fff;box-shadow:0 4px 0 #ecd5e1,0 6px 14px rgba(0,0,0,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">
          <span style="font-size:clamp(28px,8vw,40px);line-height:1">${c.e}</span><span style="font-size:11px;font-weight:900;color:#7d6078">${c.n}</span></div>`;
      b.addEventListener('click', () => flip(c, b));
      c.el = b;
      grid.appendChild(b);
    });
    api.root.appendChild(grid);

    function flip(c, b) {
      if (!api.playing || lock || c.open || c.done) return;
      c.open = true;
      b.style.transform = 'rotateY(180deg)';
      api.sfx('tap');
      if (!first) {
        first = c;
        return;
      }
      moves++;
      const a = first;
      first = null;
      if (a.e === c.e) {
        a.done = c.done = true;
        pairs++;
        api.sfx('success');
        for (const x of [a, c]) x.el.firstElementChild.nextElementSibling.style.boxShadow = '0 0 0 4px #3fcfae, 0 6px 14px rgba(0,0,0,.12)';
        if (pairs === set.length) {
          const stars = moves <= 11 ? 3 : moves <= 15 ? 2 : 1;
          const score = Math.max(10, 200 - moves * 8 - Math.round(t));
          setTimeout(() => {
            grid.remove();
            api.end({ score, stars, text: `Ходов: ${moves} · время: ${Math.round(t)} с` });
          }, 700);
        }
      } else {
        lock = true;
        setTimeout(() => {
          a.open = c.open = false;
          a.el.style.transform = '';
          c.el.style.transform = '';
          lock = false;
        }, 750);
      }
    }

    return {
      start() {
        // quick peek at the start
        lock = true;
        deck.forEach((c) => (c.el.style.transform = 'rotateY(180deg)'));
        setTimeout(() => {
          deck.forEach((c) => (c.el.style.transform = ''));
          lock = false;
        }, 1400);
      },
      update(dt) {
        t += dt;
        api.setStats([`🃏 ${pairs}/${set.length}`, `👆 ${moves}`, `⏱ ${Math.round(t)}`]);
      },
      draw() {
        const g = ctx.createLinearGradient(0, 0, 0, api.H);
        g.addColorStop(0, '#e6f7f2');
        g.addColorStop(1, '#ffe6f0');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, api.W, api.H);
        ctx.fillStyle = 'rgba(63,207,174,.08)';
        for (let i = 0; i < 14; i++) {
          ctx.beginPath();
          ctx.arc((i * 131) % api.W, (i * 197) % api.H, 30 + (i % 4) * 14, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      destroy() {
        grid.remove();
      },
    };
  },
};

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export { starsFor };
