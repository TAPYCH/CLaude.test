// Story: chapters → main quests, NPC side requests, daily tasks and long-term dreams.
// goal: { type, ...params, count } — checked by core/progress.js
//   event goals:  action{ids} · minigame{id,stars,score,mode} · buy · adopt · travel{to} · reply{who} · pet · exam
//   state goals:  skill{id,level} · postcards{ids} · need{id,value} · money{value} · grades{value} · flag{flag} · stat{key,value}

export const CHAPTERS = [
  { n: 1, title: 'Москва, сентябрь', sub: 'Новый семестр — новая жизнь', icon: '🏙️', scene: 'dorm', dialogue: 'ch1' },
  { n: 2, title: 'Своя копейка', sub: 'Подработка, обновки и пушистый друг', icon: '☕', scene: 'cafe', dialogue: 'ch2' },
  { n: 3, title: 'Домой, в Абхазию', sub: 'Море, мандарины и мамины хачапури', icon: '🌴', scene: 'home', dialogue: 'ch3' },
  { n: 4, title: 'Сессия', sub: 'Экзамен решает всё', icon: '📚', scene: 'college', dialogue: 'ch4' },
  { n: 5, title: 'Своё дело', sub: 'Мечта о своей лаборатории в Сухуме', icon: '💼', scene: 'home', dialogue: 'ch5' },
];

