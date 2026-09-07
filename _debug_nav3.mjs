import playwright from "playwright";
const { chromium } = playwright;
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.goto("http://localhost:3000/applications/demo-application/personal-details");
await page.waitForTimeout(1000);

await page.fill('input[placeholder="Enter your full name"]', "John Smith");
await page.fill('input[placeholder="you@example.com"]', "john.smith@example.com");
await page.fill('input[placeholder="07123 456789"]', "07123456789");
await page.fill('input[placeholder="Start typing your address"]', "1 Test Street, London");
await page.fill('input[placeholder="e.g. SW1A 1AA"]', "SW1A 1AA");

console.log("step before job-prefs nav:", await page.locator("text=/Step \\d+ of/i").first().innerText());
await page.locator('button:has-text("Job preferences")').click();
await page.waitForTimeout(500);
console.log("step after job-prefs nav:", await page.locator("text=/Step \\d+ of/i").first().innerText());

const workBtn = page.locator('button:has-text("Work experience")');
console.log("work btn count:", await workBtn.count());
await workBtn.click();
await page.waitForTimeout(800);
console.log("step after work nav:", await page.locator("text=/Step \\d+ of/i").first().innerText());
await browser.close();
