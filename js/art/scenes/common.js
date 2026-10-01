// Shared vector building blocks for scene backgrounds (viewBox 0 0 W 1000).

export const SKY = {
  day: ['#7cc8ff', '#d9f1ff'],
  dawn: ['#ffa98f', '#ffe3c2'],
  sunset: ['#8a6bc4', '#ffb27a'],
  evening: ['#2f3473', '#b56a8f'],
  night: ['#0d1433', '#2b3870'],
};

export function skyDefs(id, phase) {
  const [a, b] = SKY[phase] || SKY.day;
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
}

export const isDark = (phase) => phase === 'night' || phase === 'evening';

export function stars(w, h, n = 40, seed = 7) {
  let s = '';
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const size = 0.8 + rnd() * 1.8;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="#fff" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`;
  }
  return s;
}

export function moon(x, y, r = 26) {
  return `<circle cx="${x}" cy="${y}" r="${r * 1.8}" fill="#fff6d6" opacity=".12"/><circle cx="${x}" cy="${y}" r="${r}" fill="#fff6d6"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.2}" r="${r * 0.85}" fill="#fff6d6" opacity="0"/>
    <circle cx="${x - r * 0.3}" cy="${y - r * 0.2}" r="${r * 0.18}" fill="#efe2b8"/><circle cx="${x + r * 0.25}" cy="${y + r * 0.3}" r="${r * 0.12}" fill="#efe2b8"/>`;
}

export function sun(x, y, r = 40, color = '#fff3b0') {
  return `<circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="${color}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r * 1.5}" fill="${color}" opacity=".3"/><circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
}

export function cloud(x, y, s = 1, op = 0.9) {
  return `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}">
    <ellipse cx="0" cy="0" rx="60" ry="22" fill="#fff"/>
    <circle cx="-26" cy="-10" r="24" fill="#fff"/><circle cx="8" cy="-22" r="30" fill="#fff"/><circle cx="38" cy="-6" r="20" fill="#fff"/>
  </g>`;
}

/** Moscow skyline silhouette: Stalin high-rise, Ostankino tower, Moscow City. */
export function moscowSkyline(x, baseY, s = 1, col = '#8fa3c9', win = null) {
  const w = win ? `fill="${win}"` : '';
  const windows = (x0, y0, cols, rows, dx, dy) => {
    if (!win) return '';
    let o = '';
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++)
        if ((i * 7 + j * 3) % 4) o += `<rect x="${x0 + i * dx}" y="${y0 + j * dy}" width="${dx * 0.45}" height="${dy * 0.5}" ${w} opacity=".85"/>`;
    return o;
  };
  return `<g transform="translate(${x},${baseY}) scale(${s})">
    <g fill="${col}">
      <!-- Stalin skyscraper -->
      <rect x="0" y="-180" width="120" height="180"/><rect x="25" y="-260" width="70" height="90"/><rect x="40" y="-320" width="40" height="70"/>
      <polygon points="50,-320 60,-400 70,-320"/><circle cx="60" cy="-404" r="5"/>
      <rect x="-40" y="-120" width="40" height="120"/><rect x="120" y="-120" width="40" height="120"/>
      <!-- blocks -->
      <rect x="180" y="-140" width="70" height="140"/><rect x="260" y="-100" width="60" height="100"/>
      <!-- Ostankino -->
      <polygon points="350,0 362,-160 368,-160 380,0"/><rect x="362" y="-360" width="6" height="200"/><ellipse cx="365" cy="-250" rx="12" ry="6"/><rect x="363.5" y="-430" width="3" height="70"/>
      <!-- Moscow City -->
      <polygon points="420,0 420,-260 450,-280 470,-260 470,0"/>
      <polygon points="480,0 480,-330 500,-360 520,-330 520,0"/>
      <polygon points="530,0 535,-240 565,-250 570,0"/>
      <rect x="580" y="-190" width="50" height="190"/>
      <rect x="640" y="-120" width="80" height="120"/>
    </g>
    ${windows(8, -170, 8, 9, 14, 18)}${windows(188, -130, 4, 6, 16, 20)}${windows(426, -250, 3, 12, 14, 20)}${windows(486, -320, 2, 15, 16, 20)}${windows(586, -180, 3, 8, 15, 22)}
  </g>`;
}

