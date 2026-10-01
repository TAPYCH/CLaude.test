// Usage: node tools/shot.mjs <url-path> <out.png> [width] [height] [fullPage]
import { chromium } from 'playwright';
const [,, path, out, w = '1200', h = '900', full = '1', mobile = '0'] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mobile === '1' ? 2 : 1, isMobile: mobile === '1', hasTouch: mobile === '1' });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto('http://localhost:8080/' + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(+(process.env.WAIT || 600));
await page.screenshot({ path: out, fullPage: full === '1' });
if (errors.length) console.log(errors.join('\n'));
await browser.close();