export const QUESTS = [
  // ============================================================ ГЛАВА 1
  {
    id: 'breakfast', chapter: 1, target: { scene: 'dorm', hotspot: 'fridge' }, icon: '🥪', title: 'Доброе утро, Лана!',
    desc: 'Позавтракай: нажми на холодильник и выбери «Перекусить».',
    hint: 'Холодильник — справа в комнате',
    goal: { type: 'action', ids: ['snack', 'eatMeal', 'cook', 'mamaFood', 'coffeeDessert', 'foodcourt'], count: 1 },
    reward: { money: 200 },
    from: { who: 'mom', text: 'Доченька, ты покушала? Не забывай завтракать! 💛' },
  },
  {
    id: 'lecture', chapter: 1, target: { scene: 'college', hotspot: 'board' }, icon: '🎓', title: 'Первая пара',
    desc: 'Сходи на пары в медколледж (будни, 9:00–15:00). Пары поднимают успеваемость и зуботехнику.',
    hint: 'Телефон → Карта → Медколледж',
    goal: { type: 'action', ids: ['lecture'], count: 1 },
    reward: { money: 500, xp: { dental: 20 } },
    from: { who: 'katya', text: 'Лан, ты где? Пара по материаловедению через 10 минут! 🏃‍♀️' },
  },
  {
    id: 'crown', chapter: 1, target: { scene: 'college', hotspot: 'bench' }, icon: '🦷', title: 'Первая коронка',
    desc: 'Сделай коронку в зуботехнической лаборатории колледжа.',
    hint: 'Медколледж → Лабораторный стол → Практика',
    goal: { type: 'minigame', id: 'crown', stars: 1, count: 1 },
    reward: { money: 700, xp: { dental: 40 } },
    from: { who: 'teacher', text: 'Лана, сегодня практика по моделированию коронок. Жду в лаборатории!' },
  },
  {
    id: 'dinner', chapter: 1, target: { scene: 'dorm', hotspot: 'stove' }, icon: '🍳', title: 'Студенческий ужин',
    desc: 'Хватит перекусов! Приготовь настоящий ужин на плитке в общежитии.',
    hint: 'Общежитие → Плитка → Приготовить ужин',
    goal: { type: 'action', ids: ['cook'], count: 1 },
    reward: { money: 300, xp: { cooking: 20 } },
    from: { who: 'mom', text: 'Ты там одними бутербродами питаешься? Приготовь что-нибудь горячее! 🍲' },
  },
  {
    id: 'callLover', chapter: 1, icon: '💌', title: 'Голос любимого',
    desc: 'Позвони любимому по видеосвязи — например, перед сном с кровати.',
    hint: 'Кровать / диван / лавочка → Видеозвонок',
    goal: { type: 'action', ids: ['callLover'], count: 1 },
    reward: { money: 200 },
    from: { who: 'lover', text: 'Позвони мне вечером, хочу тебя увидеть 🥺' },
  },
  // ============================================================ ГЛАВА 2
  {
    id: 'barista', chapter: 2, target: { scene: 'cafe', hotspot: 'counter' }, icon: '☕', title: 'Кофе и копеечка',
    desc: 'Студенческая жизнь требует денег. Отработай смену бариста в кофейне «Пенка».',
    hint: 'Карта → Кофейня «Пенка» → Стойка',
    goal: { type: 'minigame', id: 'barista', stars: 0, count: 1 },
    reward: { money: 300, xp: { charm: 30 } },
    from: { who: 'katya', text: 'В «Пенке» ищут бариста на подработку, ты же хотела! ☕' },
  },
  {
    id: 'fashion', chapter: 2, icon: '🛍️', title: 'Модница',
    desc: 'Первая зарплата! Купи себе обновку — в ТЦ или онлайн.',
    hint: 'Телефон → Магазин → Одежда',
    goal: { type: 'buy', count: 1 },
    reward: { money: 400 },
    from: { who: 'amra', text: 'Ланааа, скинь фото нового образа! Скучаю 💕' },
  },
  {
    id: 'quiz', chapter: 2, target: { scene: 'college', hotspot: 'board' }, icon: '📝', title: 'Коллоквиум',
    desc: 'Катя предупреждает: завтра коллоквиум по анатомии зубов. Пройди тест хотя бы на 1 звезду.',
    hint: 'Медколледж → Лекция → Коллоквиум',
    goal: { type: 'minigame', id: 'quiz', stars: 1, count: 1 },
    reward: { money: 500, xp: { dental: 40 } },
    from: { who: 'katya', text: 'Коллоквиум по анатомии!!! Я ничего не знаю 😱 Ты готова?' },
  },
  {
    id: 'pet', chapter: 2, icon: '🐾', title: 'Пушистый друг',
    desc: 'В общежитии одиноко. Заведи питомца в зоомагазине «Хвостики».',
    hint: 'Телефон → Магазин → Питомцы',
    goal: { type: 'adopt', count: 1 },
    reward: { money: 300, petFood: 4 },
    from: { who: 'lover', text: 'Может, заведёшь котика? Будет кому мурчать, пока меня нет рядом 🐱' },
  },
  {
    id: 'ticket', chapter: 2, icon: '🎫', title: 'Копилка на билет',
    desc: 'Мама зовёт домой. Накопи 6 000 ₽ на билет до Сухума — смены в кофейне, практика, мини-игры.',
    hint: 'Работай в «Пенке» и не трать лишнего',
    goal: { type: 'money', value: 6000, count: 1 },
    reward: { money: 0 },
    from: { who: 'mom', text: 'Лана, когда домой? Мы все очень соскучились! 🌊' },
  },
  // ============================================================ ГЛАВА 3
  {
    id: 'home', chapter: 3, icon: '🚆', title: 'Домой!',
    desc: 'Купи билет и поезжай в Абхазию. Лучше на выходных — прогулы снижают успеваемость.',
    hint: 'Телефон → Карта → Абхазия → Билет',
    goal: { type: 'travel', to: 'abkhazia', count: 1 },
    reward: { money: 1000 },
  },
  {
    id: 'khachapuri', chapter: 3, target: { scene: 'home', hotspot: 'table' }, icon: '🫓', title: 'Мамин рецепт',
    desc: 'Испеки с мамой хачапури по её секретному рецепту.',
    hint: 'Дом в Сухуме → Мамин стол → Хачапури с мамой',
    goal: { type: 'minigame', id: 'khachapuri', stars: 1, count: 1 },
    reward: { money: 500, xp: { cooking: 50 } },
    from: { who: 'mom', text: 'Доча, научу тебя своим хачапури, пока ты дома! 🫓' },
  },
  {
    id: 'mandarins', chapter: 3, target: { scene: 'garden', hotspot: 'trees' }, icon: '🍊', title: 'Мандариновый сезон',
    desc: 'Помоги бабушке в саду: поймай 30 мандаринов за один сбор.',
    hint: 'Абхазия → Мандариновый сад',
    goal: { type: 'minigame', id: 'mandarins', score: 30, count: 1 },
    reward: { money: 600, item: 'flower' },
    from: { who: 'grandma', text: 'Внученька, мандарины поспели! Приходи в сад 🍊' },
  },
  {
    id: 'sea', chapter: 3, target: { scene: 'beach', hotspot: 'sea' }, icon: '🐚', title: 'Море зовёт',
    desc: 'Понырять за ракушками в Чёрном море.',
    hint: 'Абхазия → Пляж → Море',
    goal: { type: 'minigame', id: 'shells', stars: 0, count: 1 },
    reward: { money: 500, xp: { fitness: 30 } },
    from: { who: 'amra', text: 'Пошли на пляж! Вода ещё тёплая 🌊' },
  },
  {
    id: 'dance', chapter: 3, target: { scene: 'beach', hotspot: 'amra' }, icon: '💃', title: 'День рождения Амры',
    desc: 'У Амры праздник на набережной! Приходи вечером (после 16:00) и зажги на танцполе хотя бы на 1 звезду.',
    hint: 'Пляж → Амра → Танцы',
    goal: { type: 'minigame', id: 'dance', stars: 1, count: 1 },
    reward: { money: 600, xp: { charm: 40, fitness: 20 } },
    from: { who: 'amra', text: 'У меня ДР в субботу!!! Танцуем на набережной, ты обязана быть 💃🎉' },
  },
  {
    id: 'sights', chapter: 3, icon: '🏞️', title: 'Красоты Абхазии',
    desc: 'Собери открытки: съезди на озеро Рица и в Новый Афон.',
    hint: 'Карта Абхазии → экскурсии',
    goal: { type: 'postcards', ids: ['ritsa', 'afon'], count: 2 },
    reward: { money: 800 },
    from: { who: 'amra', text: 'Давай съездим на Рицу? Сто лет там не были! 🏔️' },
  },
  // ============================================================ ГЛАВА 4
  {
    id: 'return', chapter: 4, icon: '🏙️', title: 'Снова в Москву',
    desc: 'Каникулы кончились. Возвращайся в Москву — впереди сессия.',
    hint: 'Телефон → Карта → Москва → Билет',
    goal: { type: 'travel', to: 'moscow', count: 1 },
    reward: { money: 500 },
    from: { who: 'katya', text: 'Лана, сессия через месяц!!! Возвращайся, будем готовиться вместе 📚' },
  },
  {
    id: 'grades', chapter: 4, icon: '📈', title: 'Хорошая успеваемость',
    desc: 'Подними успеваемость до 60%: пары, конспекты, практика и коллоквиумы. Прогулы её снижают.',
    hint: 'Пары в будни · Учить конспекты · Тест',
    goal: { type: 'grades', value: 60, count: 1 },
    reward: { money: 800 },
    from: { who: 'teacher', text: 'Лана, до допуска к экзамену нужна успеваемость не ниже 60%.' },
  },
  {
    id: 'honors', chapter: 4, icon: '📚', title: 'Отличница',
    desc: 'Прокачай «Зуботехнику» до 5 уровня.',
    hint: 'Практика, тесты, конспекты, мемори',
    goal: { type: 'skill', id: 'dental', level: 5, count: 1 },
    reward: { money: 1000, item: 'glasses' },
  },
  {
    id: 'olympiad', chapter: 4, target: { scene: 'college', hotspot: 'teacher' }, icon: '🏅', title: 'Олимпиада',
    desc: 'Ирина Петровна заявила тебя на олимпиаду по моделированию. Сделай коронку на 3 звезды.',
    hint: 'Медколледж → Ирина Петровна → Олимпиада',
    goal: { type: 'minigame', id: 'crown', stars: 3, mode: 'olympiad', count: 1 },
    reward: { money: 3000, xp: { dental: 80 } },
    from: { who: 'teacher', text: 'Лана, я заявила вас на городскую олимпиаду. Не подведите! 🏅' },
  },
  {
    id: 'exam', chapter: 4, target: { scene: 'college', hotspot: 'teacher' }, icon: '📜', title: 'Диплом',
    desc: 'Сдай финальный экзамен у Ирины Петровны: коронка на 3 звезды.',
    hint: 'Медколледж → Ирина Петровна → Экзамен',
    goal: { type: 'exam', count: 1 },
    reward: { money: 5000, item: 'dress_grad' },
    from: { who: 'teacher', text: 'Экзамен открыт. Приходите, когда будете готовы. Удачи! 🍀' },
  },
  // ============================================================ ГЛАВА 5
  {
    id: 'lab', chapter: 5, target: { scene: 'dorm', hotspot: 'desk' }, icon: '💼', title: 'Первые заказы',
    desc: 'Ты дипломированный зубной техник! Возьми 3 заказа на фрилансе.',
    hint: 'Общежитие → Стол → Заказы лаборатории',
    goal: { type: 'action', ids: ['orders'], count: 3 },
    reward: { money: 2000 },
    from: { who: 'lover', text: 'Моя девочка — дипломированный специалист! 🎓 Горжусь!' },
  },
  {
    id: 'savings', chapter: 5, icon: '🏦', title: 'Стартовый капитал',
    desc: 'В Сухуме сдают помещение под лабораторию. Накопи 25 000 ₽.',
    hint: 'Заказы, смены в кофейне, мандарины',
    goal: { type: 'money', value: 25000, count: 1 },
    reward: { money: 0 },
    from: { who: 'mom', text: 'Доча, тётя Мадина сдаёт помещение у набережной — как раз под твою лабораторию! 😍' },
  },
  {
    id: 'ownLab', chapter: 5, icon: '🔑', title: 'Ключи от мечты',
    desc: 'Арендуй помещение под свою зуботехническую лабораторию в Сухуме.',
    hint: 'Телефон → Карта → Абхазия → Моя лаборатория',
    goal: { type: 'flag', flag: 'ownLab', count: 1 },
    reward: { money: 1000 },
  },
  {
    id: 'equip', chapter: 5, target: { scene: 'mylab', hotspot: 'shop' }, icon: '🔧', title: 'Оборудование',
    desc: 'Купи для лаборатории 2 единицы оборудования: каждая увеличивает доход с заказов.',
    hint: 'Моя лаборатория → Каталог оборудования',
    goal: { type: 'stat', key: 'labUpgrades', value: 2, count: 1 },
    reward: { money: 1500 },
  },
  {
    id: 'opening', chapter: 5, target: { scene: 'mylab', hotspot: 'door' }, icon: '🎉', title: 'Большое открытие',
    desc: 'Выполни 3 заказа в своей лаборатории и устрой праздник открытия для семьи и друзей!',
    hint: 'Моя лаборатория → Рабочее место, затем Вход → Открытие',
    goal: { type: 'action', ids: ['grandOpening'], count: 1 },
    reward: { money: 5000, item: 'tiara' },
    from: { who: 'amra', text: 'Когда открытие?! Я уже купила шарики 🎈' },
  },
];

