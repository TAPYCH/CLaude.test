const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(2500);
  await shot('70-title');
  await page.$eval('.title-actions .btn', (e) => e.click());
  await sleep(400);
  await page.$eval('.story .skip', (e) => e.click());
  await sleep(1000);
  await page.evaluate(async () => {
    const g = await import('/js/game.js');
    const { SCENES } = await import('/js/data/scenes.js');
    __lana.S.city = 'abkhazia';
    await g.goScene('home', { transition: false });
    setTimeout(() => g.doAction('momTalk', SCENES.home.hotspots.find((h) => h.id === 'mom')), 3500);
  });
  await sleep(6200);
  await shot('71-mom-bubble');
};