export function mountains(w, baseY, cols = ['#9bb7d9', '#b9cde6'], snow = true) {
  const far = `M0,${baseY} L0,${baseY - 140} L120,${baseY - 260} L220,${baseY - 180} L340,${baseY - 330} L470,${baseY - 200} L600,${baseY - 300} L720,${baseY - 190} L860,${baseY - 350} L1000,${baseY - 220} L1140,${baseY - 310} L1290,${baseY - 180} L1420,${baseY - 290} L1560,${baseY - 200} L1700,${baseY - 340} L1850,${baseY - 210} L2000,${baseY - 300} L2200,${baseY - 200} L${w},${baseY - 250} L${w},${baseY} Z`;
  const snowCaps = snow
    ? [[340, 330], [860, 350], [1700, 340], [600, 300], [1140, 310]]
        .filter(([x]) => x < w)
        .map(([x, h]) => `<path d="M${x - 40},${baseY - h + 50} L${x},${baseY - h} L${x + 42},${baseY - h + 52} L${x + 20},${baseY - h + 44} L${x + 6},${baseY - h + 58} L${x - 14},${baseY - h + 44} Z" fill="#fff" opacity=".9"/>`)
        .join('')
    : '';
  const near = `M0,${baseY} L0,${baseY - 80} C120,${baseY - 160} 220,${baseY - 120} 330,${baseY - 170} C460,${baseY - 220} 560,${baseY - 120} 700,${baseY - 150} C840,${baseY - 180} 940,${baseY - 110} 1080,${baseY - 160} C1220,${baseY - 210} 1330,${baseY - 120} 1480,${baseY - 140} C1620,${baseY - 160} 1760,${baseY - 100} 1900,${baseY - 150} C2040,${baseY - 190} 2140,${baseY - 120} ${w},${baseY - 130} L${w},${baseY} Z`;
  return `<path d="${far}" fill="${cols[1]}"/>${snowCaps}<path d="${near}" fill="${cols[0]}"/>`;
}

export function palm(x, y, s = 1, col = '#3f9a5a') {
  const leaf = (rot) =>
    `<path d="M0,0 C30,-30 80,-34 120,-10 C80,-18 40,-12 0,0 Z" fill="${col}" transform="rotate(${rot})"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M-8,0 C-14,-80 -4,-170 10,-240 L22,-238 C10,-170 4,-80 10,0 Z" fill="#9b6b43"/>
    ${[-200, -160, -120, -80, -40].map((yy) => `<path d="M${-6 + (yy + 200) * -0.02},${yy} q10,6 20,0" stroke="#7d5232" stroke-width="3" fill="none"/>`).join('')}
    <g transform="translate(16,-240)">${[-170, -140, -110, -60, -25, 10, 35].map(leaf).join('')}
    <circle cx="-4" cy="6" r="8" fill="#7d5232"/><circle cx="8" cy="8" r="8" fill="#6d4628"/></g>
  </g>`;
}

