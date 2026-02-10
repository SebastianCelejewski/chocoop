import { test, expect } from '@playwright/test';

test('aplikacja się uruchamia', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Chores Cooperative/i);
});
