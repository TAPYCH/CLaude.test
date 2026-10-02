import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 700 } });
await p.goto('http://localhost:8080/index.html'); await p.waitForTimeout(800);
const html = await p.evaluate(async (day) => { const { SCENES } = await import('/js/data/scenes.js'); const sc = SCENES.dorm;
  const S = { decor: ['plant_monstera', 'poster_sea', 'lamp_moon', 'rug_heart', 'bedding_silk'], day };
  return [false, true].map((n) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1000" width="1000" height="500">${sc.paint({ phase: n ? 'night' : 'day', season: 'autumn', S: n ? { ...S, day: 112 } : S })}</svg>`).join('<br>'); }, 10);
await p.setContent(`<body style="margin:0">${html}</body>`);
await p.screenshot({ path: process.argv[2], fullPage: true }); await b.close();
