// New game → chapter 1 card + dialogue → path app → lab app.
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(1600);
  await page.click('.title-actions .btn');
  await page.waitForTimeout(700);
  await page.click('.story .skip');
  await page.waitForTimeout(2000);
  await shot('c01-chapter-card');
  await page.click('.chapter-card');
  await page.waitForTimeout(900);
  await shot('c02-dialogue-narr');
  await page.click('.dlg');
  await page.waitForTimeout(1600);
  await shot('c03-dialogue-katya');
  for (let i = 0; i < 12 && (await page.$('.dlg')); i++) {
    await page.click('.dlg');
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(800);
  await shot('c04-game');
  await page.click('.phone-btn');
  await page.waitForTimeout(700);
  await shot('c05-phone-home');
  await page.click('[data-app="path"]');
  await page.waitForTimeout(600);
  await shot('c06-path');
  await page.evaluate(() => document.querySelector('.app-view .app-body').scrollTo(0, 700));
  await page.waitForTimeout(300);
  await shot('c07-path2');
  await page.evaluate(() => document.querySelector('.app-view .app-body').scrollTo(0, 99999));
  await page.waitForTimeout(300);
  await shot('c08-path3');
};
