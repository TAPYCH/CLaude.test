const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot, ctx }) => {
  await page.goto('http://localhost:8080/index.html');
  await sleep(4000);
  const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return !!(r && r.active); });
  const cached = await page.evaluate(async () => { const keys = await caches.keys(); const c = await caches.open(keys[0]); return (await c.keys()).length; });
  console.log('sw active:', sw, 'cached files:', cached);
  await ctx.setOffline(true);
  await page.reload();
  await sleep(2500);
  await page.$eval('.title-actions .btn', (e) => e.click());
  await sleep(600);
  const story = await page.$('.story, #world');
  console.log('offline boot ok:', !!story);
  await shot('82-offline');
};
