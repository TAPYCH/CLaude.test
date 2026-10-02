// Runs the new minigame actions through the real game flow (doAction → minigame → rewards → events).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1400);
  await page.$eval('.title-actions .btn', (e) => e.click());
  await sleep(400);
  await page.$eval('.story .skip', (e) => e.click());
  await sleep(800);
  await page.evaluate(() => setInterval(() => {
    const cc = document.querySelector('.chapter-card:not(.closing)');
    if (cc) return cc.click();
    const d = document.querySelector('.dlg:not(.closing) .dlg-skip');
    if (d) return d.click();
    if (!document.querySelector('.minigame')) {
      const b = document.querySelector('.overlay:not(.closing) .dialog .btn');
      if (b) b.click();
    }
  }, 250));
  await sleep(1500);
  const runs = [
    ['college', 'board', 'quiz', 'moscow', 11],
    ['home', 'table', 'khachapuri', 'abkhazia', 12],
    ['beach', 'amra', 'dance', 'abkhazia', 18],
    ['mall', 'boutique', 'fashionShow', 'moscow', 13],
    ['dorm', 'window', 'puzzle', 'moscow', 15],
    ['college', 'teacher', 'olympiad', 'moscow', 11],
  ];
  for (const [scene, hs, act, city, hour] of runs) {
    const before = await page.evaluate(async ({ scene, hs, act, city, hour }) => {
      const g = await import('/js/game.js');
      const { SCENES } = await import('/js/data/scenes.js');
      const S = __lana.S;
      S.city = city;
      S.minutes = hour * 60;
      S.postcards = ['ritsa', 'afon'];
      if (act === 'olympiad') { const { QUESTS } = await import('/js/data/quests.js'); S.quest.index = QUESTS.findIndex((q) => q.id === 'olympiad'); S.quest.id = 'olympiad'; }
      await g.goScene(scene, { transition: false });
      const h = SCENES[scene].hotspots.find((x) => x.id === hs);
      window.__flow = 'running';
      g.doAction(act, h).then(() => (window.__flow = 'done')).catch((e) => (window.__flow = 'error ' + e.message));
      return { money: S.money, grades: S.grades };
    }, { scene, hs, act, city, hour });
    // wait for the minigame intro (Lana walks there first)
    for (let i = 0; i < 60 && !(await page.$('.mg-intro .btn')); i++) await sleep(250);
    await page.click('.mg-intro .btn');
    await sleep(500);
    // just let it play out / time out; for quiz/fashion click options
    const t0 = Date.now();
    while (Date.now() - t0 < 70000) {
      if (await page.$('.mg-intro .stars')) break;
      if (await page.$('.mgq-opt:not(:disabled)')) await page.click('.mgq-opt >> nth=0').catch(() => {});
      if (await page.$('.mgf-card')) await page.click('.mgf-card >> nth=0').catch(() => {});
      if (act === 'khachapuri' || act === 'dance') await page.mouse.click(200, 600);
      if (act === 'olympiad' && (await page.$('.crown-shades button'))) await page.click('.crown-shades button >> nth=0').catch(() => {});
      if (act === 'puzzle' && Date.now() - t0 > 3000) {
        await page.click('[data-quit]');
        await sleep(400);
        await page.click('.mg-intro .btn.ghost');
        break;
      }
      await sleep(act === 'dance' ? 120 : 400);
    }
    await shot(`flow-${act}`);
    if (await page.$('.mg-intro .stars')) await page.click('.mg-intro .btn');
    for (let i = 0; i < 40 && (await page.evaluate(() => window.__flow)) === 'running'; i++) await sleep(250);
    const after = await page.evaluate(() => ({ money: __lana.S.money, grades: __lana.S.grades, flow: window.__flow, played: Object.keys(__lana.S.stats).filter((k) => k.startsWith('mg_')) }));
    console.log(act, JSON.stringify(before), '→', JSON.stringify(after));
    await sleep(800);
  }
};
