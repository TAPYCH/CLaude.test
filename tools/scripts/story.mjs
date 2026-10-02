// Drives the whole 5-chapter quest chain through bus events/state and checks chapters, dialogues, rewards.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1400);
  await page.$eval('.title-actions .btn', (e) => e.click());
  await sleep(500);
  await page.$eval('.story .skip', (e) => e.click());
  await sleep(800);
  // auto-dismiss every story overlay, counting what was shown
  await page.evaluate(() => {
    window.__seen = { chapters: [], dialogues: 0, questDialogs: 0 };
    __lana.bus.on('chapter', (c) => __seen.chapters.push(c.n));
    setInterval(() => {
      const cc = document.querySelector('.chapter-card:not(.closing)');
      if (cc) return cc.click();
      const d = document.querySelector('.dlg:not(.closing) .dlg-skip');
      if (d) {
        __seen.dialogues++;
        return d.click();
      }
      const b = document.querySelector('.overlay:not(.closing) .dialog .btn');
      if (b) {
        if (/выполнено/i.test(document.querySelector('.overlay .dialog').textContent)) __seen.questDialogs++;
        b.click();
      }
    }, 300);
  });
  const q = () => page.evaluate(() => __lana.S.quest.id);
  const emit = (e, d) => page.evaluate(([e, d]) => __lana.bus.emit(e, d), [e, d]);
  const set = (fn) => page.evaluate(fn);
  const steps = [
    ['breakfast', () => emit('action', { id: 'snack' })],
    ['lecture', () => emit('action', { id: 'lecture' })],
    ['crown', () => emit('minigame', { id: 'crown', stars: 2, score: 70, mode: 'practice' })],
    ['dinner', () => emit('action', { id: 'cook' })],
    ['callLover', () => emit('action', { id: 'callLover' })],
    ['barista', () => emit('minigame', { id: 'barista', stars: 1, score: 5 })],
    ['fashion', () => emit('buy', { id: 'jeans' })],
    ['quiz', () => emit('minigame', { id: 'quiz', stars: 1, score: 400 })],
    ['pet', () => emit('adopt', { type: 'cat' })],
    ['ticket', () => set(() => { __lana.S.money = 7000; __lana.bus.emit('money', {}); })],
    ['home', () => emit('travel', { to: 'abkhazia' })],
    ['khachapuri', () => emit('minigame', { id: 'khachapuri', stars: 2, score: 80 })],
    ['mandarins', () => emit('minigame', { id: 'mandarins', stars: 2, score: 35 })],
    ['sea', () => emit('minigame', { id: 'shells', stars: 1, score: 12 })],
    ['dance', () => emit('minigame', { id: 'dance', stars: 1, score: 2000 })],
    ['sights', () => set(() => { __lana.S.postcards.push('ritsa', 'afon'); __lana.bus.emit('postcard', { id: 'afon' }); })],
    ['return', () => emit('travel', { to: 'moscow' })],
    ['grades', () => set(() => { __lana.S.grades = 64; __lana.bus.emit('grades', { delta: 14, value: 64 }); })],
    ['honors', () => set(() => { __lana.S.skills.dental = 800; __lana.bus.emit('levelup', { skill: 'dental', level: 5 }); })],
    ['olympiad', () => emit('minigame', { id: 'crown', stars: 3, score: 95, mode: 'olympiad' })],
    ['exam', () => set(() => { __lana.S.flags.diploma = true; __lana.bus.emit('exam', { passed: true }); })],
    ['lab', async () => { for (let i = 0; i < 3; i++) { await emit('action', { id: 'orders' }); await sleep(300); } }],
    ['savings', () => set(() => { __lana.S.money = 30000; __lana.bus.emit('money', {}); })],
    ['ownLab', () => set(async () => { const g = await import('/js/game.js'); __lana.S.city = 'abkhazia'; g.rentLab(); })],
    ['equip', () => set(async () => { const g = await import('/js/game.js'); __lana.S.money += 20000; g.buyEquipment('sign'); g.buyEquipment('microscope'); })],
    ['opening', () => emit('action', { id: 'grandOpening' })],
  ];
  const problems = [];
  for (const [id, run] of steps) {
    const cur = await q();
    if (cur !== id) problems.push(`expected quest ${id}, got ${cur}`);
    await run();
    for (let i = 0; i < 40 && (await q()) === id; i++) await sleep(150);
    if ((await q()) === id) problems.push(`quest ${id} did not complete`);
    if (id === 'ticket' || id === 'sights' || id === 'exam') await sleep(3000); // let chapter card + dialogue play
    if (id === 'callLover') { await sleep(2500); await shot('st-ch2'); }
  }
  await sleep(4000);
  const res = await page.evaluate(() => ({ q: __lana.S.quest, allQuests: __lana.S.flags.allQuests, seen: __seen, chapterSeen: __lana.S.chapterSeen, owned: __lana.S.owned.slice(-4), money: __lana.S.money, dreams: __lana.S.dreams }));
  console.log(JSON.stringify(res));
  console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'STORY OK');
  await shot('st-end');
};
