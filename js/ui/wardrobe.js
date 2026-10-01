// Wardrobe & boutique: live try-on on a big model. In shop mode unowned items show prices.
import { S, owns } from '../core/state.js';
import { ITEMS, SALON, CATEGORIES, RARITY } from '../data/items.js';
import { HAIRSTYLES } from '../art/hair.js';
import { HAIR_COLORS, LIP_COLORS } from '../art/palette.js';
import { renderLana } from '../art/character.js';
import { buyItem, buySalon, equipOutfit, pauseTime, resumeTime } from '../game.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { el, app, esc } from './dom.js';
import { sfx } from '../audio.js';
import { toast, confetti } from './fx.js';
import { money } from '../core/time.js';
import { refreshLana } from './world.js';
import { dialog } from './modal.js';

const CROP = {
  top: '40 128 120 128',
  bottom: '44 215 112 120',
  bottomLong: '30 215 140 230',
  dress: '26 130 148 200',
  dressLong: '10 130 180 320',
  shoes: '66 378 68 68',
  ears: '40 62 120 80',
  eyes: '52 64 96 66',
  head: '36 0 128 128',
  neck: '58 126 84 84',
  hand: '70 140 100 140',
  hairStyle: '30 8 140 190',
  hairColor: '30 8 140 190',
  lips: '80 104 40 34',
};

function cropFor(cat, id) {
  if (cat === 'hairStyle' || cat === 'hairColor' || cat === 'lips') return CROP[cat];
  const it = ITEMS[id];
  if (cat === 'acc') return CROP[it.slot] || CROP.head;
  if (cat === 'bottom' && it.longBottom) return CROP.bottomLong;
  if (cat === 'dress' && it.longBottom) return CROP.dressLong;
  return CROP[cat];
}

function withItem(base, cat, id) {
  const o = { ...base, acc: [...(base.acc || [])] };
  if (cat === 'top' || cat === 'bottom') {
    o[cat] = id;
    o.dress = null;
  } else if (cat === 'dress') o.dress = id;
  else if (cat === 'shoes') o.shoes = id;
  else if (cat === 'acc') {
    const slot = ITEMS[id].slot;
    o.acc = o.acc.filter((a) => ITEMS[a] && ITEMS[a].slot !== slot);
    o.acc.push(id);
  } else o[cat] = id;
  return o;
}

function thumb(cat, id, base) {
  const o = withItem(base, cat, id);
  if (cat === 'acc') o.hairStyle = ITEMS[id].slot === 'head' ? 'long' : o.hairStyle;
  const svg = renderLana({ outfit: o, expr: 'happy' });
  return svg.replace('viewBox="0 0 200 450"', `viewBox="${cropFor(cat, id)}"`);
}

const isOwned = (cat, id) => (SALON[cat] ? S.salon[cat].includes(id) : owns(id));
const priceOf = (cat, id) => (SALON[cat] ? SALON[cat][id].price : ITEMS[id].price);
const nameOf = (cat, id) => {
  if (cat === 'hairStyle') return HAIRSTYLES[id].name;
  if (cat === 'hairColor') return HAIR_COLORS[id].name;
  if (cat === 'lips') return LIP_COLORS[id].name;
  return ITEMS[id].name;
};
const isWorn = (o, cat, id) => {
  if (cat === 'acc') return (o.acc || []).includes(id);
  if (cat === 'top' || cat === 'bottom') return !o.dress && o[cat] === id;
  return o[cat] === id;
};

function idsFor(cat, shop) {
  let ids;
  if (SALON[cat]) ids = Object.keys(SALON[cat]);
  else ids = Object.keys(ITEMS).filter((id) => ITEMS[id].cat === cat);
  if (!shop) ids = ids.filter((id) => isOwned(cat, id));
  else ids = ids.filter((id) => SALON[cat] || !ITEMS[id].unlock || isOwned(cat, id) || true);
  return ids.sort((a, b) => (isOwned(cat, b) - isOwned(cat, a)) || priceOf(cat, a) - priceOf(cat, b));
}

/**
 * openWardrobe({ shop: bool, tab })
 */
