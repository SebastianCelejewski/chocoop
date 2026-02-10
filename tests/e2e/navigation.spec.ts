import { test, expect, Page } from '@playwright/test';

test('entering the main page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
});

test('direct navigation to list of activities', async ({ page }) => {
  await page.goto('/ActivityList/');
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
});

test('direct navigation to list of work requests', async ({ page }) => {
  await page.goto('/WorkRequestList/');
  await expect(page.getByTestId('work-request-list-page')).toBeVisible();
});

test('direct navigation to about page', async ({ page }) => {
  await page.goto('/About/WhatsNew/');
  await expect(page.getByTestId('about-page')).toBeVisible();
});

test('direct navigation to experience statistics page', async ({ page }) => {
  await page.goto('/ExpStats/');
  await expect(page.getByTestId('exp-stats-page')).toBeVisible();
});

test('navigation from activity list to work request list by clicking the page title', async({ page }) => {
  await goToActivityList(page);
  await page.getByTestId('activity-list-page').click();
  await expect(page.getByTestId('work-request-list-page')).toBeVisible();
});

test('navigation from work request list to activity list by clicking the page title', async({ page }) => {
  await goToWorkRequestList(page);
  await page.getByTestId('work-request-list-page').click();
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
});

test('navigation from activity list to activity details', async({ page }) => {
  await goToActivityList(page);
  await page.getByTestId('activity-card').first().click();
  await expect(page.getByTestId('activity-details-page')).toBeVisible();
});

test('navigation from activity details to activity list', async({ page }) => {
  await goToActivityList(page);
  await goToFirstActivityDetails(page);

  await page.getByTestId('back-button').first().click();
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
});

test('navigation from activity details to activity edit', async({ page }) => {
  await goToActivityList(page);
  await goToFirstActivityDetails(page);

  await page.getByTestId('edit-button').first().click();
  await expect(page.getByTestId('activity-edit-page')).toBeVisible();
  await expect(page.getByTestId('activity-edit-page')).toHaveAttribute('data-mode', 'update');
});

test('navigation from activity edit to activity details', async({ page }) => {
  await goToActivityList(page);
  await goToFirstActivityDetails(page);
  await goToActivityEdit(page);

  await page.getByTestId('cancel-button').first().click();
  await expect(page.getByTestId('activity-details-page')).toBeVisible();
});

test('navigation from activity list to activity creation', async({ page }) => {
  await goToActivityList(page);
  await page.getByTestId('create-button').first().click();
  await expect(page.getByTestId('activity-edit-page')).toBeVisible();
  await expect(page.getByTestId('activity-edit-page')).toHaveAttribute('data-mode', 'create');
});

test('navigation from activity creation to activity list', async({ page }) => {
  await goToActivityList(page);
  await goToActivityCreate(page);

  await page.getByTestId('cancel-button').first().click();
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
});


async function goToActivityList(page: Page) {
  await page.goto('/ActivityList/');
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
}

async function goToFirstActivityDetails(page: Page) {
  const activity = page.locator('[data-testid="activity-card"]').first();
  await activity.scrollIntoViewIfNeeded();
  await activity.click();
  await expect(page.getByTestId('activity-details-page')).toBeVisible();
}

async function goToActivityEdit(page: Page) {
  await page.getByTestId('edit-button').first().click();
  await expect(page.getByTestId('activity-edit-page')).toBeVisible();
}

async function goToActivityCreate(page: Page) {
  await page.getByTestId('create-button').first().click();
  await expect(page.getByTestId('activity-edit-page')).toBeVisible();
}
 
async function goToWorkRequestList(page: Page) {
  await page.goto('/WorkRequestList/');
  await expect(page.getByTestId('work-request-list-page')).toBeVisible();
}

