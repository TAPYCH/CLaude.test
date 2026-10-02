// Buys room decor from the shop and shows the dorm.
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
    const cc = document.querySelector('.chapter-card:not(.closing)'); if (cc) return cc.click();
    const d = document.querySelector('.dlg:not(.closing) .dlg-skip'); if (d) d.click();
  }, 200));
  await sleep(2000);
  await page.evaluate(() => { __lana.S.money = 20000; });
  await page.evaluate(() => import('/js/ui/phone.js').then((m) => m.openShopTab('decor')));
  await sleep(700);
  await shot('decor-shop');
  for (let i = 0; i < 5; i++) { await page.click('.card.equip:not(.owned) button').catch(() => {}); await sleep(400); }
  await shot('decor-bought');
  await page.evaluate(() => import('/js/ui/phone.js').then((m) => m.closePhone()));
  await sleep(1500);
  await page.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));
  await shot('decor-room');
  console.log(JSON.stringify(await page.evaluate(() => ({ decor: __lana.S.decor, money: __lana.S.money, dreams: __lana.S.dreams }))));
};
