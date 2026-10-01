// Drives the whole quest chain through bus events to verify quests, rewards, exam & finale.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  const closeDialogs = async (n = 4) => { for (let i = 0; i < n; i++) { const b = await page.$('.overlay .dialog .btn'); if (!b) break; await b.click(); await sleep(450); } };
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1400);
  await page.$eval('.title-actions .btn', (e) => e.click());
  await sleep(500);
  await page.$eval('.story .skip', (e) => e.click());
  await sleep(1200);
  const steps = [
    ['action', { id: 'snack' }], ['action', { id: 'lecture' }], ['minigame', { id: 'crown', stars: 2, score: 70 }],
    ['minigame', { id: 'barista', stars: 1, score: 5 }], ['buy', { id: 'jeans' }], ['adopt', { type: 'cat' }],
    ['travel', { to: 'abkhazia' }], ['minigame', { id: 'mandarins', stars: 2, score: 35 }], ['minigame', { id: 'shells', stars: 1, score: 12 }],
  ];
  for (const [e, d] of steps) {
    await page.evaluate(([e, d]) => __lana.bus.emit(e, d), [e, d]);
    await sleep(700);
    await closeDialogs();
  }
  await page.evaluate(() => { __lana.S.postcards.push('ritsa', 'afon'); __lana.bus.emit('postcard', { id: 'afon' }); });
  await sleep(800); await closeDialogs();
  await page.evaluate(() => { __lana.S.skills.dental = 800; __lana.bus.emit('levelup', { skill: 'dental', level: 5 }); });
  await sleep(1500); await closeDialogs();
  await shot('50-before-exam');
  console.log('quest index', await page.evaluate(() => __lana.S.quest.index));
  await page.evaluate(() => __lana.bus.emit('exam', { passed: true }));
  await sleep(800);
  await shot('51-exam-quest');
  await closeDialogs();
  // finale UI
  await page.evaluate(async () => { const m = await import('/js/ui/cutscenes.js'); m.finale(); });
  await sleep(1500);
  await shot('52-finale');
  await page.$eval('.overlay .dialog .btn', (e) => e.click());
  await sleep(900);
  await shot('53-letter');
  await closeDialogs();
  for (let i = 0; i < 3; i++) { await page.evaluate(() => __lana.bus.emit('action', { id: 'orders' })); await sleep(500); await closeDialogs(); }
  await sleep(1000); await closeDialogs();
  console.log(await page.evaluate(() => JSON.stringify({ q: __lana.S.quest, flags: __lana.S.flags, owned: __lana.S.owned.slice(-6), ach: Object.keys(__lana.S.achievements), money: __lana.S.money })));
  await shot('54-end');
};
