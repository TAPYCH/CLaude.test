const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1500);
  await page.$eval('.title-actions .btn', (e) => e.click());
  for (let i = 0; i < 4; i++) {
    await sleep(2200);
    await shot('i' + i);
    await page.$eval('.story .next .btn', (e) => e.click());
    await sleep(150);
  }
};
