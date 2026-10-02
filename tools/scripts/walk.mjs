// Checks camera follow, hold-to-walk and swipe inertia on a phone viewport.
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
  await sleep(2500);
  await page.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));
  const st = () => page.evaluate(async () => { const { world } = await import('/js/ui/world.js'); return { lana: Math.round(world.lanaX), cam: Math.round(world.camX), walking: !!world.walking }; });
  const W = 390, H = 844;
  console.log('start', JSON.stringify(await st()));
  // tap near right edge
  await page.mouse.click(W - 20, H * 0.55);
  await sleep(400);
  console.log('mid-walk', JSON.stringify(await st()));
  await sleep(1500);
  console.log('after tap', JSON.stringify(await st()));
  await shot('w1-after-tap');
  // hold on right edge for 2.5s
  await page.mouse.move(W - 15, H * 0.6);
  await page.mouse.down();
  await sleep(2500);
  console.log('holding', JSON.stringify(await st()));
  await page.mouse.up();
  await sleep(800);
  console.log('released', JSON.stringify(await st()));
  await shot('w2-after-hold');
  // fling left
  await page.mouse.move(80, H * 0.5);
  await page.mouse.down();
  for (let i = 1; i <= 6; i++) { await page.mouse.move(80 + i * 45, H * 0.5); await sleep(16); }
  await page.mouse.up();
  const a = await st(); await sleep(600); const b = await st();
  console.log('fling', JSON.stringify(a), '→', JSON.stringify(b));
};