// Map old save positions (first release) to quest ids.
export const LEGACY_ORDER = ['breakfast', 'lecture', 'crown', 'barista', 'fashion', 'pet', 'home', 'mandarins', 'sea', 'sights', 'honors', 'exam', 'lab'];

// ---------------------------------------------------------------- NPC requests (side quests)
// when(S) — can be offered now; days — deadline; reward; goal like main quests.
export const SIDE_QUESTS = [
  { id: 's_notes', who: 'katya', icon: '📒', title: 'Конспект для Кати', text: 'Лан, скинь конспект по материаловедению? Я проспала 🙈', desc: 'Позанимайся конспектами', goal: { type: 'action', ids: ['study'], count: 1 }, days: 2, reward: { money: 300, social: 15 }, when: (S) => S.city === 'moscow' },
  { id: 's_sweets', who: 'mom', icon: '🍬', title: 'Московские конфеты', text: 'Привези бабушке московских конфет, она их обожает 🍬', desc: 'Купи «Конфеты Москва» в продуктах и привези в Абхазию', goal: { type: 'flag', flag: 'sweetsDelivered', count: 1 }, days: 14, reward: { money: 1200 }, when: (S) => S.city === 'moscow' && S.quest.index >= 6 },
  { id: 's_photo', who: 'amra', icon: '🤳', title: 'Фото для Амры', text: 'Сделай селфи в новом образе и скинь мне! 😍', desc: 'Сделай селфи', goal: { type: 'action', ids: ['selfie'], count: 1 }, days: 2, reward: { money: 250, social: 10 }, when: () => true },
  { id: 's_harvest', who: 'grandma', icon: '🍊', title: 'Урожай для бабушки', text: 'Помоги собрать мандарины, внученька, спина уже не та…', desc: 'Набери 20+ мандаринов за сбор', goal: { type: 'minigame', id: 'mandarins', score: 20, count: 1 }, days: 3, reward: { money: 900 }, when: (S) => S.city === 'abkhazia' },
  { id: 's_report', who: 'teacher', icon: '📑', title: 'Доклад', text: 'Лана, подготовьте доклад о керамике к четвергу.', desc: 'Учи конспекты 2 раза', goal: { type: 'action', ids: ['study'], count: 2 }, days: 4, reward: { money: 500, grades: 8 }, when: (S) => S.city === 'moscow' && !S.flags.diploma },
  { id: 's_shift', who: 'vika', icon: '☕', title: 'Выручи на смене', text: 'Лана, выручай! Заболела бариста, выйдешь на смену? Двойная оплата!', desc: 'Отработай смену в «Пенке»', goal: { type: 'minigame', id: 'barista', count: 1 }, days: 2, reward: { money: 1200 }, when: (S) => S.city === 'moscow' && S.quest.index >= 5 },
  { id: 's_call', who: 'lover', icon: '📹', title: 'Свидание по видео', text: 'Сегодня вечером созвонимся? Я приготовил сюрприз 🥰', desc: 'Позвони любимому по видео', goal: { type: 'action', ids: ['callLover'], count: 1 }, days: 1, reward: { money: 0, social: 25, fun: 20 }, when: () => true },
  { id: 's_toy', who: 'lover', icon: '🧶', title: 'Игрушка для питомца', text: 'Купи своему пушистику игрушку, от меня 😺', desc: 'Поиграй с питомцем', goal: { type: 'pet', count: 2 }, days: 3, reward: { money: 400 }, when: (S) => S.pets.length > 0 },
  { id: 's_quiz', who: 'katya', icon: '🧠', title: 'Подготовка к тесту', text: 'Давай вместе прорешаем тест? Кто больше наберёт — тот угощает кофе ☕', desc: 'Пройди тест по анатомии на 2 звезды', goal: { type: 'minigame', id: 'quiz', stars: 2, count: 1 }, days: 3, reward: { money: 400, grades: 6 }, when: (S) => S.city === 'moscow' && S.quest.index >= 7 },
  { id: 's_cook', who: 'mom', icon: '🍲', title: 'Покажи, что умеешь', text: 'Приготовь что-нибудь и сфотографируй мне, проверю 😄', desc: 'Приготовь еду', goal: { type: 'action', ids: ['cook', 'helpCook'], count: 1 }, days: 2, reward: { money: 400 }, when: () => true },
];

