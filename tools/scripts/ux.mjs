// Plays the first minutes like a person would on a phone and screenshots each step.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1400);
  await page.$eval('.title-actions .btn', (e) => e.click());
  await sleep(400);
  await page.$eval('.story .skip', (e) => e.click());
  await sleep(2000);
  await page.click('.chapter-card').catch(() => {});
  await sleep(800);
  await page.click('.dlg-skip').catch(() => {});
  await sleep(1200);
  await shot('ux1-start');
  await page.click('.world-edge.r');
  await sleep(1800);
  await shot('ux2-walked');
  await page.click('.hotspot[data-id="fridge"]');
  await sleep(700);
  await shot('ux3-menu');
  await page.click('.action-menu .act >> nth=0');
  await sleep(1500);
  await shot('ux4-acting');
  await sleep(4000);
  await shot('ux5-after');
};
