export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export const app = () => document.getElementById('app');

let haptics = true;
export const setHaptics = (v) => (haptics = !!v);
export function vibrate(ms = 12) {
  if (!haptics) return;
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch (e) {
    /* not supported */
  }
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
