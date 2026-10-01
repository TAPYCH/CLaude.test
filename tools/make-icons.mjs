// Renders PWA icons from tools/icon.html with headless Chromium.
import { chromium } from 'playwright';
const browser = await chromium.launch();
const out = [
  ['icons/icon-512.png', 512, 0], ['icons/icon-192.png', 192, 0], ['icons/apple-touch-icon.png', 180, 0],
  ['icons/icon-maskable-512.png', 512, 1], ['icons/favicon-64.png', 64, 0],
];
for (const [file, size, m] of out) {
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: size / 512 });
  await page.goto(`http://localhost:8080/tools/icon.html?m=${m}`);
  await page.waitForTimeout(300);
  await page.locator('#c').screenshot({ path: file, omitBackground: !m && file.includes('icon-') ? true : false });
  await page.close();
  console.log('wrote', file);
}
await browser.close();
