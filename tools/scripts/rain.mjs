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
  await page.evaluate(async () => { const g = await import('/js/game.js'); __lana.S.day = 1; await g.goScene('park', { transition: false }); });
  await sleep(4000);
  await shot('96-rain');
  await page.evaluate(async () => { const g = await import('/js/game.js'); __lana.S.day = 100; await g.goScene('dorm', { transition: false }); await g.goScene('park', { transition: false }); });
  await sleep(4000);
  await shot('97-snow');
};
