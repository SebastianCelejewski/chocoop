import { test, expect } from '@playwright/test';

test('setup auth session', async ({ page }) => {
  await page.goto('/');

  const activityList = page.getByTestId('activity-list-page');
  const loginInput = page.locator('input[name="username"]');

  // Waiting for login screen or activity list screen
  await Promise.race([
    activityList.waitFor({ state: 'visible' }),
    loginInput.waitFor({ state: 'visible' })
  ]);

  // Exit if already logged in
  if (await activityList.isVisible()) {
    await page.context().storageState({
      path: 'tests/e2e/.auth/state.json',
    });
    return;
  }

  // Log in if not yet logged in
  await page.fill('input[name="username"]', process.env.E2E_EMAIL!);
  await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
  await page.click('button[type="submit"]');

  // Waiting for activity list after log in
  await expect(activityList).toBeVisible();

  // Waiting for authentication data to appear on disk
  await page.context().storageState({
    path: 'tests/e2e/.auth/state.json',
  });
});
