const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1500);
  await page.click('.title-actions .btn');
  await sleep(500);
  await page.click('.story .skip');
  await sleep(1500);
  // fridge
  await page.click('.hotspot[data-id="fridge"]');
  await sleep(500);
  await shot('10-menu');
  await page.click('.action-menu .act >> nth=0');
  await sleep(1200);
  await shot('11-walking');
  await sleep(4500);
  await shot('12-quest-done');
  const btn = await page.$('.dialog .btn');
  if (btn) await btn.click();
  await sleep(600);
  // phone
  await page.click('.phone-btn');
  await sleep(700);
  await shot('13-phone');
  await page.click('[data-app="map"]');
  await sleep(600);
  await shot('14-map');
  await page.click('.pin >> nth=1');
  await sleep(3000);
  await shot('15-college');
  await page.click('.hotspot[data-id="board"]');
  await sleep(400);
  await page.click('.action-menu .act >> nth=0');
  await sleep(7000);
  await shot('16-after-lecture');
  for (let i = 0; i < 3; i++) { const b = await page.$('.dialog .btn'); if (b) { await b.click(); await sleep(500); } }
  await shot('17-state');
  console.log(await page.evaluate(() => JSON.stringify({ q: __lana.S.quest, money: __lana.S.money, needs: __lana.S.needs, t: __lana.S.minutes, sk: __lana.S.skills })));
};
