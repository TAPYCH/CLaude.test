// Captures every phone app + common dialogs on the current viewport.
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
  await page.evaluate(() => { const S = __lana.S; S.pets.push({ id: 'p1', type: 'cat', name: 'Персик', hunger: 60, joy: 70, day: 0 }); S.album.unshift({ outfit: S.outfit, scene: 'dorm', day: 0, min: 500 }); });
  const apps = ['quests', 'profile', 'pets', 'shop', 'achievements', 'album', 'settings'];
  for (const a of apps) {
    await page.evaluate((a) => import('/js/ui/phone.js').then((m) => { m.closePhone(); m.openPhone(a); }), a);
    await sleep(700);
    await shot('app-' + a);
  }
  await page.evaluate(() => import('/js/ui/phone.js').then((m) => m.closePhone()));
  await sleep(400);
  // quest-done dialog
  await page.evaluate(() => __lana.bus.emit('action', { id: 'snack' }));
  await sleep(1200);
  await shot('dlg-questdone');
  await page.click('.overlay .dialog .btn').catch(() => {});
  await sleep(500);
  // minigame intro with longest text
  await page.evaluate(() => { import('/js/minigames/index.js').then((m) => m.playMinigame('dance', { reward: () => [] })); });
  await sleep(800);
  await shot('mg-intro-dance');
};
