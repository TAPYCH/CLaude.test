// Everything Lana can do. Effects are totals applied smoothly over the action.
// minutes – in-game duration; cost – ₽; xp – skill experience; anim – body animation class.
import { S } from '../core/state.js';
import { isWeekend, isHoliday } from '../core/time.js';
import { changeGrades } from '../core/state.js';
import { QUESTS } from './quests.js';

const currentQuestId = () => (QUESTS[S.quest.index] || {}).id;

const hour = () => S.minutes / 60;
const between = (a, b) => hour() >= a && hour() < b;
const cooldown = (key, hours) => {
  const last = S.flags['cd_' + key];
  if (last == null) return null;
  const left = last + hours * 60 - (S.day * 1440 + S.minutes);
  return left > 0 ? `Можно через ${Math.ceil(left / 60)} ч` : null;
};

export const ACTIONS = {
  // ---------------------------------------------------------------- sleep & rest
  sleep: { name: 'Спать', icon: '😴', special: 'sleep', desc: 'До утра или пока не выспится' },
  nap: { name: 'Вздремнуть', icon: '💤', minutes: 90, effects: { energy: 26, fun: 3 }, anim: 'rest', decayMul: 0.4 },
  phoneScroll: { name: 'Листать ленту', icon: '📱', minutes: 30, effects: { fun: 10, social: 6, energy: -2 }, anim: 'rest' },
  window: { name: 'Смотреть в окно', icon: '🌆', minutes: 15, effects: { fun: 6, energy: 2 } },
  balcony: { name: 'Смотреть на море', icon: '🌊', minutes: 30, effects: { fun: 14, energy: 4, social: -1 } },

  // ---------------------------------------------------------------- style
  wardrobe: { name: 'Гардероб', icon: '👗', special: 'wardrobe', instant: true, desc: 'Переодеться' },
  selfie: { name: 'Селфи', icon: '🤳', minutes: 10, effects: { fun: 8 }, special: 'selfie', xp: { charm: 6 } },
  makeup: { name: 'Накраситься', icon: '💄', minutes: 20, effects: { fun: 6 }, xp: { charm: 12 }, anim: 'busy' },

  // ---------------------------------------------------------------- food
  snack: {
    name: 'Перекусить', icon: '🥪', minutes: 10, effects: { hunger: 18 }, anim: 'busy', uses: { snacks: 1 },
    req: () => (S.inventory.snacks > 0 ? null : 'Нет перекуса — купи в магазине'),
  },
  eatMeal: {
    name: 'Поесть домашнего', icon: '🍲', minutes: 25, effects: { hunger: 45, fun: 4 }, anim: 'busy', uses: { meals: 1 },
    req: () => ((S.inventory.meals || 0) > 0 ? null : 'Сначала приготовь еду'),
  },
  cook: {
    name: 'Приготовить ужин', icon: '🍳', minutes: 60, effects: { hunger: 35, fun: 6, energy: -4 }, xp: { cooking: 28 }, anim: 'busy',
    uses: { groceries: 1 }, gives: { meals: 2 },
    req: () => (S.inventory.groceries > 0 ? null : 'Нет продуктов — загляни в ТЦ или закажи доставку'),
  },
  tea: { name: 'Чай с мёдом', icon: '🍵', minutes: 10, effects: { energy: 5, fun: 4 } },
  mamaFood: { name: 'Мамина еда', icon: '🥘', minutes: 40, effects: { hunger: 65, fun: 12, social: 8 }, anim: 'busy', desc: 'Хачапури, мамалыга и аджика' },
  helpCook: { name: 'Готовить с мамой', icon: '🫓', minutes: 90, effects: { hunger: 30, social: 25, fun: 8, energy: -6 }, xp: { cooking: 45 }, anim: 'busy' },
  foodcourt: { name: 'Поесть в фудкорте', icon: '🍜', minutes: 30, cost: 450, effects: { hunger: 50, fun: 6 }, anim: 'busy' },
  coffeeDessert: { name: 'Капучино и круассан', icon: '🥐', minutes: 30, cost: 350, effects: { hunger: 22, energy: 16, fun: 10 }, anim: 'busy' },
  vending: { name: 'Кофе из автомата', icon: '☕', minutes: 5, cost: 80, effects: { energy: 12 } },
  icecream: { name: 'Мороженое', icon: '🍦', minutes: 10, cost: 150, effects: { hunger: 8, fun: 15 } },
  sandCoffee: { name: 'Кофе на песке', icon: '☕', minutes: 20, cost: 120, effects: { energy: 16, fun: 8 }, desc: 'Абхазская классика' },
  grandmaTea: { name: 'Чай с бабушкой', icon: '🫖', minutes: 45, effects: { social: 30, hunger: 18, fun: 10 } },

  // ---------------------------------------------------------------- hygiene
  shower: { name: 'Принять душ', icon: '🚿', minutes: 20, effects: { hygiene: 75, energy: 3, fun: 3 }, special: 'shower', anim: 'away' },
  brushTeeth: { name: 'Почистить зубы', icon: '🪥', minutes: 5, effects: { hygiene: 12 }, xp: { dental: 3 }, desc: 'Будущий зубной техник!' },

  // ---------------------------------------------------------------- study & career
  study: { name: 'Учить конспекты', icon: '📖', minutes: 120, effects: { energy: -10, fun: -8 }, xp: { dental: 34 }, anim: 'busy', bonusKey: 'study', after: () => !S.flags.diploma && changeGrades(2) },
  lecture: {
    name: 'Сходить на пары', icon: '🎓', minutes: 180, effects: { energy: -12, fun: -4, social: 14 }, xp: { dental: 48 }, anim: 'busy', bonusKey: 'study',
    req: () =>
      S.flags.diploma ? 'Ты уже окончила колледж 🎓'
      : isHoliday(S.day) ? 'Каникулы! Пар нет 🎉'
      : isWeekend(S.day) ? 'Сегодня выходной 🎉'
      : S.flags.lectureDay === S.day ? 'На сегодня пары уже были'
      : between(8, 15) ? null : 'Пары идут с 9:00 до 15:00',
    after: () => {
      S.attendance++;
      S.flags.lectureDay = S.day;
      changeGrades(6);
    },
  },
  typodont: { name: 'Тренировка: коронка', icon: '🦷', minigame: 'crown', minutes: 60, desc: 'Мини-игра' },
  practice: { name: 'Практика в лаборатории', icon: '🦷', minigame: 'crown', minutes: 90, desc: 'Мини-игра · главный навык' },
  memory: { name: 'Мемори: инструменты', icon: '🃏', minigame: 'memory', minutes: 30, desc: 'Мини-игра' },
  puzzle: { name: 'Пазл из открытки', icon: '🧩', minigame: 'puzzle', minutes: 30, desc: 'Мини-игра · отдых', req: () => (S.postcards.length ? null : 'Сначала привези открытку с экскурсии 🖼️') },
  consult: { name: 'Консультация', icon: '👩‍🏫', minutes: 30, effects: { social: 8 }, xp: { dental: 18 }, req: () => cooldown('consult', 20), cooldown: 'consult', after: () => !S.flags.diploma && changeGrades(2) },
  exam: { name: 'Сдать экзамен', icon: '📜', special: 'exam', minutes: 120, desc: 'Финальный экзамен' },
  friendChat: { name: 'Поболтать с Катей', icon: '💬', minutes: 30, effects: { social: 28, fun: 10 }, xp: { charm: 10 } },
  work: {
    name: 'Смена бариста', icon: '☕', minigame: 'barista', minutes: 240, desc: 'Мини-игра · зарплата',
    req: () => (between(7, 21) ? null : 'Кофейня открыта с 7:00 до 21:00'),
  },
  chatGuests: { name: 'Болтать с гостями', icon: '🗨️', minutes: 30, effects: { social: 20, fun: 6 }, xp: { charm: 14 } },
  orders: { name: 'Заказы лаборатории', icon: '💼', minigame: 'crown', minutes: 120, desc: 'Своя лаборатория · ₽₽₽', req: () => (S.flags.diploma ? null : 'Нужен диплом') },

  // ---------------------------------------------------------------- outdoors & fun
  run: { name: 'Пробежка', icon: '🏃‍♀️', minigame: 'runner', minutes: 45, desc: 'Мини-игра' },
  bench: { name: 'Посидеть на лавочке', icon: '🪑', minutes: 30, effects: { fun: 12, energy: 5 } },
  ducks: { name: 'Покормить уток', icon: '🦆', minutes: 20, effects: { fun: 16 }, cost: 40 },
  walkPet: { name: 'Гулять с питомцем', icon: '🐾', minutes: 40, effects: { fun: 16, energy: -4 }, xp: { fitness: 12 }, special: 'walkPet', req: () => (S.pets.length ? null : 'Сначала заведи питомца') },
  swim: { name: 'Нырять за ракушками', icon: '🐚', minigame: 'shells', minutes: 60, desc: 'Мини-игра' },
  sunbathe: { name: 'Загорать', icon: '🏖️', minutes: 60, effects: { fun: 16, energy: 6, hygiene: -6 }, bonusKey: 'beach', anim: 'rest' },
  promenade: { name: 'Гулять по набережной', icon: '🌴', minutes: 40, effects: { fun: 14, energy: -3 }, xp: { fitness: 10 } },
  harvest: { name: 'Собирать мандарины', icon: '🍊', minigame: 'mandarins', minutes: 90, desc: 'Мини-игра · ₽' },
  swing: { name: 'Качели', icon: '🌳', minutes: 20, effects: { fun: 14 } },
  feedChickens: { name: 'Покормить кур', icon: '🐔', minutes: 15, effects: { fun: 8 }, xp: { fitness: 3 } },

  // ---------------------------------------------------------------- social
  callMom: { name: 'Позвонить маме', icon: '📞', minutes: 30, effects: { social: 30, fun: 8 }, req: () => (S.city === 'abkhazia' ? 'Мама рядом — просто обними её 🤗' : cooldown('callMom', 8)), cooldown: 'callMom' },
  momTalk: { name: 'Поболтать с мамой', icon: '🤗', minutes: 40, effects: { social: 38, fun: 12 }, special: 'momTalk' },
  amraChat: { name: 'Болтать с Амрой', icon: '👯‍♀️', minutes: 40, effects: { social: 34, fun: 14 }, xp: { charm: 10 } },
  grandmaTalk: { name: 'Обнять бабушку', icon: '👵', minutes: 15, effects: { social: 16, fun: 6 } },

  // ---------------------------------------------------------------- story & progression
  callLover: {
    name: 'Видеозвонок любимому', icon: '📹', minutes: 40, effects: { social: 40, fun: 22 }, cooldown: 'callLover',
    req: () => cooldown('callLover', 10),
  },
  quiz: { name: 'Коллоквиум (тест)', icon: '📝', minigame: 'quiz', minutes: 45, desc: 'Мини-игра · успеваемость', req: () => (S.flags.diploma ? 'Ты уже дипломированный техник 🎓' : null) },
  khachapuri: { name: 'Хачапури с мамой', icon: '🫓', minigame: 'khachapuri', minutes: 90, desc: 'Мини-игра · кулинария' },
  dance: { name: 'Танцы на набережной', icon: '💃', minigame: 'dance', minutes: 60, desc: 'Мини-игра · обаяние', req: () => (between(16, 24) || between(0, 2) ? null : 'Танцы начинаются в 16:00') },
  danceParty: { name: 'Танцевать', icon: '💃', minigame: 'dance', minutes: 60, desc: 'Мини-игра · обаяние' },
  fashionShow: {
    name: 'Фотосессия «Образ недели»', icon: '📸', minigame: 'fashion', minutes: 90, desc: 'Мини-игра · призы',
    req: () => (S.flags.fashionWeek === Math.floor(S.day / 7) ? 'Фотосессия раз в неделю — приходи на следующей' : null),
    after: () => { S.flags.fashionWeek = Math.floor(S.day / 7); },
  },
  olympiad: {
    name: 'Олимпиада по моделированию', icon: '🏅', special: 'olympiad', minutes: 120, desc: 'Коронка на 3 звезды',
    req: () => {
      const q = currentQuestId();
      if (S.flags.olympiadWon) return 'Ты уже победила 🏅';
      return q === 'olympiad' ? null : 'Откроется по сюжету (глава «Сессия»)';
    },
  },
  vikaChat: { name: 'Поболтать с Викой', icon: '☕', minutes: 20, effects: { social: 18, fun: 6 }, xp: { charm: 8 } },
  labOrders: { name: 'Выполнить заказ', icon: '🦷', minigame: 'crown', minutes: 120, desc: 'Мини-игра · ₽₽₽', req: () => (S.lab.owned ? null : 'Сначала арендуй помещение') },
  labShop: { name: 'Каталог оборудования', icon: '🔧', special: 'labShop', instant: true },
  labRest: { name: 'Кофе-брейк', icon: '☕', minutes: 20, effects: { energy: 14, fun: 8 } },
  grandOpening: {
    name: 'Праздник открытия', icon: '🎉', special: 'opening', minutes: 180,
    req: () => {
      if (S.flags.opened) return 'Открытие уже было — лаборатория работает! ✨';
      if (currentQuestId() !== 'opening') return 'Сначала подготовь лабораторию (сюжет)';
      return (S.lab.orders || 0) >= 3 ? null : `Сначала выполни 3 заказа здесь (${S.lab.orders || 0}/3)`;
    },
  },

  // ---------------------------------------------------------------- shops
  onlineShop: { name: 'Онлайн-магазин', icon: '🛍️', special: 'shop', instant: true },
  boutique: { name: 'Бутик одежды', icon: '👗', special: 'shop', shopTab: 'clothes', instant: true },
  salon: { name: 'Салон красоты', icon: '💇‍♀️', special: 'shop', shopTab: 'salon', instant: true },
  petshop: { name: 'Зоомагазин', icon: '🐾', special: 'shop', shopTab: 'pets', instant: true },
  grocery: { name: 'Продукты', icon: '🛒', special: 'shop', shopTab: 'food', instant: true },
};
