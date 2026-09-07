import playwright from "playwright";
const { chromium } = playwright;
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://localhost:3000/applications/demo-application/review");
await page.waitForSelector("#declaration-accurate");
await page.locator("#declaration-accurate").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);

console.log("before:", await page.locator("#declaration-accurate").getAttribute("aria-checked"));
await page.locator("#declaration-accurate").click();
await page.waitForTimeout(500);
console.log("after:", await page.locator("#declaration-accurate").getAttribute("aria-checked"));

await page.screenshot({ path: "/tmp/checkbox-state.png", clip: { x: 440, y: 1600, width: 700, height: 200 } }).catch(async () => {
  await page.screenshot({ path: "/tmp/checkbox-state.png" });
});

console.log("errors:", errors);
await browser.close();
