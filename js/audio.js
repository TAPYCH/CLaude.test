// Procedural audio: every sound and the music are synthesised with WebAudio — no files.
let ctx = null;
let master, sfxBus, musicBus;
let enabled = { sound: true, music: true };

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.55;
  sfxBus.connect(master);
  musicBus = ctx.createGain();
  musicBus.gain.value = 0;
  musicBus.connect(master);
  // soft reverb-ish echo for music
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.28;
  const fb = ctx.createGain();
  fb.gain.value = 0.25;
  const wet = ctx.createGain();
  wet.gain.value = 0.25;
  musicBus.connect(delay);
  delay.connect(fb);
  fb.connect(delay);
  delay.connect(wet);
  wet.connect(master);
  return ctx;
}

export function unlockAudio() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume();
}

export function setAudio(opts) {
  enabled = { ...enabled, ...opts };
  if (!ctx) return;
  musicBus.gain.setTargetAtTime(enabled.music && currentTheme ? 0.16 : 0, ctx.currentTime, 0.4);
}

function tone({ freq = 440, type = 'sine', dur = 0.15, vol = 0.3, at = 0, attack = 0.005, slide = 0, bus = null, release = null }) {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (release || dur));
  o.connect(g);
  g.connect(bus || sfxBus);
  o.start(t);
  o.stop(t + (release || dur) + 0.05);
}

function noise({ dur = 0.2, vol = 0.2, at = 0, filter = 1200, type = 'lowpass' }) {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + at;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = filter;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f);
  f.connect(g);
  g.connect(sfxBus);
  src.start(t);
}

const N = (n) => 440 * Math.pow(2, (n - 69) / 12); // midi → Hz

const SFX = {
  click: () => tone({ freq: 880, type: 'triangle', dur: 0.06, vol: 0.18 }),
  pop: () => tone({ freq: 520, type: 'sine', dur: 0.12, vol: 0.3, slide: 500 }),
  tap: () => tone({ freq: 660, type: 'triangle', dur: 0.05, vol: 0.14 }),
  coin: () => {
    tone({ freq: N(88), type: 'square', dur: 0.08, vol: 0.09 });
    tone({ freq: N(93), type: 'square', dur: 0.22, vol: 0.09, at: 0.07 });
  },
  success: () => [72, 76, 79, 84].forEach((n, i) => tone({ freq: N(n), type: 'triangle', dur: 0.25, vol: 0.22, at: i * 0.09 })),
  fanfare: () => {
    [67, 72, 76, 79, 84].forEach((n, i) => tone({ freq: N(n), type: 'triangle', dur: 0.35, vol: 0.22, at: i * 0.11 }));
    [72, 76, 79].forEach((n) => tone({ freq: N(n), type: 'sine', dur: 0.9, vol: 0.12, at: 0.6 }));
  },
  fail: () => [64, 60, 55].forEach((n, i) => tone({ freq: N(n), type: 'sawtooth', dur: 0.18, vol: 0.08, at: i * 0.12 })),
  bad: () => tone({ freq: 200, type: 'square', dur: 0.15, vol: 0.12, slide: -120 }),
  catch: () => tone({ freq: N(84 + Math.floor(Math.random() * 5)), type: 'sine', dur: 0.12, vol: 0.25 }),
  levelup: () => [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => tone({ freq: N(n), type: 'triangle', dur: 0.2, vol: 0.18, at: i * 0.06 })),
  message: () => {
    tone({ freq: N(83), type: 'sine', dur: 0.12, vol: 0.22 });
    tone({ freq: N(88), type: 'sine', dur: 0.2, vol: 0.22, at: 0.1 });
  },
  whoosh: () => noise({ dur: 0.35, vol: 0.25, filter: 900, type: 'bandpass' }),
  splash: () => noise({ dur: 0.5, vol: 0.3, filter: 1800 }),
  camera: () => {
    noise({ dur: 0.08, vol: 0.4, filter: 4000, type: 'highpass' });
    noise({ dur: 0.1, vol: 0.3, filter: 3000, type: 'highpass', at: 0.09 });
  },
  step: () => tone({ freq: 180 + Math.random() * 40, type: 'sine', dur: 0.04, vol: 0.05 }),
  scrape: () => noise({ dur: 0.06, vol: 0.08, filter: 2500, type: 'bandpass' }),
  shine: () => [96, 100, 103].forEach((n, i) => tone({ freq: N(n), type: 'sine', dur: 0.1, vol: 0.08, at: i * 0.04 })),
  purr: () => tone({ freq: 60, type: 'sawtooth', dur: 0.6, vol: 0.06, attack: 0.1 }),
  woof: () => tone({ freq: 300, type: 'square', dur: 0.12, vol: 0.12, slide: -150 }),
  kick: () => tone({ freq: 140, type: 'sine', dur: 0.16, vol: 0.4, slide: -95 }),
  hat: () => noise({ dur: 0.04, vol: 0.06, filter: 7000, type: 'highpass' }),
  snare: () => noise({ dur: 0.12, vol: 0.14, filter: 2400, type: 'bandpass' }),
  train: () => {
    tone({ freq: N(74), type: 'square', dur: 0.5, vol: 0.06, attack: 0.05 });
    tone({ freq: N(78), type: 'square', dur: 0.5, vol: 0.06, attack: 0.05 });
  },
};