export function openWardrobe({ shop = false, tab = null } = {}) {
  return new Promise((resolve) => {
    pauseTime();
    let draft = JSON.parse(JSON.stringify(S.outfit));
    let cat = tab || (shop ? 'top' : 'top');
    const cats = CATEGORIES.filter((c) => (shop ? true : idsFor(c.id, false).length));
    const root = el(`<div class="wardrobe">
        <div class="stage">
          <div class="tools">
            <button class="icon-btn" data-undo title="Сбросить">↺</button>
            <button class="icon-btn" data-strip title="Как на фото">⭐</button>
          </div>
          <div class="spot"></div><div class="model"></div>
        </div>
        <div class="panel">
          <div class="w-head"><h3>${shop ? (['hairStyle', 'hairColor', 'lips'].includes(tab) ? '💇‍♀️ Салон' : '🛍️ Бутик') : '👗 Гардероб'}</h3>
            <span class="chip orange" data-money></span>
            <button class="icon-btn" data-close aria-label="Закрыть">✕</button></div>
          <div class="tabs"></div>
          <div class="w-body"><div class="item-grid"></div></div>
          <div style="padding:10px 14px calc(12px + var(--safe-b));display:flex;gap:10px" data-foot>
            <button class="btn block mint" data-save>Готово ✨</button>
          </div>
        </div>
      </div>`);
    app().appendChild(root);
    const model = root.querySelector('.model');
    const grid = root.querySelector('.item-grid');
    const tabs = root.querySelector('.tabs');

    const drawModel = (expr = 'happy') => {
      model.innerHTML = renderLana({ outfit: draft, expr });
    };
    const drawMoney = () => (root.querySelector('[data-money]').textContent = money(S.money));

    const drawTabs = () => {
      tabs.innerHTML = cats.map((c) => `<button class="tab ${c.id === cat ? 'on' : ''}" data-cat="${c.id}">${c.icon} ${c.name}</button>`).join('');
      tabs.querySelectorAll('.tab').forEach((t) =>
        t.addEventListener('click', () => {
          sfx('click');
          cat = t.dataset.cat;
          drawTabs();
          drawGrid();
        }),
      );
    };

    const drawGrid = () => {
      const ids = idsFor(cat, shop);
      grid.innerHTML = '';
      for (const id of ids) {
        const owned = isOwned(cat, id);
        const it = ITEMS[id];
        const locked = it && it.unlock && !owned;
        const rar = it ? RARITY[it.rarity] : null;
        const worn = isWorn(draft, cat, id);
        const node = el(`<button class="item ${worn ? 'on' : ''}">
            ${rar ? `<span class="rar" style="background:${rar.color}" title="${rar.name}"></span>` : ''}
            <div class="thumb">${thumb(cat, id, draft)}</div>
            <div class="nm">${esc(nameOf(cat, id))}</div>
            <div class="pr ${owned ? 'owned' : ''}">${owned ? (worn ? 'Надето' : 'Есть') : locked ? '🔒' : priceOf(cat, id) ? money(priceOf(cat, id)) : 'Бесплатно'}</div>
            ${worn ? '<span class="check">✓</span>' : ''}
            ${locked ? '<div class="lock">🔒</div>' : ''}
          </button>`);
        node.addEventListener('click', () => onItem(id, owned, locked));
        grid.appendChild(node);
      }
      if (!ids.length) grid.innerHTML = '<p class="muted">Пока пусто — загляни в бутик!</p>';
    };

    const onItem = async (id, owned, locked) => {
      sfx('tap');
      if (locked) {
        const ach = ACHIEVEMENTS.find((a) => a.reward === id || a.id === ITEMS[id].unlock);
        toast({ icon: '🔒', title: ITEMS[id].name, text: ach ? `Награда за достижение «${ach.name}»` : 'Особая награда' });
        return;
      }
      // toggle accessory off
      if (cat === 'acc' && draft.acc.includes(id)) {
        draft.acc = draft.acc.filter((a) => a !== id);
      } else if (cat === 'dress' && draft.dress === id) {
        draft.dress = null;
      } else {
        draft = withItem(draft, cat, id);
      }
      drawModel('excited');
      setTimeout(() => drawModel('happy'), 700);
      drawGrid();
      if (!owned && shop) {
        const price = priceOf(cat, id);
        const ok = await dialog({
          icon: '🛍️', title: nameOf(cat, id),
          text: `${(ITEMS[id] && ITEMS[id].desc) || 'Новый образ для Ланы'}\n\nЦена: ${money(price)} · У тебя: ${money(S.money)}`,
          buttons: [{ label: `Купить за ${money(price)}`, value: true, cls: 'orange', disabled: S.money < price }, { label: 'Просто примерить', value: false, cls: 'ghost' }],
        });
        if (ok) {
          const bought = SALON[cat] ? buySalon(cat, id, price) : buyItem(id);
          if (bought) {
            confetti(40);
            toast({ icon: '🛍️', title: 'Куплено!', text: nameOf(cat, id) });
          }
          drawMoney();
          drawGrid();
        }
      }
    };

    const close = (apply) => {
      if (apply) {
        // strip anything not owned
        const clean = { ...draft, acc: draft.acc.filter((a) => owns(a)) };
        for (const k of ['top', 'bottom', 'shoes']) if (!owns(clean[k])) clean[k] = S.outfit[k];
        if (clean.dress && !owns(clean.dress)) clean.dress = null;
        for (const k of ['hairStyle', 'hairColor', 'lips']) if (!S.salon[k].includes(clean[k])) clean[k] = S.outfit[k];
        const changed = JSON.stringify(clean) !== JSON.stringify(S.outfit);
        equipOutfit(clean);
        refreshLana(true);
        if (changed) sfx('shine');
      }
      root.style.animation = 'fade-out .25s both';
      setTimeout(() => root.remove(), 250);
      resumeTime();
      resolve();
    };

    root.querySelector('[data-close]').addEventListener('click', () => {
      sfx('click');
      close(true);
    });
    root.querySelector('[data-save]').addEventListener('click', () => {
      sfx('click');
      close(true);
    });
    root.querySelector('[data-undo]').addEventListener('click', () => {
      sfx('click');
      draft = JSON.parse(JSON.stringify(S.outfit));
      drawModel();
      drawGrid();
    });
    root.querySelector('[data-strip]').addEventListener('click', () => {
      sfx('click');
      draft = { ...draft, top: 'top_keyhole', bottom: 'skirt_white', dress: null, shoes: 'pumps_white', acc: ['studs'], hairStyle: 'long', hairColor: 'chestnut', lips: 'nude' };
      drawModel('excited');
      drawGrid();
      toast({ icon: '⭐', title: 'Фирменный образ', text: 'Как на любимом фото' });
    });
    drawModel();
    drawTabs();
    drawGrid();
    drawMoney();
  });
}
