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
    let target = page;
    for (const f of page.frames()) {
      if (await f.$("#login-box")) {
        target = f;
        break;
      }
    }
    if (target === page) {
      const candidates = [
        page.locator('a:has-text("Open")'),
        page.locator('a:has-text("Preview")'),
        page.locator('a:has-text("عرض")'),
        page.locator('a:has-text("فتح")'),
      ];
      for (const l of candidates) {
        if (await l.count()) {
          await l.first().click();
          break;
        }
      }
      await page.waitForLoadState("networkidle");
      for (const f of page.frames()) {
        if (await f.$("#login-box")) {
          target = f;
          break;
        }
      }
    }
    const userInput = target.locator('#login-box input[type="text"]');
    const passInput = target.locator('#login-box input[type="password"]');
    const submitBtn = target.locator("#login-button");
    await userInput.waitFor({ state: "visible", timeout: 45000 });
    await passInput.waitFor({ state: "visible", timeout: 45000 });
    await userInput.fill(username);
    await passInput.fill(password);
    await submitBtn.click();
    await target
      .locator("#nijjara-os")
      .waitFor({ state: "visible", timeout: 45000 });
  });
}

test("ERP - login and load HRM Employees grid", async ({ page }) => {
  const telemetry = await captureBrowserTelemetry(page, "hrm-employees");
  const username = process.env.ERP_USER || "mkhoraiby";
  const password = process.env.ERP_PASS || "123456";

  try {
    await login(page, username, password);

    await test.step("Open HRM module and validate grid", async () => {
      let target = page;
      for (const f of page.frames()) {
        if (await f.$("#nijjara-os")) {
          target = f;
          break;
        }
      }
      const hrmApp = target.locator("#app-hrm");
      await expect(hrmApp).toBeVisible();
      await hrmApp.click();

      const windowTitle = target.locator(".window-header h3");
      await expect(windowTitle).toContainText("وحدة الموارد البشرية");

      const table = target.locator(".module-grid table");
      await expect(table).toBeVisible();
      const headers = table.locator("thead th");
      await expect(headers).toHaveCountGreaterThan(3);
      await page.screenshot({
        path: path.join("artifacts", "hrm-grid.png"),
        fullPage: true,
      });
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
