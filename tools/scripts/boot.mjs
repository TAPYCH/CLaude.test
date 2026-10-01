export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/index.html');
  await page.waitForTimeout(1800);
  await shot('01-title');
  await page.click('.title-actions .btn');
  await page.waitForTimeout(900);
  await shot('02-intro');
  await page.click('.story .skip');
  await page.waitForTimeout(2500);
  await shot('03-game');
  await page.waitForTimeout(4500);
  await shot('04-game-msg');
};
