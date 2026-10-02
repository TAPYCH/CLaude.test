// Independent, natural blinking for every character on screen (Lana, NPCs, previews).
const next = new WeakMap();

function schedule(el, now) {
  // 2.2–6 s between blinks, sometimes a quick double blink
  next.set(el, now + 2200 + Math.random() * 3800);
}

function blink(el, double) {
  el.classList.add('blinking');
  setTimeout(() => {
    el.classList.remove('blinking');
    if (double) setTimeout(() => blink(el, false), 140);
  }, 120);
}

export function startBlinking() {
  setInterval(() => {
    const now = performance.now();
    for (const el of document.querySelectorAll('svg.lana-svg, svg.lana-head')) {
      if (!next.has(el)) {
        next.set(el, now + 600 + Math.random() * 3000);
        continue;
      }
      if (now >= next.get(el)) {
        blink(el, Math.random() < 0.18);
        schedule(el, now);
      }
    }
  }, 100);
}
