const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();

  const filePath = 'file://' + path.resolve('index.html');

  // First pass: measure full height at A4 width (794px = ~210mm at 96dpi)
  await page.setViewport({ width: 794, height: 1200 });
  await page.goto(filePath, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);

  const fullHeight = await page.evaluate(
    () => document.documentElement.scrollHeight
  );

  // Second pass: render at exact full height so nothing is clipped
  await page.setViewport({ width: 794, height: fullHeight });
  await page.goto(filePath, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: 'Chaty_na_Slovensku.pdf',
    width: '794px',
    height: fullHeight + 'px',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
  console.log('PDF generated — height:', fullHeight, 'px');
})();
