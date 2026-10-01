const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  const tap = async (sel) => { await page.waitForSelector(sel, { timeout: 8000 }); await page.$eval(sel, (el) => el.click()); await sleep(500); };
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1400);
  await tap('.title-actions .btn');
  await tap('.story .skip');
  await sleep(800);
  await page.evaluate(async () => {
    const S = __lana.S;
    S.quest.index = 11; S.skills.dental = 300; S.attendance = 2;
    const g = await import('/js/game.js');
    await g.goScene('college', { transition: false });
  });
  await sleep(800);
  // not admitted yet
  await page.evaluate(async () => { const g = await import('/js/game.js'); const { SCENES } = await import('/js/data/scenes.js'); g.doAction('exam', SCENES.college.hotspots.find((h) => h.id === 'teacher')); });
  await sleep(2500);
  await shot('ex1-not-admitted');
  await tap('.overlay .btn');
  await page.evaluate(() => { __lana.S.skills.dental = 800; __lana.S.attendance = 6; });
  await page.evaluate(async () => { const g = await import('/js/game.js'); const { SCENES } = await import('/js/data/scenes.js'); g.doAction('exam', SCENES.college.hotspots.find((h) => h.id === 'teacher')); });
  await sleep(1500);
  await shot('ex2-ready');
  await tap('.overlay .btn.mint');
  await sleep(1000);
  await tap('.mg-intro .btn');
  await sleep(400);
  await shot('ex3-exam-mg');
  await tap('.crown-shades button');
  await sleep(1400);
  await tap('.btn.mint'); // finish carving immediately
  await sleep(10000);
  await shot('ex4-result');
  await tap('.mg-intro .btn');
  await sleep(1500);
  await shot('ex5-fail');
  console.log(await page.evaluate(() => JSON.stringify({ flags: __lana.S.flags, q: __lana.S.quest.index })));
};
