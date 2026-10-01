// Dialogs. Each returns a promise resolving with the pressed button's value.
import { el, app, esc } from './dom.js';
import { sfx } from '../audio.js';

let openCount = 0;
export const modalOpen = () => openCount > 0;

export function overlay(inner, { onBackdrop = null, cls = '' } = {}) {
  const node = el(`<div class="overlay ${cls}"></div>`);
  node.appendChild(typeof inner === 'string' ? el(inner) : inner);
  openCount++;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    openCount--;
    node.classList.add('closing');
    setTimeout(() => node.remove(), 200);
  };
  node.addEventListener('click', (e) => {
    if (e.target === node && onBackdrop) onBackdrop(close);
  });
  app().appendChild(node);
  return { node, close };
}

/**
 * dialog({ icon, title, text, html, buttons: [{label, value, cls}], dismissable })
 */
export function dialog({ icon = '', title = '', text = '', html = '', buttons = [{ label: 'Ок', value: true }], dismissable = true, row = false }) {
  return new Promise((resolve) => {
    const box = el(`<div class="dialog" role="dialog">
      ${dismissable ? '<button class="x" aria-label="Закрыть">✕</button>' : ''}
      ${icon ? `<div class="big-ico">${icon}</div>` : ''}
      ${title ? `<h2>${esc(title)}</h2>` : ''}
      ${text ? `<p>${esc(text)}</p>` : ''}
      ${html}
      <div class="btns ${row ? 'row' : ''}"></div>
    </div>`);
    const btns = box.querySelector('.btns');
    const { close } = overlay(box, {
      onBackdrop: dismissable
        ? (c) => {
            c();
            resolve(null);
          }
        : null,
    });
    for (const b of buttons) {
      const btn = el(`<button class="btn ${b.cls || ''}">${esc(b.label)}</button>`);
      if (b.disabled) btn.disabled = true;
      btn.addEventListener('click', () => {
        sfx('click');
        close();
        resolve(b.value);
      });
      btns.appendChild(btn);
    }
    const x = box.querySelector('.x');
    if (x)
      x.addEventListener('click', () => {
        sfx('click');
        close();
        resolve(null);
      });
    sfx('pop');
  });
}

export function prompt({ icon = '', title = '', text = '', value = '', placeholder = '', max = 16, ok = 'Готово' }) {
  return new Promise((resolve) => {
    const box = el(`<div class="dialog">
      ${icon ? `<div class="big-ico">${icon}</div>` : ''}
      <h2>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}
      <input class="name-input" maxlength="${max}" placeholder="${esc(placeholder)}" value="${esc(value)}"/>
      <div class="btns" style="margin-top:16px"><button class="btn">${esc(ok)}</button></div>
    </div>`);
    const { close } = overlay(box);
    const input = box.querySelector('input');
    const done = () => {
      const v = input.value.trim();
      if (!v) {
        input.focus();
        return;
      }
      sfx('click');
      close();
      resolve(v);
    };
    box.querySelector('.btn').addEventListener('click', done);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') done();
    });
    setTimeout(() => input.focus(), 350);
  });
}
