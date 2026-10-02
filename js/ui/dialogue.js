// Visual-novel style story scenes: scene backdrop, two portraits, typed text.
import { S } from '../core/state.js';
import { SCENES } from '../data/scenes.js';
import { DIALOGUES } from '../data/dialogues.js';
import { NPC_OUTFITS, NPC_NAMES } from '../data/npcs.js';
import { CONFIG } from '../config.js';
import { renderLana } from '../art/character.js';
import { el, app, esc } from './dom.js';
import { sfx } from '../audio.js';

function portrait(who, expr) {
  if (who === 'lover')
    return `<div class="dlg-lover"><div class="dlg-lover-ico">${CONFIG.loverEmoji}</div></div>`;
  const outfit = who === 'lana' ? S.outfit : NPC_OUTFITS[who];
  if (!outfit) return '';
  return renderLana({ outfit, expr: expr || 'happy' }).replace('viewBox="0 0 200 450"', 'viewBox="22 4 156 300"');
}

const nameOf = (who) => (who === 'lover' ? CONFIG.loverName : NPC_NAMES[who] || '');

/** Plays a dialogue script; resolves when finished or skipped. */
export function playDialogue(id) {
  const d = DIALOGUES[id];
  if (!d) return Promise.resolve();
  return new Promise((resolve) => {
    const sc = SCENES[d.scene] || SCENES[S.scene];
    const ratio = Math.max(0.5, window.innerWidth / Math.max(1, window.innerHeight));
    const vw = Math.min(sc.width, Math.max(1000, 1000 * ratio));
    const vx = Math.max(0, Math.min(sc.width - vw, sc.spawn - vw / 2));
    const node = el(`<div class="dlg ${d.call ? 'is-call' : ''}">
        <div class="dlg-bg"><svg viewBox="${vx} 0 ${vw} 1000" preserveAspectRatio="xMidYMid slice">${sc.paint({ phase: 'day', season: 'autumn', S })}</svg></div>
        <div class="dlg-shade"></div>
        <div class="dlg-p left"></div><div class="dlg-p right"></div>
        <button class="btn ghost small dlg-skip">Пропустить »</button>
        <div class="dlg-box"><span class="who"></span><p></p><div class="dlg-next">Нажми, чтобы продолжить ▸</div></div>
      </div>`);
    app().appendChild(node);
    const left = node.querySelector('.dlg-p.left');
    const right = node.querySelector('.dlg-p.right');
    const who = node.querySelector('.who');
    const p = node.querySelector('p');
    let i = -1;
    let typing = null;
    let rightWho = null;
    let leftKey = '';
    let rightKey = '';

    const finish = () => {
      clearInterval(typing);
      node.classList.add('closing');
      setTimeout(() => node.remove(), 400);
      resolve();
    };

    const show = () => {
      const [spk, text, expr] = d.lines[i];
      const isNarr = spk === 'narrator';
      node.classList.toggle('narr', isNarr);
      if (spk === 'lana') {
        const k = 'lana' + expr;
        if (k !== leftKey) {
          leftKey = k;
          left.innerHTML = portrait('lana', expr);
        }
      } else if (!isNarr) {
        rightWho = spk;
        const k = spk + expr;
        if (k !== rightKey) {
          rightKey = k;
          right.innerHTML = `${d.call ? '<div class="dlg-call-badge">📹 видеозвонок</div>' : ''}${portrait(spk, expr)}`;
          right.classList.remove('enter');
          void right.offsetWidth;
          right.classList.add('enter');
        }
      }
      if (!leftKey) {
        leftKey = 'lanahappy';
        left.innerHTML = portrait('lana', 'happy');
      }
      left.classList.toggle('active', spk === 'lana');
      right.classList.toggle('active', !!rightWho && spk === rightWho);
      right.hidden = !rightWho;
      who.textContent = nameOf(spk);
      who.hidden = isNarr;
      clearInterval(typing);
      let k = 0;
      p.textContent = '';
      typing = setInterval(() => {
        k += 2;
        p.textContent = text.slice(0, k);
        if (k % 6 === 0 && !isNarr) sfx('tap');
        if (k >= text.length) clearInterval(typing);
      }, 22);
    };

    const next = () => {
      const cur = d.lines[i];
      if (cur && p.textContent.length < cur[1].length) {
        clearInterval(typing);
        p.textContent = cur[1];
        return;
      }
      i++;
      if (i >= d.lines.length) finish();
      else show();
    };
    node.addEventListener('click', (e) => {
      if (e.target.closest('.dlg-skip')) return;
      next();
    });
    node.querySelector('.dlg-skip').addEventListener('click', () => {
      sfx('click');
      finish();
    });
    next();
  });
}

/** Big animated chapter title card. */
export function chapterCard(ch) {
  return new Promise((resolve) => {
    sfx('fanfare');
    const node = el(`<div class="chapter-card"><div class="cc-in">
        <div class="cc-ico">${ch.icon}</div>
        <div class="cc-n">Глава ${ch.n}</div>
        <div class="cc-t">${esc(ch.title)}</div>
        <div class="cc-s">${esc(ch.sub)}</div>
      </div></div>`);
    app().appendChild(node);
    const done = () => {
      node.classList.add('closing');
      setTimeout(() => node.remove(), 500);
      resolve();
    };
    const t = setTimeout(done, 3200);
    node.addEventListener('click', () => {
      clearTimeout(t);
      done();
    });
  });
}
