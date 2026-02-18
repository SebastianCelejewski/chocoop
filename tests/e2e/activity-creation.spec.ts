import { test, expect, Page } from '@playwright/test';

const activityListDateFormat = new Intl.DateTimeFormat(undefined, {dateStyle: "full"});

test('created activity appears on activity list', async({ page }) => {
  const activityId = (await createActivity(page, "")).id;

  await test.step("System navigated to the activity list", async () => {
    await expect(page.getByTestId('activity-list-page')).toBeVisible();
  })

  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activityId + '"]');
  await activityCard.scrollIntoViewIfNeeded();
  
  await test.step("Created activity appears on activity list", async () => {
    await expect(activityCard).toBeVisible();
  })
});

test('created activity has properties with values set during the creation', async({ page }) => {
  const createdActivity = await createActivity(page, "");
  
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
  
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + createdActivity.id + '"]');
  await activityCard.scrollIntoViewIfNeeded();

  await test.step("Created activity has properties that were set during creation", async () => {
    await expect(activityCard.getByTestId('person-property')).toHaveText(createdActivity.personNickName);
    await expect(activityCard.getByTestId('date-property')).toHaveText(createdActivity.date);
    await expect(activityCard.getByTestId('type-property')).toHaveText(createdActivity.type);
    await expect(activityCard.getByTestId('exp-property')).toHaveText(createdActivity.exp + " xp");
  })
});

test('created activity that has a comment should have a comment icon on activity list', async({ page }) => {
  const activityId = (await createActivity(page, "a comment")).id;

  await expect(page.getByTestId('activity-list-page')).toBeVisible();

  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activityId + '"]');
  await activityCard.scrollIntoViewIfNeeded();

  await expect(activityCard).toBeVisible();

  await test.step("Created activity does not have comment icon", async () => {
    await expect(activityCard.getByTestId('comment-property')).toBeVisible();
  })
});

test('created activity that does not have a comment should not have a comment icon on activity list', async({ page }) => {
  const activityId = (await createActivity(page, "")).id;

  await expect(page.getByTestId('activity-list-page')).toBeVisible();

  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activityId + '"]');
  await activityCard.scrollIntoViewIfNeeded();

  await expect(activityCard).toBeVisible();

  await test.step("Created activity does not have comment icon", async () => {
    await expect(activityCard.getByTestId('comment-property')).not.toBeVisible();
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

async function createActivity(page: Page, activityComment: string) {
  await goToActivityList(page);
  await goToActivityCreate(page);

  const activityTestId = generateTestId();
  const activityType = generateTestType(activityTestId);
  const activityExp = generateRandomExp();
  const activityPerson = await page.getByTestId('user-nickname').textContent();
  const activityDateFromDatePicker = await page.getByTestId('activity-date-input').inputValue();
  const activityDateForActivityList = activityListDateFormat.format(Date.parse(activityDateFromDatePicker));

  await page.getByTestId('activity-type-input').first().fill(activityType);
  await page.getByTestId('activity-exp-input').first().fill(activityExp);

  if (activityComment != null && activityComment !== "") {
    await page.getByTestId('activity-comment-input').first().fill(activityComment);
  }

  const responsePromise = page.waitForResponse(resp =>
    resp.url().includes('/graphql') &&
    resp.request().method() === 'POST'
  );

  await page.getByTestId('submit-button').first().click();

  const response = await responsePromise;
  const body = await response.json();
  const activityId = body.data.createActivity.id

  return {
    id: activityId,
    personNickName: activityPerson || '',
    date: activityDateForActivityList,
    type: activityType,
    exp: activityExp,
    comment: activityComment
  }
}

function generateTestId(): string {
  const id = crypto.randomUUID().split("-").at(-1);
  if (!id) throw new Error("Failed to generate test ID");
  return id;
}

function generateTestType(testId: string): string {
  return "Test " + testId;
}

function generateRandomExp(): string {
  return Math.floor(Math.random() * 200 + 1).toString();
}

function generateTestComment(testId: string): string {
  return "Test comment " + testId;
}
