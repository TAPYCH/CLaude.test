// Screenshots every story dialogue at its second line.
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
  await sleep(700);
  await page.click('.dlg-skip').catch(() => {});
  await sleep(900);
  for (const id of ['ch3', 'homecoming', 'olympiad', 'ch5', 'opening']) {
    await page.evaluate((id) => { import('/js/ui/dialogue.js').then((m) => m.playDialogue(id)); }, id);
    await sleep(700);
    await page.click('.dlg');
    await sleep(1400);
    await page.click('.dlg');
    await shot('d-' + id);
    await page.click('.dlg-skip');
    await sleep(700);
  }
};
