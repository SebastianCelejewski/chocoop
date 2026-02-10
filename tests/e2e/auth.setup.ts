import { test, expect } from '@playwright/test';

test('setup auth session', async ({ page }) => {
  await page.goto('/');

  await page.fill('input[name="username"]', process.env.E2E_EMAIL!);
  await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
  await page.click('button[type="submit"]');

  await expect(
    page.locator('[data-amplify-authenticator]')
  ).toHaveCount(0);

  await page.context().storageState({
    path: 'tests/e2e/.auth/state.json',
  });
});
