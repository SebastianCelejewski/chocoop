import { test, expect, Page } from '@playwright/test';

const activityListDateFormat = new Intl.DateTimeFormat(undefined, {dateStyle: "full"});

test('current day is used as activity date if no date is selected', async({page}) => {
  await goToActivityList(page);
  await goToActivityCreate(page);

  const dateField = page.getByTestId('activity-date-input');
  await expect(dateField).toBeVisible();

  const today = await page.evaluate(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  await expect(dateField).toHaveValue(today);
})

test('current day is used as activity date if current date button is clicked', async({page}) => {
  await goToActivityList(page);
  await goToActivityCreate(page);

  const todayButton = page.getByTestId('today-button');
  const dateField = page.getByTestId('activity-date-input');

  await expect(dateField).toBeVisible();
  await dateField.fill("2023-01-01");

  await expect(todayButton).toBeVisible();
  await todayButton.click();

  const today = await page.evaluate(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  await expect(dateField).toHaveValue(today);
})

test('previous day is used as activity date if previous date button is clicked', async({page}) => {
  await goToActivityList(page);
  await goToActivityCreate(page);

  const yesterdayButton = page.getByTestId('yesterday-button');
  const dateField = page.getByTestId('activity-date-input');

  await expect(dateField).toBeVisible();
  await dateField.fill("2023-01-01");

  await expect(yesterdayButton).toBeVisible();
  await yesterdayButton.click();

  const yesterday = await page.evaluate(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  await expect(dateField).toHaveValue(yesterday);
})

test('custom date is used as activity day if date is selected via date picker', async({page}) => {
 await goToActivityList(page);
  await goToActivityCreate(page);

  const yesterdayButton = page.getByTestId('yesterday-button');
  const dateField = page.getByTestId('activity-date-input');

  await expect(dateField).toBeVisible();
  await dateField.click();

  await expect(dateField).toHaveValue(new Date().toISOString().split("T")[0]);
})

test('activity type and exp is filled in after template icon is clicked', async({page}) => {
  await goToActivityList(page);
  await goToActivityCreate(page);

  const typeField = page.getByTestId('activity-type-input');
  const expField = page.getByTestId('activity-exp-input');
  const templateButton = page.getByTestId('template-button').first();

  await templateButton.click();

  await expect(typeField).toHaveValue("odkurzanie");
  await expect(expField).toHaveValue("10");
})

test('created activity appears on activity list', async({ page }) => {
  const activityId = (await createActivity(page, false)).id;

  await test.step("System navigated to the activity list", async () => {
    await expect(page.getByTestId('activity-list-page')).toBeVisible();
  })

  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activityId + '"]');

  scrollTheListToLoadAllElements(page);
  
  await test.step("Created activity appears on activity list", async () => {
    await expect(activityCard).toBeVisible();
  })
});

test('created activity has properties with values set during the creation', async({ page }) => {
  const createdActivity = await createActivity(page, false);
  
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
  
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + createdActivity.id + '"]');

  scrollTheListToLoadAllElements(page);

  await expect(activityCard).toBeVisible();

  await test.step("Created activity has properties that were set during creation", async () => {
    await expect(activityCard.getByTestId('person-property')).toHaveText(createdActivity.personNickName);
    await expect(activityCard.getByTestId('date-property')).toHaveText(createdActivity.date);
    await expect(activityCard.getByTestId('type-property')).toHaveText(createdActivity.type);
    await expect(activityCard.getByTestId('exp-property')).toHaveText(createdActivity.exp + " xp");
  })
});

test('created activity that has a comment should have a comment icon on activity list', async({ page }) => {
  const activityId = (await createActivity(page, true)).id;

  await expect(page.getByTestId('activity-list-page')).toBeVisible();

  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activityId + '"]');
  
  scrollTheListToLoadAllElements(page);

  await expect(activityCard).toBeVisible();

  await test.step("Created activity has a comment icon", async () => {
    await expect(activityCard.getByTestId('comment-property')).toBeVisible();
  })
});

test('created activity that does not have a comment should not have a comment icon on activity list', async({ page }) => {
  const activityId = (await createActivity(page, false)).id;

  await expect(page.getByTestId('activity-list-page')).toBeVisible();

  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activityId + '"]');
  
  scrollTheListToLoadAllElements(page);

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

async function createActivity(page: Page, generateComment: boolean) {
  await goToActivityList(page);
  await goToActivityCreate(page);

  const activityTestId = generateTestId();
  const activityType = generateTestType(activityTestId);
  const activityExp = generateTestExp();
  const activityDate = generateTestDate();
  const activityPerson = await page.getByTestId('user-nickname').textContent();
  const activityDateForActivityList = activityListDateFormat.format(Date.parse(activityDate));
  var activityComment = "";

  await page.getByTestId('activity-date-input').first().fill(activityDate);
  await page.getByTestId('activity-type-input').first().fill(activityType);
  await page.getByTestId('activity-exp-input').first().fill(activityExp);

  if (generateComment) {
    activityComment = generateTestComment(activityTestId);
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

function generateTestExp(): string {
  return Math.floor(Math.random() * 200 + 1).toString();
}

function generateTestDate(): string {
  const today = new Date();
  const randomDayOffset = Math.floor(Math.random() * 100) - 100;
  today.setDate(today.getDate() + randomDayOffset);
  return today.toISOString().split("T")[0];
}

function generateTestComment(testId: string): string {
  return "Test comment " + testId;
}

async function scrollTheListToLoadAllElements(page: Page) {
  const grid = page.locator('.ReactVirtualized__Grid');
  
  await grid.evaluate(el => {
    el.scrollTop = el.scrollHeight;
  });
}
