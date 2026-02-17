import { test, expect, Page } from '@playwright/test';

test('created activity appears on activity list with properties set curing the creation', async({ page }) => {

  await goToActivityList(page);
  await goToActivityCreate(page);

  const testId = crypto.randomUUID().split("-").at(-1);

  const testType = "test type " + testId;
  const testExp = "17";
  const testComment = "test comment " + testId;
  
  const activityId = await createActivity(page, testType, testExp, testComment);

  await test.step("System navigated to the activity list", async () => {
    await expect(page.getByTestId('activity-list-page')).toBeVisible();
  })

  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activityId + '"]');

  await test.step("Created activity appears on activity list", async () => {
    await expect(activityCard).toBeVisible();
  })

  await test.step("Created activity has properties that were set during creation", async () => {
    await expect(activityCard.getByTestId('type-property')).toHaveText(testType);
    await expect(activityCard.getByTestId('exp-property')).toHaveText(testExp + " xp");
    await expect(activityCard.getByTestId('comment-property')).toBeVisible();
  })

});

async function goToActivityList(page: Page) {
  await page.goto('/ActivityList/');
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
}

async function goToActivityCreate(page: Page) {
  await page.getByTestId('create-button').first().click();
  await expect(page.getByTestId('activity-edit-page')).toBeVisible();
}

async function createActivity(page: Page, 
  activityType: string, 
  activityExp: string, 
  activityComment: string) {

  await page.getByTestId('activity-type-input').first().fill(activityType);
  await page.getByTestId('activity-exp-input').first().fill(activityExp);
  await page.getByTestId('activity-comment-input').first().fill(activityComment);

  const responsePromise = page.waitForResponse(resp =>
    resp.url().includes('/graphql') &&
    resp.request().method() === 'POST'
  );

  await page.getByTestId('submit-button').first().click();

  const response = await responsePromise;
  const body = await response.json();
  return body.data.createActivity.id
}