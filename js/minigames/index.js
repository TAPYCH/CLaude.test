import { runMinigame } from './framework.js';

const LOADERS = {
  crown: () => import('./crown.js'),
  mandarins: () => import('./mandarins.js'),
  shells: () => import('./shells.js'),
  barista: () => import('./barista.js'),
  memory: () => import('./memory.js'),
  runner: () => import('./runner.js'),
  petplay: () => import('./petplay.js'),
  quiz: () => import('./quiz.js'),
  khachapuri: () => import('./khachapuri.js'),
  dance: () => import('./dance.js'),
  fashion: () => import('./fashion.js'),
  puzzle: () => import('./puzzle.js'),
};

export async function playMinigame(id, opts) {
  const mod = await LOADERS[id]();
  return runMinigame(mod.default, opts);
}
