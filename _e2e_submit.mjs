import playwright from "playwright";
const { chromium } = playwright;

const browser = await chromium.launch();
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
page.on("pageerror", (err) => { console.log("[pageerror]", err.message); consoleErrors.push("[pageerror] " + err.message); });

async function gotoStep(label) {
  const sidebarNav = page.locator('nav[aria-label="Application steps"]').first();
  await sidebarNav.getByRole("button", { name: label, exact: true }).click();
  await page.waitForTimeout(500);
}

// Load the SPA once; all step navigation below happens client-side (sidebar clicks), matching real usage.
await page.goto("http://localhost:3000/applications/demo-application/personal-details");
await page.waitForTimeout(1000);

await page.fill('input[placeholder="Enter your full name"]', "John Smith");
await page.fill('input[placeholder="you@example.com"]', "john.smith@example.com");
await page.fill('input[placeholder="07123 456789"]', "07123456789");
await page.fill('input[placeholder="Start typing your address"]', "1 Test Street, London");
await page.fill('input[placeholder="e.g. SW1A 1AA"]', "SW1A 1AA");

console.log("Navigating to Job preferences via sidebar...");
await gotoStep("Job preferences");

const roleTrigger = page.locator('button:has-text("Select a role")');
await roleTrigger.click();
await page.waitForTimeout(200);
await page.locator('[role="option"]').first().click();
await page.waitForTimeout(200);

console.log("Navigating to Work experience via sidebar...");
await gotoStep("Work experience");
await page.fill('input[placeholder="Enter job title"]', "Support Worker");
await page.fill('input[placeholder="Enter employer"]', "Acme Care Ltd");

console.log("Navigating to Education via sidebar...");
await gotoStep("Education");
await page.fill('input[placeholder="Enter institution"]', "City College");
await page.fill('input[placeholder="Enter qualification"]', "NVQ Level 3");

console.log("Navigating to References via sidebar...");
await gotoStep("References");
await page.fill('input[placeholder="Enter reference name"]', "Jane Doe");
await page.fill('input[placeholder="Enter email address"]', "jane.doe@example.com");

console.log("Navigating to Review & submit via sidebar...");
await gotoStep("Review & submit");
await page.waitForTimeout(500);

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
await page.waitForTimeout(500);
try {
  await page.waitForSelector('text=Confirm submit application', { timeout: 5000 });
  console.log("Dialog opened");
} catch {
  console.log("Dialog did NOT open. Toast/body text:", (await page.locator('body').innerText()).slice(0, 500));
  await browser.close();
  process.exit(0);
}

const confirmBtn = page.locator('button:has-text("Confirm Submit")');
console.log("Double-clicking Confirm Submit rapidly (race test)...");
await Promise.all([
  confirmBtn.click(),
  confirmBtn.click({ force: true }).catch((e) => console.log("second click error (expected once disabled):", e.message)),
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
console.log("References found on page:", [...new Set(refs)]);

console.log("Console errors collected:", consoleErrors);

await browser.close();
