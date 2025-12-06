const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function captureBrowserTelemetry(page, namePrefix) {
  const artifactsDir = path.join("artifacts");
  ensureDir(artifactsDir);
  const networkLog = [];
  const consoleLog = [];

  page.on("request", (req) => {
    networkLog.push({
      type: "request",
      method: req.method(),
      url: req.url(),
      headers: req.headers(),
      timestamp: Date.now(),
    });
  });
  page.on("requestfailed", (req) => {
    networkLog.push({
      type: "requestfailed",
      method: req.method(),
      url: req.url(),
      failure: req.failure(),
      timestamp: Date.now(),
    });
  });
  page.on("response", async (res) => {
    try {
      networkLog.push({
        type: "response",
        status: res.status(),
        url: res.url(),
        headers: res.headers(),
        timestamp: Date.now(),
      });
    } catch {}
  });
  page.on("console", (msg) => {
    consoleLog.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: Date.now(),
    });
  });

  return {
    async flush() {
      const netPath = path.join(artifactsDir, `${namePrefix}-network.json`);
      const conPath = path.join(artifactsDir, `${namePrefix}-console.json`);
      fs.writeFileSync(netPath, JSON.stringify(networkLog, null, 2));
      fs.writeFileSync(conPath, JSON.stringify(consoleLog, null, 2));
    },
  };
}

async function login(page, username, password) {
  await test.step("Navigate and login", async () => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const userInput = page.locator('#username');
    const passInput = page.locator('#password');
    const submitBtn = page.locator('#loginBtn');
    await userInput.waitFor({ state: "visible", timeout: 45000 });
    await passInput.waitFor({ state: "visible", timeout: 45000 });
    await userInput.fill(username);
    await passInput.fill(password);
    await submitBtn.click();
    await page.locator('#appContainer').waitFor({ state: "visible", timeout: 45000 });
  });
}

test("ERP - login and load HRM Employees grid", async ({ page }) => {
  const telemetry = await captureBrowserTelemetry(page, "hrm-employees");
  const username = process.env.ERP_USER || "";
  const password = process.env.ERP_PASS || "";

  try {
    await login(page, username, password);

    await test.step("Open HRM module and validate grid", async () => {
      const hrmNav = page.locator('.nav-link[data-view="hrm"]');
      await hrmNav.click();
      const pageTitle = page.locator('#hrmView .page-title');
      await expect(pageTitle).toHaveText(/الموارد البشرية/);
      const table = page.locator('#hrmView .data-table');
      await expect(table).toBeVisible();
      const headers = table.locator('thead th');
      await expect(await headers.count()).toBeGreaterThan(3);
      await page.screenshot({ path: path.join('artifacts', 'hrm-grid.png'), fullPage: true });
    });
  } catch (e) {
    await page.screenshot({
      path: path.join("artifacts", "error.png"),
      fullPage: true,
    });
    throw e;
  } finally {
    await telemetry.flush();
  }
});

expect.extend({
  toHaveCountGreaterThan(locator, expected) {
    return locator.count().then((actual) => {
      const pass = actual > expected;
      return {
        pass,
        message: () => `expected count > ${expected} but got ${actual}`,
      };
    });
  },
});
