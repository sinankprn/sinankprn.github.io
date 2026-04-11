const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  const target = process.argv[2] || "http://localhost:4000/";
  const outPath = process.argv[3] || path.join(__dirname, "..", "snapshot.png");
  const width = parseInt(process.argv[4] || "1280", 10);
  const height = parseInt(process.argv[5] || "900", 10);

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width, height, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto(target, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  await page.screenshot({ path: outPath, fullPage: false });
  await browser.close();
  console.log(`saved ${outPath}`);
})();
