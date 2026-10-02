// Screenshot every scene (optionally twice to compare ambient motion): SCENES=beach,cafe T=day|night
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1400);
  await page.click('.title-actions .btn');
  await sleep(400);
  await page.click('.story .skip');
  await sleep(900);
  for (let i = 0; i < 20; i++) {
    if (await page.$('.chapter-card:not(.closing)')) await page.click('.chapter-card', { timeout: 2000 }).catch(() => {});
    else if (await page.$('.dlg:not(.closing)')) await page.click('.dlg:not(.closing) .dlg-skip', { timeout: 2000 }).catch(() => {});
    else if (i > 4) break;
    await sleep(350);
  }
  const list = (process.env.SCENES || 'dorm,college,cafe,park,mall,home,beach,garden,mylab').split(',');
  const night = process.env.T === 'night';
  for (const id of list) {
    await page.evaluate(async ({ id, night }) => {
      const g = await import('/js/game.js');
      const S = window.__lana.S;
      S.settings.speed = 0;
      S.minutes = night ? 22 * 60 : 12 * 60;
      if (id === 'mylab') { S.lab.owned = true; S.lab.upgrades = ['sign', 'plants', 'microscope', 'coffee', 'furnace', 'mill']; S.flags.opened = true; }
      S.city = ['home', 'beach', 'garden', 'mylab'].includes(id) ? 'abkhazia' : 'moscow';
      await g.goScene(id, { transition: false });
    }, { id, night });
    await sleep(1500);
    await shot(`s-${id}-${night ? 'n' : 'd'}-a`);
    if (process.env.TWICE) {
      await sleep(1700);
      await shot(`s-${id}-${night ? 'n' : 'd'}-b`);
    }
  }
};
