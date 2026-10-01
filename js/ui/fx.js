// Toasts, floating numbers, confetti.
import { el, app, esc } from './dom.js';

let toastRoot;
function root() {
  if (!toastRoot || !toastRoot.isConnected) {
    toastRoot = el('<div class="toasts"></div>');
    app().appendChild(toastRoot);
  }
  return toastRoot;
}

const queue = [];
let showing = 0;

export function toast({ icon = '✨', title = '', text = '', avatar = null, time = 3200, onClick = null }) {
  queue.push({ icon, title, text, avatar, time, onClick });
  pump();
}

function pump() {
  if (showing >= 2 || !queue.length) return;
  const t = queue.shift();
  showing++;
  const node = el(`<div class="toast">
      <div class="t-ico ${t.avatar ? 'av' : ''}">${t.avatar || esc(t.icon)}</div>
      <div>${t.title ? `<b>${esc(t.title)}</b>` : ''}${t.text ? `<small>${esc(t.text)}</small>` : ''}</div>
    </div>`);
  node.style.cursor = 'pointer';
  node.addEventListener('click', () => {
    if (t.onClick) t.onClick();
    close();
  });
  root().appendChild(node);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    node.classList.add('out');
    setTimeout(() => {
      node.remove();
      showing--;
      pump();
    }, 300);
  };
  setTimeout(close, t.time);
}

/** Floating "+15 🍓" text at screen coordinates. */
export function floatText(x, y, text, color = '#fff', delay = 0) {
  const node = el(`<div class="float-text">${esc(text)}</div>`);
  node.style.left = x + 'px';
  node.style.top = y + 'px';
  node.style.color = color;
  node.style.animationDelay = delay + 'ms';
  node.style.opacity = '0';
  app().appendChild(node);
  setTimeout(() => node.remove(), 1700 + delay);
}

export function confetti(n = 90) {
  const box = el('<div class="confetti"></div>');
  const cols = ['#ff6f9c', '#ff9a2e', '#ffc23d', '#3fcfae', '#4fb3ff', '#9a7bff', '#fff'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i');
    c.style.left = Math.random() * 100 + '%';
    c.style.background = cols[i % cols.length];
    c.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
    c.style.setProperty('--r', Math.random() * 1080 + 'deg');
    c.style.animationDuration = 1.8 + Math.random() * 1.8 + 's';
    c.style.animationDelay = Math.random() * 0.6 + 's';
    if (i % 3 === 0) c.style.borderRadius = '50%';
    box.appendChild(c);
  }
  app().appendChild(box);
  setTimeout(() => box.remove(), 4500);
}