export const DAILY_POOL = [
  { id: 'd_shower', icon: '🚿', text: 'Принять душ', goal: { type: 'action', ids: ['shower'], count: 1 }, money: 120 },
  { id: 'd_cook', icon: '🍳', text: 'Приготовить еду', goal: { type: 'action', ids: ['cook', 'helpCook'], count: 1 }, money: 200 },
  { id: 'd_mini', icon: '🎮', text: 'Сыграть в 2 мини-игры', goal: { type: 'minigame', count: 2 }, money: 250 },
  { id: 'd_star', icon: '⭐', text: 'Получить 3 звезды в мини-игре', goal: { type: 'minigame', stars: 3, count: 1 }, money: 350 },
  { id: 'd_chat', icon: '💬', text: 'Поболтать с кем-нибудь', goal: { type: 'action', ids: ['friendChat', 'chatGuests', 'momTalk', 'amraChat', 'callMom', 'grandmaTea', 'callLover'], count: 1 }, money: 150 },
  { id: 'd_selfie', icon: '🤳', text: 'Сделать селфи', goal: { type: 'action', ids: ['selfie'], count: 1 }, money: 120 },
  { id: 'd_reply', icon: '💌', text: 'Ответить любимому', goal: { type: 'reply', count: 1 }, money: 150 },
  { id: 'd_study', icon: '📖', text: 'Позаниматься зуботехникой', goal: { type: 'action', ids: ['study', 'lecture', 'practice', 'typodont', 'memory', 'consult', 'quiz'], count: 1 }, money: 200 },
  { id: 'd_fun', icon: '🎀', text: 'Поднять настроение выше 80', goal: { type: 'need', id: 'fun', value: 80, count: 1 }, money: 150 },
  { id: 'd_pet', icon: '🐾', text: 'Поиграть с питомцем', goal: { type: 'pet', count: 1 }, money: 150, needsPet: true },
  { id: 'd_walk', icon: '🌳', text: 'Погулять на свежем воздухе', goal: { type: 'action', ids: ['bench', 'ducks', 'promenade', 'swing', 'walkPet', 'run', 'sunbathe'], count: 1 }, money: 150 },
  { id: 'd_work', icon: '💼', text: 'Поработать (смена или заказ)', goal: { type: 'action', ids: ['work', 'orders', 'labOrders'], count: 1 }, money: 250 },
];