export function pottedPlant(x, y, s = 1, pot = '#e98a6b') {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="0" cy="2" rx="34" ry="6" fill="#000" opacity=".12"/>
    <path d="M-26,-50 L26,-50 L20,0 L-20,0 Z" fill="${pot}"/><rect x="-30" y="-58" width="60" height="12" rx="4" fill="${pot}"/>
    <path d="M0,-58 C-10,-90 -40,-110 -52,-104 C-40,-96 -20,-80 -6,-58 Z" fill="#4caf72"/>
    <path d="M0,-58 C6,-100 30,-128 44,-124 C34,-110 18,-90 6,-58 Z" fill="#3e9a63"/>
    <path d="M0,-58 C-4,-110 4,-140 12,-150 C14,-120 8,-90 4,-58 Z" fill="#58c283"/>
    <path d="M0,-58 C20,-80 50,-84 60,-74 C44,-70 24,-66 4,-56 Z" fill="#4caf72"/>
  </g>`;
}

export function floorPlanks(w, y0, y1, a = '#d9a877', b = '#c9925f') {
  let s = `<rect x="0" y="${y0}" width="${w}" height="${y1 - y0}" fill="${a}"/>`;
  const rows = 6;
  for (let i = 1; i <= rows; i++) {
    const y = y0 + ((y1 - y0) * i * i) / (rows * rows);
    s += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${b}" stroke-width="2"/>`;
  }
  for (let x = -400; x < w + 400; x += 120) {
    s += `<line x1="${x}" y1="${y0}" x2="${x + (x - w / 2) * 0.35}" y2="${y1}" stroke="${b}" stroke-width="1.5" opacity=".6"/>`;
  }
  return s;
}

export function shadowEllipse(cx, cy, rx, ry = 10, op = 0.15) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity="${op}"/>`;
}

export function stringLights(x0, x1, y, sag = 30) {
  let s = `<path d="M${x0},${y} Q${(x0 + x1) / 2},${y + sag * 2} ${x1},${y}" fill="none" stroke="#6b5a4a" stroke-width="2"/>`;
  const cols = ['#ffd36b', '#ff9ec0', '#9be3ff', '#c6ff9b'];
  const n = Math.round((x1 - x0) / 40);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    const yy = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + sag * 2) + t * t * y;
    s += `<circle cx="${x}" cy="${yy + 8}" r="12" fill="${cols[i % 4]}" opacity=".25" class="glow"/><circle cx="${x}" cy="${yy + 8}" r="5.5" fill="${cols[i % 4]}"/>`;
  }
  return s;
}

export function mandarinTree(x, y, s = 1, fruit = true) {
  let fruits = '';
  if (fruit) {
    const pts = [[-60, -190], [-20, -230], [30, -200], [70, -170], [-80, -140], [-30, -160], [20, -140], [60, -120], [0, -260], [-50, -110], [40, -240], [90, -200]];
    fruits = pts.map(([fx, fy]) => `<circle cx="${fx}" cy="${fy}" r="13" fill="#ff9a2e"/><circle cx="${fx - 4}" cy="${fy - 4}" r="4" fill="#ffc77a"/>`).join('');
  }
  return `<g transform="translate(${x},${y}) scale(${s})">
    ${shadowEllipse(0, 0, 110, 16, 0.18)}
    <path d="M-12,0 C-10,-40 -14,-80 -6,-110 L8,-110 C14,-80 10,-40 12,0 Z" fill="#8a5a36"/>
    <path d="M-4,-90 C-30,-110 -50,-120 -60,-140 M4,-96 C30,-120 50,-130 64,-150" stroke="#8a5a36" stroke-width="9" fill="none" stroke-linecap="round"/>
    <circle cx="-70" cy="-160" r="62" fill="#3f9152"/><circle cx="66" cy="-166" r="64" fill="#3f9152"/>
    <circle cx="0" cy="-210" r="80" fill="#4ca862"/><circle cx="-40" cy="-230" r="40" fill="#5bbd70" opacity=".7"/>
    <circle cx="30" cy="-140" r="50" fill="#47a05c"/>
    ${fruits}
  </g>`;
}

export function frame(x, y, w, h, inner, border = '#fff') {
  return `<g transform="translate(${x},${y})"><rect x="-6" y="-6" width="${w + 12}" height="${h + 12}" rx="6" fill="${border}"/><rect width="${w}" height="${h}" rx="3" fill="#ffe9d6"/>${inner}</g>`;
}
