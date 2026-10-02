// Returning player with a 3-day streak gets the day-4 login gift.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1400);
  await page.$eval('.title-actions .btn', (e) => e.click());
  await sleep(400);
  await page.$eval('.story .skip', (e) => e.click());
  await sleep(1500);
  await page.evaluate(() => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    __lana.S.login = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 3 };
    __lana.S.chapterSeen = 1;
    __lana.save();
  });
  await page.reload();
  await sleep(1600);
  await page.$eval('.title-actions .btn', (e) => e.click());
  await sleep(2600);
  await shot('login-gift');
  const m0 = await page.evaluate(() => __lana.S.money);
  await page.click('.overlay .dialog .btn');
  await sleep(500);
  console.log('money', m0, '→', await page.evaluate(() => __lana.S.money), JSON.stringify(await page.evaluate(() => __lana.S.login)));
};