// ---------------------------------------------------------------- dreams (long-term goals, 3 tiers each)
export const DREAMS = [
  { id: 'dentist', icon: '🦷', title: 'Лучший зубной техник', desc: 'Уровень зуботехники', measure: (S, lv) => lv(S.skills.dental), tiers: [3, 6, 10], rewards: [800, 2500, 8000] },
  { id: 'fashion', icon: '👗', title: 'Икона стиля', desc: 'Вещей в гардеробе', measure: (S) => S.owned.length, tiers: [10, 20, 35], rewards: [500, 1500, 4000] },
  { id: 'travel', icon: '🗺️', title: 'Путешественница', desc: 'Собрано открыток', measure: (S) => S.postcards.length, tiers: [2, 4, 6], rewards: [600, 1500, 3500] },
  { id: 'chef', icon: '👩‍🍳', title: 'Хозяюшка', desc: 'Приготовлено блюд', measure: (S) => (S.stats.act_cook || 0) + (S.stats.act_helpCook || 0) + (S.stats.mg_khachapuri_played || 0), tiers: [5, 15, 35], rewards: [500, 1500, 3500] },
  { id: 'social', icon: '💞', title: 'Душа компании', desc: 'Разговоров и звонков', measure: (S) => ['friendChat', 'chatGuests', 'momTalk', 'amraChat', 'callMom', 'grandmaTea', 'grandmaTalk', 'callLover'].reduce((a, k) => a + (S.stats['act_' + k] || 0), 0), tiers: [10, 30, 70], rewards: [500, 1500, 4000] },
  { id: 'money', icon: '💰', title: 'Финансовая независимость', desc: 'Заработано всего, ₽', measure: (S) => Math.round(S.stats.earned || 0), tiers: [10000, 40000, 120000], rewards: [1000, 3000, 10000] },
  { id: 'games', icon: '🎮', title: 'Мастер мини-игр', desc: 'Звёзд в мини-играх', measure: (S) => S.stats.starsTotal || 0, tiers: [15, 50, 120], rewards: [600, 2000, 5000] },
];
