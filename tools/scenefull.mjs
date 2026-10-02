import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 700 } });
await p.goto('http://localhost:8080/index.html');
await p.waitForTimeout(800);
const html = await p.evaluate(async (id) => { const { SCENES } = await import('/js/data/scenes.js'); const sc = SCENES[id]; return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sc.width} 1000" width="${sc.width/2}" height="500">${sc.paint({ phase: 'day', season: 'autumn', S: window.__lana ? window.__lana.S : {} })}</svg>`; }, process.argv[2] || 'dorm');
await p.setContent(`<body style="margin:0">${html}</body>`);
await p.screenshot({ path: process.argv[3] || 'dorm-full.png', fullPage: true });
await b.close();
