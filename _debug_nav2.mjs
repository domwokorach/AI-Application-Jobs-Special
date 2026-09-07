import playwright from "playwright";
const { chromium } = playwright;
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.goto("http://localhost:3000/applications/demo-application/job-preferences");
await page.waitForTimeout(1000);

const roleTrigger = page.locator('button:has-text("Select a role")');
await roleTrigger.click();
await page.waitForTimeout(200);
await page.locator('[role="option"]').first().click();
await page.waitForTimeout(300);

console.log("body classes:", await page.evaluate(() => document.body.className));
console.log("body style pointerEvents:", await page.evaluate(() => document.body.style.pointerEvents));
console.log("html attrs:", await page.evaluate(() => document.documentElement.outerHTML.slice(0,200)));

console.log("step text before nav:", await page.locator("text=/Step \\d+ of/i").first().innerText());

const btn = page.locator('button:has-text("Work experience")');
console.log("count:", await btn.count());
await btn.click();
await page.waitForTimeout(800);
console.log("step text after:", await page.locator("text=/Step \\d+ of/i").first().innerText());
await browser.close();
