import { test, expect } from "@playwright/test";

// This is a bootstrap helper used to create or refresh the authenticated
// Playwright storage state. It is intentionally not part of the main
// product-regression suite.
test("setup auth session", async ({ page }) => {
  await page.goto("/");

  const activityList = page.getByTestId("activity-list-page");
  const loginInput = page.locator('input[name="username"]');

  await Promise.race([
    activityList.waitFor({ state: "visible" }),
    loginInput.waitFor({ state: "visible" })
  ]);

  if (await activityList.isVisible()) {
    await page.context().storageState({
      path: "tests/e2e/.auth/state.json",
    });
    return;
  }

  await page.fill('input[name="username"]', process.env.E2E_EMAIL!);
  await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
  await page.click('button[type="submit"]');

  await expect(activityList).toBeVisible({ timeout: 30000 });

  await page.context().storageState({
    path: "tests/e2e/.auth/state.json",
  });
});
