import playwright from "playwright";
const { chromium } = playwright;

const browser = await chromium.launch();
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); if (msg.text().includes("DEBUG2")) console.log(msg.text()); });
page.on("pageerror", (err) => consoleErrors.push("[pageerror] " + err.message));

// Load the SPA once; all step navigation below happens client-side (sidebar clicks), matching real usage.
await page.goto("http://localhost:3000/applications/demo-application/personal-details");
await page.waitForTimeout(1000);

await page.fill('input[placeholder="Enter your full name"]', "John Smith");
await page.fill('input[placeholder="you@example.com"]', "john.smith@example.com");
await page.fill('input[placeholder="07123 456789"]', "07123456789");
await page.fill('input[placeholder="Start typing your address"]', "1 Test Street, London");
await page.fill('input[placeholder="e.g. SW1A 1AA"]', "SW1A 1AA");

console.log("Navigating to Job preferences via sidebar...");
await page.click('text=Job preferences');
await page.waitForTimeout(500);

const roleTrigger = page.locator('button:has-text("Select a role")');
await roleTrigger.click();
await page.waitForTimeout(200);
await page.locator('[role="option"]').first().click();
await page.waitForTimeout(200);
console.log("Role trigger after selection still shows placeholder:", await roleTrigger.count());

console.log("Navigating to Review & submit via sidebar...");
await page.click('text=Review & submit');
await page.waitForTimeout(800);

const checkboxes = page.locator('#declaration-accurate, #declaration-edit-restriction');
const count = await checkboxes.count();
console.log("checkbox count:", count);
const submitBtn = page.locator('button:has-text("Submit Application")');
for (let i = 0; i < count; i++) {
  await checkboxes.nth(i).click();
  await page.waitForTimeout(300);
  console.log("checked box", i, "state:", await checkboxes.nth(i).getAttribute("data-state"), "| submit disabled now:", await submitBtn.isDisabled());
}

await page.waitForTimeout(500);
console.log("Submit Application disabled (final)?", await submitBtn.isDisabled());

console.log("Clicking Submit Application...");
await submitBtn.click();
await page.waitForSelector('text=Confirm submit application', { timeout: 10000 });
console.log("Dialog opened");

const confirmBtn = page.locator('button:has-text("Confirm Submit")');
console.log("Double-clicking Confirm Submit rapidly...");
await Promise.all([
  confirmBtn.click(),
  confirmBtn.click({ force: true }).catch((e) => console.log("second click error (expected if disabled fast enough):", e.message)),
]);

await page.waitForTimeout(300);
const submittingCount = await page.locator('text=Submitting application').count();
console.log("Submitting text visible count:", submittingCount);

try {
  await page.waitForSelector('text=Thank you!', { timeout: 15000 });
  console.log("Reached Thank You screen");
} catch (e) {
  console.log("FAILED to reach Thank You screen:", e.message);
  console.log("Current body text snippet:", (await page.locator('body').innerText()).slice(0, 800));
}

const html = await page.content();
const refs = [...html.matchAll(/APP-\d{4}-\d{6}/g)].map((m) => m[0]);
const uniqueRefs = [...new Set(refs)];
console.log("References found on page:", uniqueRefs);

console.log("Console errors collected:", consoleErrors);

await browser.close();
