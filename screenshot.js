import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto('https://smalul1225-bit.github.io/maestria-video-landing/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'preview-desktop.png', fullPage: true });

await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro size
await page.goto('https://smalul1225-bit.github.io/maestria-video-landing/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'preview-mobile.png', fullPage: true });

await browser.close();
console.log('Done. preview-desktop.png + preview-mobile.png saved.');
