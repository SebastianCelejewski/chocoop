import { test, expect, Page } from "@playwright/test";

test("entering the main page lands on activity list", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("activity-list-page")).toBeVisible();
});

test("direct navigation to about page", async ({ page }) => {
  await page.goto("/About/WhatsNew/");
  await expect(page.getByTestId("about-page")).toBeVisible();
});

test("direct navigation to experience statistics page", async ({ page }) => {
  await page.goto("/ExpStats/");
  await expect(page.getByTestId("exp-stats-page")).toBeVisible();
});

test("navigation from activity list to work request list by clicking the page title", async({ page }) => {
  await goToActivityList(page);
  await page.getByTestId("activity-list-page").click();
  await expect(page.getByTestId("work-request-list-page")).toBeVisible();
});

test("navigation from work request list to activity list by clicking the page title", async({ page }) => {
  await goToWorkRequestList(page);
  await page.getByTestId("work-request-list-page").click();
  await expect(page.getByTestId("activity-list-page")).toBeVisible();
});

async function goToActivityList(page: Page) {
  await page.goto("/ActivityList/");
  await expect(page.getByTestId("activity-list-page")).toBeVisible();
}

async function goToWorkRequestList(page: Page) {
  await page.goto("/WorkRequestList/");
  await expect(page.getByTestId("work-request-list-page")).toBeVisible();
}
