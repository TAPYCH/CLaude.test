// Scene registry + city data.
import * as dorm from '../art/scenes/dorm.js';
import * as college from '../art/scenes/college.js';
import * as cafe from '../art/scenes/cafe.js';
import * as park from '../art/scenes/park.js';
import * as mall from '../art/scenes/mall.js';
import * as home from '../art/scenes/home.js';
import * as beach from '../art/scenes/beach.js';
import * as garden from '../art/scenes/garden.js';

const mk = (m) => ({ ...m.SCENE, paint: m.paint });

export const SCENES = Object.fromEntries([dorm, college, cafe, park, mall, home, beach, garden].map((m) => [m.SCENE.id, mk(m)]));

export const CITIES = {
  moscow: { name: 'Москва', emoji: '🏙️', home: 'dorm' },
  abkhazia: { name: 'Абхазия', emoji: '🌴', home: 'home' },
};
