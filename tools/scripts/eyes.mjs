const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, shot }) => {
  await page.goto('http://localhost:8080/tools/preview.html?mode=face');
  await page.addStyleTag({ path: 'css/style.css' });
  await sleep(500);
  await page.addStyleTag({ content: '.lana-svg .look, .lana-svg .body-root, .lana-svg .head, .lana-svg .hair-back { animation: none !important; }' });
  await shot('eye-open');
  await page.addStyleTag({ content: '.lana-svg .eye { transform: scaleY(0.08) !important; }' });
  await sleep(100);
  await shot('eye-blink');
  await page.addStyleTag({ content: '.lana-svg .eye { transform: none !important; } .lana-svg .look { transform: translate(-1.8px, .3px) !important; }' });
  await sleep(100);
  await shot('eye-look');
};
