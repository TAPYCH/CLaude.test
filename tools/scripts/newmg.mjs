// Plays the new minigames with simple bots: MG=quiz|khachapuri|dance|fashion|puzzle
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  const mg = process.env.MG || 'quiz';
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await sleep(1400);
  await page.click('.title-actions .btn');
  await sleep(400);
  await page.click('.story .skip');
  await sleep(800);
  // dismiss chapter card + dialogue if they appear
  for (let i = 0; i < 20; i++) {
    if (await page.$('.chapter-card:not(.closing)')) await page.click('.chapter-card', { timeout: 2000 }).catch(() => {});
    else if (await page.$('.dlg:not(.closing)')) await page.click('.dlg:not(.closing) .dlg-skip', { timeout: 2000 }).catch(() => {});
    else if (i > 4) break;
    await sleep(350);
  }
  await page.evaluate(async (mg) => {
    window.__lana.S.postcards = ['ritsa', 'afon'];
    const m = await import('/js/minigames/index.js');
    window.__done = null;
    m.playMinigame(mg, { mode: 'normal', level: 3, reward: () => ['💰 +100 ₽'] }).then((r) => (window.__done = r));
  }, mg);
  await sleep(900);
  await shot(`n-${mg}-1-intro`);
  await page.click('.mg-intro .btn');
  const box = await page.locator('.mg-canvas canvas').boundingBox();
  const W = box.width, H = box.height;
  const tap = (x, y) => page.mouse.click(box.x + x, box.y + y);
  if (mg === 'quiz') {
    await sleep(2400);
    await shot('n-quiz-2');
    for (let i = 0; i < 10; i++) {
      await page.click('.mgq-opt >> nth=' + (i % 4)).catch(() => {});
      await sleep(i === 0 ? 300 : 1500);
      if (i === 0) await shot('n-quiz-3-answer');
    }
  } else if (mg === 'khachapuri') {
    await sleep(2400 + 1200);
    await shot('n-kh-2-knead');
    for (let i = 0; i < 30; i++) { await tap(W / 2, H * 0.6); await sleep(60); }
    await sleep(2400);
    await shot('n-kh-3-roll');
    await sleep(900);
    await tap(W / 2, H * 0.6);
    await sleep(2400);
    await shot('n-kh-4-cheese');
    for (let i = 0; i < 6; i++) { await tap(W / 2, H * 0.6); await sleep(700); }
    await sleep(2600);
    await sleep(1800);
    await shot('n-kh-5-bake');
    await sleep(2400);
    await tap(W / 2, H * 0.6);
    await sleep(2400);
    await shot('n-kh-6-egg');
    await tap(W / 2, H * 0.6);
    await sleep(2500);
  } else if (mg === 'dance') {
    await sleep(3000);
    await shot('n-dance-2');
    // bot: read notes from page? just tap lanes rhythmically
    for (let i = 0; i < 60; i++) { await tap(W * ((i % 4) + 0.5) / 4, H - 100); await sleep(250); }
    await shot('n-dance-3');
    await sleep(20000);
  } else if (mg === 'fashion') {
    await sleep(600);
    await shot('n-fashion-2');
    for (let i = 0; i < 4; i++) { await page.click('.mgf-card >> nth=' + (i % 4)).catch(() => {}); await sleep(700); }
    await sleep(1600);
    await shot('n-fashion-3-jury');
    await sleep(3500);
  } else if (mg === 'puzzle') {
    await sleep(800);
    await shot('n-puzzle-2');
    for (let i = 0; i < 40; i++) { await tap(W * (0.2 + Math.random() * 0.6), H * (0.3 + Math.random() * 0.4)); await sleep(80); }
    await sleep(400);
    await shot('n-puzzle-3');
    await page.evaluate(() => document.querySelector('[data-quit]').click());
    await sleep(500);
    await page.click('.mg-intro .btn.ghost').catch(() => {});
  }
  await sleep(800);
  await shot(`n-${mg}-9-result`);
  console.log('result', JSON.stringify(await page.evaluate(() => window.__done)));
};
