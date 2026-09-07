import playwright from "playwright";
const { chromium } = playwright;
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (m) => console.log("[console]", m.text()));
await page.goto("http://localhost:3000/applications/demo-application/review");
await page.waitForTimeout(1000);

const box = await page.locator('#declaration-accurate').boundingBox();
console.log("box:", box);

const elInfo = await page.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y);
  return { tag: el?.tagName, id: el?.id, cls: el?.className, cursorPE: getComputedStyle(el).pointerEvents };
}, [box.x + box.width / 2, box.y + box.height / 2]);
console.log("element at center:", elInfo);

const before = await page.locator('#declaration-accurate').getAttribute("data-state");
console.log("before click data-state:", before);
console.log("before aria-checked:", await page.locator('#declaration-accurate').getAttribute("aria-checked"));

await page.locator('#declaration-accurate').click();
await page.waitForTimeout(300);

console.log("after click data-state:", await page.locator('#declaration-accurate').getAttribute("data-state"));
console.log("after aria-checked:", await page.locator('#declaration-accurate').getAttribute("aria-checked"));

// check for react errors on page
const errs = await page.evaluate(() => window.__NEXT_HYDRATION_ERROR__ || null);
console.log("hydration error flag:", errs);

await browser.close();
