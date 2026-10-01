// Plays a minigame through the real UI: MG=crown node tools/play.mjs tools/scripts/mg.mjs
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  const mg = process.env.MG || 'crown';
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1400);
  await page.click('.title-actions .btn');
  await sleep(400);
  await page.click('.story .skip');
  await sleep(1200);
  await page.evaluate(async (mg) => {
    const m = await import('/js/minigames/index.js');
    window.__res = m.playMinigame(mg, { mode: 'normal', reward: () => ['💰 +100 ₽', '🦷 +20'] });
  }, mg);
  await sleep(800);
  await shot(`mg-${mg}-1-intro`);
  await page.click('.mg-intro .btn');
  await sleep(2600);
  await shot(`mg-${mg}-2-start`);
  const box = await page.locator('.mg-canvas canvas').boundingBox();
  const W = box.width, H = box.height;
  if (mg === 'crown') {
    await page.click('.crown-shades button >> nth=0');
    await sleep(1500);
    await shot('mg-crown-3-wax');
    // carve a ring around the tooth
    const cx = box.x + W / 2, cy = box.y + H * 0.5, R = Math.min(W * 0.36, H * 0.28);
    for (let ring = 0; ring < 3; ring++) {
      const rr = R * (1.3 - ring * 0.1);
      await page.mouse.move(cx + rr, cy);
      await page.mouse.down();
      for (let a = 0; a <= 64; a++) await page.mouse.move(cx + Math.cos(a / 64 * 6.283) * rr, cy + Math.sin(a / 64 * 6.283) * rr * 1.05, { steps: 2 });
      await page.mouse.up();
    }
    await sleep(500);
    await shot('mg-crown-4-carved');
    await page.click('.btn.mint');
    await sleep(500);
    await page.mouse.move(cx - 30, cy);
    await page.mouse.down();
    for (let i = 0; i < 40; i++) await page.mouse.move(cx + (i % 2 ? 40 : -40), cy + (i % 3) * 10, { steps: 3 });
    await page.mouse.up();
    await sleep(800);
    await shot('mg-crown-5-polish');
    await sleep(9000);
  } else if (mg === 'memory') {
    await sleep(1500);
    for (let i = 0; i < 16; i++) { await page.click(`div[style*="grid-template-columns"] button >> nth=${i}`); await sleep(300); }
    await shot('mg-memory-3');
    await sleep(2000);
  } else if (mg === 'barista') {
    await sleep(500);
    await shot('mg-barista-3');
    // cheat: read recipe and press
    for (let k = 0; k < 6; k++) {
      const rec = await page.evaluate(() => document.querySelector('[data-recipe]').textContent);
      const map = { '☕': 0, '💧': 1, '🥛': 2, '🌾': 3, '🍶': 4, '☁️': 5, '❤️': 6, '🍯': 7, '💜': 8, '🍫': 9, '🧊': 10, '🍵': 11 };
      const icons = [...rec.matchAll(/☕|💧|🥛|🌾|🍶|☁️|❤️|🍯|💜|🍫|🧊|🍵/g)].map((m) => m[0]);
      for (const ic of icons) { await page.locator('[data-pad] button').nth(map[ic]).dispatchEvent('pointerdown'); await sleep(150); }
      await sleep(1100);
    }
    await shot('mg-barista-4');
    await sleep(75000);
  } else if (mg === 'runner') {
    for (let i = 0; i < 40; i++) { await page.mouse.click(box.x + W / 2, box.y + H / 2); await sleep(700); if (i === 6) await shot('mg-runner-3'); }
    await sleep(10000);
  } else {
    for (let i = 0; i < 30; i++) { await page.mouse.move(box.x + W * (0.2 + 0.6 * Math.abs(Math.sin(i))), box.y + H * (0.3 + 0.4 * Math.abs(Math.cos(i * 0.7)))); await sleep(300); if (i === 8) await shot(`mg-${mg}-3`); }
    await sleep(40000);
  }
  await shot(`mg-${mg}-9-result`);
};
