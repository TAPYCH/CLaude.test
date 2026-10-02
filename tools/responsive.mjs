// Captures key screens on many device sizes: node tools/responsive.mjs [outdir]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '/tmp';
const DEVICES = [
  ['se1', 320, 568, true], ['s360', 360, 640, true], ['se', 375, 667, true], ['a360', 360, 740, true], ['promax', 430, 932, true],
  ['ipadP', 820, 1180, true], ['ipadL', 1180, 820, true], ['land', 844, 390, true],
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
for (const [name, w, h, touch] of DEVICES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: touch && w < 900, hasTouch: touch });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const tap = async (sel) => { await page.waitForSelector(sel, { timeout: 8000 }); await page.$eval(sel, (el) => el.click()); await sleep(450); };
  const shot = (s) => page.screenshot({ path: `${OUT}/r-${name}-${s}.png` });
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(2600);
  await shot('1title');
  await tap('.title-actions .btn');
  await tap('.story .skip');
  await sleep(1800);
  await tap('.chapter-card');
  await sleep(900);
  await page.$eval('.dlg', (e) => e.click());
  await sleep(1500);
  await shot('1bdialogue');
  await tap('.dlg:not(.closing) .dlg-skip');
  await sleep(800);
  await page.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));
  await tap('.hotspot[data-id="desk"]');
  await shot('2menu');
  await page.$eval('.menu-backdrop', (e) => e.click());
  await sleep(300);
  await tap('.phone-btn');
  await sleep(500);
  await shot('3phone');
  await tap('[data-app="map"]');
  await shot('4map');
  await page.evaluate(() => document.querySelector('.app-view .back').click());
  await sleep(300);
  await tap('[data-app="path"]');
  await shot('4bpath');
  await page.evaluate(() => document.querySelector('.phone-close').click());
  await sleep(500);
  await page.evaluate(async () => { const w = await import('/js/ui/wardrobe.js'); w.openWardrobe({ shop: true }); });
  await sleep(1200);
  await shot('5wardrobe');
  await tap('[data-close]');
  await page.evaluate(async () => { const m = await import('/js/minigames/index.js'); m.playMinigame('barista', { reward: () => [] }); });
  await sleep(700);
  await tap('.mg-intro .btn');
  await sleep(2700);
  await shot('6barista');
  for (const mg of ['quiz', 'fashion', 'dance']) {
    await page.evaluate(() => { const q = document.querySelector('.minigame'); if (q) q.remove(); });
    await page.evaluate(async (mg) => { const m = await import('/js/minigames/index.js'); m.playMinigame(mg, { reward: () => [] }); }, mg);
    await sleep(800);
    await tap('.mg-intro .btn');
    await sleep(mg === 'quiz' ? 2600 : 1500);
    if (mg === 'dance') await sleep(2500);
    await shot('7' + mg);
  }
  console.log(name, errors.length ? errors.join(' | ') : 'ok');
  await ctx.close();
}
await browser.close();
