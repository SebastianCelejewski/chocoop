import { expect, Page } from '@playwright/test';

async function goToActivityList(page: Page) {
  await page.goto('/ActivityList/');
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
}

async function goToActivityCreate(page: Page) {
  await page.getByTestId('create-button').first().click();
  await expect(page.getByTestId('activity-edit-page')).toBeVisible();
}

export {
    goToActivityCreate, goToActivityList
}