export function sfx(name) {
  if (!enabled.sound) return;
  const fn = SFX[name];
  if (!fn) return;
  try {
    ensure();
    fn();
  } catch (e) {
    /* audio is best-effort */
  }
}

/** A single musical note (MIDI number) — used by rhythm games. */
export function playNote(n, { dur = 0.22, vol = 0.2, type = 'triangle' } = {}) {
  if (!enabled.sound) return;
  try {
    ensure();
    tone({ freq: N(n), type, dur, vol });
  } catch (e) {
    /* best-effort */
  }
}

// ---------------------------------------------------------------- music
const THEMES = {
  moscow: { bpm: 84, root: 65, prog: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]], wave: 'triangle', mel: [12, 16, 19, 16, 14, 12, 11, 7] },
  abkhazia: { bpm: 76, root: 62, prog: [[0, 4, 7], [5, 9, 12], [-3, 0, 4], [7, 11, 14]], wave: 'sine', mel: [16, 14, 12, 11, 12, 7, 9, 12] },
  game: { bpm: 120, root: 67, prog: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]], wave: 'square', mel: [12, 16, 19, 24, 19, 16, 14, 16] },
  night: { bpm: 60, root: 57, prog: [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]], wave: 'sine', mel: [12, 15, 19, 15, 14, 12, 10, 7] },
};

let currentTheme = null;
let timer = null;
let step = 0;
let nextTime = 0;

export function playMusic(theme) {
  if (theme === currentTheme) return;
  const c = ensure();
  currentTheme = theme;
  if (!c) return;
  if (!theme) {
    musicBus.gain.setTargetAtTime(0, c.currentTime, 0.3);
    return;
  }
  musicBus.gain.setTargetAtTime(enabled.music ? 0.16 : 0, c.currentTime, 0.6);
  if (!timer) {
    nextTime = c.currentTime + 0.1;
    timer = setInterval(schedule, 90);
  }
}

function schedule() {
  if (!ctx || !currentTheme) return;
  if (!enabled.music || document.hidden) {
    nextTime = ctx.currentTime + 0.1;
    return;
  }
  const th = THEMES[currentTheme];
  const spb = 60 / th.bpm / 2; // eighth notes
  while (nextTime < ctx.currentTime + 0.3) {
    const bar = Math.floor(step / 8) % th.prog.length;
    const chord = th.prog[bar];
    const at = nextTime - ctx.currentTime;
    const beat = step % 8;
    // bass on 1 and 5
    if (beat === 0 || beat === 4) tone({ freq: N(th.root - 12 + chord[0]), type: 'sine', dur: spb * 3.5, vol: 0.32, at, bus: musicBus, attack: 0.02 });
    // arpeggio
    const arp = chord[[0, 1, 2, 1][beat % 4]] + 12;
    tone({ freq: N(th.root + arp), type: th.wave === 'square' ? 'triangle' : th.wave, dur: spb * 1.6, vol: 0.1, at, bus: musicBus, attack: 0.01 });
    // melody every other bar, sparse
    if (Math.floor(step / 8) % 2 === 1 && beat % 2 === 0) {
      const m = th.mel[(beat / 2 + bar * 2) % th.mel.length];
      tone({ freq: N(th.root + m), type: 'sine', dur: spb * 2.4, vol: 0.13, at, bus: musicBus, attack: 0.02 });
    }
    // chime sparkle
    if (beat === 7 && Math.random() < 0.35) tone({ freq: N(th.root + 31), type: 'sine', dur: 0.6, vol: 0.05, at, bus: musicBus });
    nextTime += spb;
    step++;
  }
}
