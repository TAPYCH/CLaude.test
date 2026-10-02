// «Фотосессия: образ недели» — build an outfit for the theme against the clock, then the jury scores it.
import { ITEMS } from '../data/items.js';
import { renderLana } from '../art/character.js';
import { thumb, withItem } from '../ui/wardrobe.js';
import { S } from '../core/state.js';

const THEMES = [
  {
    id: 'beach', icon: '🏖️', title: 'Пляжная вечеринка', sub: 'Сухум, закат, музыка у моря',
    good: ['swimsuit', 'shorts_denim', 'tee_mandarin', 'dress_mandarin', 'cami_satin', 'sandals', 'slides', 'sunglasses', 'flower', 'dress_babydoll', 'hoops'],
    bad: ['puffer', 'uggs', 'boots', 'beanie', 'scarf', 'trench', 'scrubs_top', 'scrubs_pants', 'sweater_pink', 'hoodie_msk', 'pajamas'],
  },
  {
    id: 'office', icon: '💼', title: 'Деловой стиль', sub: 'Собеседование в лучшей клинике',
    good: ['shirt_white', 'trench', 'flare_black', 'skirt_satin', 'pumps_white', 'flats_pink', 'pearl_drops', 'pearls', 'glasses', 'bag_tote', 'dress_black', 'top_keyhole', 'skirt_white', 'cardigan', 'studs', 'bag_chain'],
    bad: ['swimsuit', 'shorts_denim', 'slides', 'hoodie_msk', 'pajamas', 'sneakers', 'uggs', 'flower', 'sunglasses', 'tee_mandarin', 'beanie'],
  },
  {
    id: 'winter', icon: '❄️', title: 'Зимняя Москва', sub: 'Прогулка по снежному центру',
    good: ['puffer', 'sweater_pink', 'hoodie_msk', 'jeans', 'boots', 'uggs', 'beanie', 'scarf', 'trench', 'cardigan', 'flare_black'],
    bad: ['swimsuit', 'shorts_denim', 'sandals', 'slides', 'cami_satin', 'sunglasses', 'flower', 'dress_mandarin', 'tee_mandarin'],
  },
  {
    id: 'theatre', icon: '🎭', title: 'Вечер в театре', sub: 'Большой театр, премьера балета',
    good: ['dress_black', 'dress_red', 'cami_satin', 'skirt_satin', 'pumps_white', 'pearls', 'pearl_drops', 'bag_chain', 'top_keyhole', 'heart_necklace', 'flats_pink'],
    bad: ['hoodie_msk', 'sneakers', 'slides', 'shorts_denim', 'pajamas', 'puffer', 'scrubs_top', 'scrubs_pants', 'beanie', 'swimsuit', 'uggs', 'tee_mandarin'],
  },
  {
    id: 'park', icon: '🌳', title: 'Прогулка в парке', sub: 'Утки, кофе и солнечный день',
    good: ['tee_mandarin', 'breton', 'jeans', 'sneakers', 'skirt_plaid', 'cardigan', 'bag_tote', 'headband', 'sunglasses', 'flats_pink', 'dress_babydoll', 'sweater_pink'],
    bad: ['swimsuit', 'pajamas', 'scrubs_top', 'scrubs_pants', 'dress_black', 'uggs'],
  },
];

