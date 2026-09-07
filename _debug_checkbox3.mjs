import playwright from "playwright";
const { chromium } = playwright;
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:3000/applications/demo-application/review");
await page.waitForSelector("#declaration-accurate");

const dupCount = await page.evaluate(() => document.querySelectorAll('#declaration-accurate').length);
console.log("duplicate id count:", dupCount);

const outerHTML = await page.locator("#declaration-accurate").evaluate((el) => el.outerHTML);
console.log("outerHTML:", outerHTML);

// try dispatching a raw click event via evaluate directly on the element
await page.evaluate(() => {
  const el = document.getElementById('declaration-accurate');
  el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  el.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
  el.click();
});
await page.waitForTimeout(300);
console.log("after direct dispatch aria-checked:", await page.locator("#declaration-accurate").getAttribute("aria-checked"));

// try Playwright force click
await page.locator("#declaration-accurate").click({ force: true });
await page.waitForTimeout(300);
console.log("after force click aria-checked:", await page.locator("#declaration-accurate").getAttribute("aria-checked"));

await browser.close();
