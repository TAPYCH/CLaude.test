const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await sleep(1200);
  await page.evaluate(async () => {
    const m = await import('/js/minigames/index.js');
    m.playMinigame('crown', { mode: 'normal', reward: () => [] });
  });
  await sleep(600);
  await page.click('.mg-intro .btn');
  await sleep(300);
  await page.click('.crown-shades button >> nth=0');
  await sleep(1400);
  const box = await page.locator('.mg-canvas canvas').boundingBox();
  console.log('box', JSON.stringify(box));
  await page.evaluate(() => { const c = document.querySelector('.mg-canvas canvas'); ['pointerdown','pointermove','pointerup'].forEach(t => c.addEventListener(t, e => { window.__ev = (window.__ev||0)+1; window.__last = t + ' ' + e.pointerType + ' ' + e.buttons; })); });
  await page.mouse.move(box.x + 60, box.y + box.height/2);
  await page.mouse.down();
  for (let i = 0; i < 20; i++) await page.mouse.move(box.x + 60 + i * 3, box.y + box.height/2 + i * 5);
  await page.mouse.up();
  console.log(await page.evaluate(() => window.__ev + ' ' + window.__last));
  await sleep(500);
  await shot('dbg');
};