const ROUNDS = [
  { id: 'top', name: 'Верх или платье', cats: ['top', 'dress'] },
  { id: 'bottom', name: 'Низ', cats: ['bottom'] },
  { id: 'shoes', name: 'Обувь', cats: ['shoes'] },
  { id: 'acc', name: 'Аксессуар', cats: ['acc'] },
];
const EXCLUDE = new Set(['tiara', 'dress_grad']);
const JUDGES = [
  { icon: '👩‍🎨', name: 'Стилист' },
  { icon: '📸', name: 'Фотограф' },
  { icon: '👠', name: 'Модель' },
];

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default {
  id: 'fashion',
  title: 'Фотосессия «Образ недели»',
  icon: '📸',
  scoreLabel: 'баллов',
  noCountdown: true,
  howto: 'Стилист даёт тему — собери подходящий образ из вещей на вешалке, пока не вышло время. Жюри оценит образ от 1 до 10.\n⭐ 6+ · ⭐⭐ 7,5+ · ⭐⭐⭐ 9+ · Призы до 4 500 ₽!',
  create(api) {
    const { ctx } = api;
    const level = api.opts.level || 1;
    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const total = Math.max(18, 30 - level);
    let left = total;
    let round = 0;
    let picks = [];
    let outfit = { ...S.outfit, acc: [] };
    let locked = false;
    let done = false;
    let speedBonus = 0;

    const kind = (id) => (theme.good.includes(id) ? 'good' : theme.bad.includes(id) ? 'bad' : 'ok');
    function offer(r) {
      const pool = Object.keys(ITEMS).filter((id) => r.cats.includes(ITEMS[id].cat) && !EXCLUDE.has(id));
      const good = shuffle(pool.filter((id) => kind(id) === 'good'));
      const bad = shuffle(pool.filter((id) => kind(id) === 'bad'));
      const ok = shuffle(pool.filter((id) => kind(id) === 'ok'));
      const out = [good[0], bad[0], ok[0], good[1] || ok[1] || bad[1]].filter(Boolean);
      for (const id of shuffle([...pool])) if (out.length < 4 && !out.includes(id)) out.push(id);
      return shuffle(out.slice(0, 4));
    }

    const box = document.createElement('div');
    box.className = 'mgf';
    box.innerHTML = `
      <div class="mgf-theme"><div class="mgf-ti">${theme.icon}</div><div style="min-width:0"><b>${theme.title}</b><small>${theme.sub}</small></div></div>
      <div class="mgf-timer"><i></i></div>
      <div class="mgf-stage"><div class="mgf-model"></div><div class="mgf-judges"></div></div>
      <div class="mgf-pick"><div class="mgf-round"></div><div class="mgf-cards"></div></div>`;
    api.root.appendChild(box);
    const model = box.querySelector('.mgf-model');
    const cards = box.querySelector('.mgf-cards');
    const roundEl = box.querySelector('.mgf-round');
    const timerEl = box.querySelector('.mgf-timer i');
    const judgesEl = box.querySelector('.mgf-judges');

    const showModel = () => {
      model.innerHTML = renderLana({ outfit, expr: 'happy' });
    };

    function nextRound() {
      if (round >= ROUNDS.length) return runway();
      const r = ROUNDS[round];
      if (r.id === 'bottom' && outfit.dress) {
        round++;
        return nextRound();
      }
      roundEl.innerHTML = `<span>${round + 1}/${ROUNDS.length}</span> ${r.name}`;
      cards.innerHTML = '';
      offer(r).forEach((id, k) => {
        const it = ITEMS[id];
        const b = document.createElement('button');
        b.className = 'mgf-card';
        b.style.animationDelay = `${k * 0.05}s`;
        b.innerHTML = `<div class="th">${thumb(it.cat, id, outfit)}</div><span>${it.name}</span>`;
        b.addEventListener('click', () => pick(id, b));
        cards.appendChild(b);
      });
      locked = false;
    }

    function pick(id, b) {
      if (locked || done || !api.playing) return;
      locked = true;
      const it = ITEMS[id];
      outfit = withItem(outfit, it.cat, id);
      picks.push(id);
      b.classList.add('on');
      api.sfx('pop');
      showModel();
      model.classList.remove('bump');
      void model.offsetWidth;
      model.classList.add('bump');
      if (it.cat === 'dress') round++; // a dress covers top & bottom
      round++;
      setTimeout(nextRound, 380);
    }

    function runway() {
      done = true;
      speedBonus = left / total;
      box.classList.add('runway');
      api.hint(null);
      // a skipped round (time ran out) counts as zero
      const expected = picks.some((id) => ITEMS[id].cat === 'dress') ? ROUNDS.length - 1 : ROUNDS.length;
      const base = picks.reduce((a, id) => a + { good: 10, ok: 5, bad: 0 }[kind(id)], 0) / Math.max(expected, picks.length);
      const rare = picks.some((id) => ['epic', 'legendary'].includes(ITEMS[id].rarity)) ? 0.4 : 0;
      const scores = JUDGES.map((j, k) => {
        const jitter = [0.3, -0.2, 0][k] + (Math.random() - 0.5) * 0.8;
        return Math.max(1, Math.min(10, Math.round((base + speedBonus - 0.6 + rare + jitter) * 2) / 2));
      });
      judgesEl.innerHTML = JUDGES.map((j) => `<div class="mgf-j"><div class="ji">${j.icon}</div><div class="js">?</div><small>${j.name}</small></div>`).join('');
      const nodes = judgesEl.querySelectorAll('.mgf-j');
      scores.forEach((sc, k) =>
        setTimeout(() => {
          const n = nodes[k];
          n.classList.add('show');
          n.querySelector('.js').textContent = String(sc).replace('.', ',');
          n.classList.toggle('hi', sc >= 9);
          api.sfx(sc >= 8 ? 'success' : sc >= 6 ? 'pop' : 'bad');
          if (sc >= 9) api.sfx('camera');
        }, 900 + k * 700),
      );
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const stars = avg >= 9 ? 3 : avg >= 7.5 ? 2 : avg >= 6 ? 1 : 0;
      setTimeout(() => {
        box.remove();
        api.end({
          score: Math.round(avg * 10),
          stars,
          text: `«${theme.title}»: средняя оценка ${avg.toFixed(1).replace('.', ',')} / 10`,
        });
      }, 900 + JUDGES.length * 700 + 1100);
    }

    showModel();
    return {
      start() {
        nextRound();
      },
      update(dt) {
        if (done) return;
        left -= dt;
        timerEl.style.width = `${Math.max(0, left / total) * 100}%`;
        timerEl.style.background = left < 6 ? '#ff6f8a' : left < total / 2 ? '#ffb35e' : '#3fcfae';
        api.setStats([`⏱ ${Math.max(0, Math.ceil(left))}`, `👗 ${picks.length}`]);
        if (left <= 0) {
          // time's up — whatever is not chosen stays as it was
          left = 0;
          runway();
        }
      },
      draw() {
        const g = ctx.createLinearGradient(0, 0, 0, api.H);
        g.addColorStop(0, '#ffe9f2');
        g.addColorStop(1, '#f3e6ff');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, api.W, api.H);
        // studio backdrop & softboxes
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.beginPath();
        ctx.ellipse(api.W / 2, api.H * 0.42, api.W * 0.45, api.H * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,111,156,.08)';
        for (let k = 0; k < 10; k++) {
          ctx.beginPath();
          ctx.arc((k * 173) % api.W, (k * 97) % api.H, 18 + (k % 3) * 10, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      destroy() {
        box.remove();
      },
    };
  },
};
