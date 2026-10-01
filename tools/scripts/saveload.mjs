const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(1400);
  await page.$eval('.title-actions .btn', (e) => e.click());
  await sleep(400);
  await page.$eval('.story .skip', (e) => e.click());
  await sleep(1000);
  const before = await page.evaluate(async () => {
    const g = await import('/js/game.js');
    __lana.S.money = 7777;
    g.adoptPet('bunny', 'Зефирка');
    await g.goScene('cafe', { transition: false });
    __lana.save();
    return JSON.stringify({ scene: __lana.S.scene, money: __lana.S.money, pets: __lana.S.pets.length, day: __lana.S.day });
  });
  await page.reload();
  await sleep(1500);
  await shot('80-continue');
  await page.$eval('.title-actions .btn', (e) => e.click());
  await sleep(2500);
  const after = await page.evaluate(() => JSON.stringify({ scene: __lana.S.scene, money: __lana.S.money, pets: __lana.S.pets.length, day: __lana.S.day }));
  console.log('before', before, '\nafter ', after, '\npet in scene:', await page.$$eval('.actor.pet', (n) => n.length));
  await shot('81-restored');
};
