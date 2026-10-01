// Executes every non-minigame action in every scene and reports console errors.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1400);
  await page.$eval('.title-actions .btn', (e) => e.click());
  await sleep(400);
  await page.$eval('.story .skip', (e) => e.click());
  await sleep(1200);
  const report = await page.evaluate(async () => {
    const g = await import('/js/game.js');
    const { SCENES } = await import('/js/data/scenes.js');
    const { ACTIONS } = await import('/js/data/actions.js');
    const S = __lana.S;
    S.money = 99999;
    S.inventory.groceries = 20; S.inventory.snacks = 20; S.inventory.meals = 5;
    S.pets.push({ id: 'p1', type: 'corgi', name: 'Бублик', hunger: 50, joy: 50, day: 0 });
    const log = [];
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const id of Object.keys(SCENES)) {
      S.city = SCENES[id].city;
      await g.goScene(id, { transition: false });
      await wait(300);
      for (const h of SCENES[id].hotspots) {
        for (const a of h.actions) {
          const def = ACTIONS[a];
          if (!def) { log.push(`MISSING action ${a} in ${id}`); continue; }
          if (def.minigame || def.special === 'wardrobe' || def.special === 'shop' || def.special === 'sleep' || def.special === 'exam') continue;
          S.minutes = 10 * 60; S.day = 2; // Wednesday morning
          for (const k of Object.keys(S.needs)) S.needs[k] = 60;
          const av = g.actionAvailability(a);
          if (!av.ok) { log.push(`${id}/${a}: unavailable (${av.reason})`); continue; }
          const t0 = performance.now();
          await g.doAction(a, h);
          log.push(`${id}/${a}: ok ${Math.round(performance.now() - t0)}ms`);
        }
      }
    }
    return log;
  });
  console.log(report.join('\n'));
};
