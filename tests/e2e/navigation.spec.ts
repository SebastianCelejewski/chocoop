import { test, expect } from '@playwright/test';

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
  await page.goto('/ActivityList/');
  await page.getByTestId('activity-list-page').click();
  await expect(page.getByTestId('work-request-list-page')).toBeVisible();
});

test('navigation from work request list to activity list by clicking the page title', async({ page }) => {
  await page.goto('/WorkRequestList/');
  await page.getByTestId('work-request-list-page').click();
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
});