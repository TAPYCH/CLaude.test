// Scripted playthrough helper: node tools/play.mjs <script.js> — script gets {page, shot}
import { chromium } from 'playwright';
const [,, scriptPath, w = '390', h = '844'] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, isMobile: +w < 800, hasTouch: +w < 800 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message + '\n' + e.stack));
const OUT = process.env.OUT || '/tmp';
const shot = async (name) => { await page.screenshot({ path: `${OUT}/${name}.png` }); console.log('shot', name); };
const mod = await import(new URL(scriptPath, 'file://' + process.cwd() + '/').href);
try { await mod.default({ page, shot, ctx }); } catch (e) { console.log('SCRIPT ERROR', e.message); await shot('error'); }
if (errors.length) console.log('CONSOLE:\n' + errors.join('\n'));
await browser.close();
