import { test, expect, Page } from '@playwright/test';

const activityListDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });

test('activity multi-test', async({page}) => {
  await test.step("Navigation: create activity page", async () => {
    await goToActivityList(page);
    await goToActivityCreate(page);
  });

  await test.step("Test: current day is used as activity date if no date is selected", async () => {
    await current_day_is_used_as_activity_date_if_no_date_is_selected(page);
  });

  await test.step('Test: current day is used as activity date if current date button is clicked', async () => {
    await current_day_is_used_as_activity_date_if_current_date_button_is_clicked(page);
  });

  await test.step('Test: previous day is used as activity date if previous date button is clicked', async () => {
    await previous_day_is_used_as_activity_date_if_previous_date_button_is_clicked(page);
  });

  await test.step('Test: activity type and exp is filled in after template icon is clicked', async () => {
    await activity_type_and_exp_is_filled_in_after_template_icon_is_clicked(page);
  });

  var activityWithComment = {};
  var activityWithoutComment = {};

  await test.step('Action: creation of two activities', async() => {
    activityWithComment = await createActivity(page, true);
    activityWithoutComment = await createActivity(page, false);
  })

  await test.step('Test: after activity is created system navigates to activity list', async() => {
    await after_activity_is_created_system_navigates_to_activity_list(page);
  });

  await test.step('Test: created activity appears on activity list', async () => {
    await created_activity_appears_on_activity_list(page, activityWithComment);
    await created_activity_appears_on_activity_list(page, activityWithoutComment);
  });

  await test.step('Test: created activity has properties with values set during the creation', async () => {
    await created_activity_has_properties_with_values_set_during_the_creation(page, activityWithComment);
  });

  await test.step('Test: created activity that has a comment should have a comment icon on activity list', async () => {
    await created_activity_that_has_a_comment_should_have_a_comment_icon_on_activity_list(page, activityWithComment);
  });

  await test.step('Test: created activity that does not have a comment should not have a comment icon on activity list', async () => {
    await created_activity_that_does_not_have_a_comment_should_not_have_a_comment_icon_on_activity_list(page, activityWithoutComment);
  });

  await test.step('Action: delete activities', async () => {
    await deleteActivity(page, activityWithComment);
    await deleteActivity(page, activityWithoutComment);
  });

});

async function current_day_is_used_as_activity_date_if_no_date_is_selected(page: Page) {
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
}

async function current_day_is_used_as_activity_date_if_current_date_button_is_clicked(page: Page) {
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
}

async function previous_day_is_used_as_activity_date_if_previous_date_button_is_clicked(page: Page) {
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
}

async function activity_type_and_exp_is_filled_in_after_template_icon_is_clicked(page: Page) {
  const typeField = page.getByTestId('activity-type-input');
  const expField = page.getByTestId('activity-exp-input');
  const templateButton = page.getByTestId('template-button').first();

  await templateButton.click();

  await expect(typeField).toHaveValue("odkurzanie");
  await expect(expField).toHaveValue("10");
}

async function create_activity_with_a_comment(page: Page) {
  await createActivity(page, true);
}

async function create_activity_without_a_comment(page: Page) {
  const activityId = (await createActivity(page, false)).id;
  return activityId;
}

async function after_activity_is_created_system_navigates_to_activity_list(page: Page) {
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
}

async function created_activity_appears_on_activity_list(page: Page, activity: any) {
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');
  await scrollTheListToLoadAllElements(page);
  await expect(activityCard).toBeVisible();
};

async function created_activity_has_properties_with_values_set_during_the_creation(page: Page, activity: any) {
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');
  await expect(activityCard.getByTestId('person-property')).toHaveText(activity.personNickName);
  await expect(activityCard.getByTestId('date-property')).toHaveText(activity.date);
  await expect(activityCard.getByTestId('type-property')).toHaveText(activity.type);
  await expect(activityCard.getByTestId('exp-property')).toHaveText(activity.exp + " xp");
};

async function created_activity_that_has_a_comment_should_have_a_comment_icon_on_activity_list(page: Page, activity: any) {
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');
  await scrollTheListToLoadAllElements(page);
  await expect(activityCard.getByTestId('comment-property')).toBeVisible();
};

async function created_activity_that_does_not_have_a_comment_should_not_have_a_comment_icon_on_activity_list(page: Page, activity: any) {
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');
  await scrollTheListToLoadAllElements(page);
  await expect(activityCard.getByTestId('comment-property')).not.toBeVisible();
};

async function goToActivityList(page: Page) {
  await page.goto('/ActivityList/');
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
}

async function goToActivityCreate(page: Page) {
  await page.getByTestId('create-button').first().click();
  await expect(page.getByTestId('activity-edit-page')).toBeVisible();
}

async function deleteActivity(page: Page, activity: any) {
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');
  await scrollTheListToLoadAllElements(page);
  await expect(activityCard).toBeVisible();
  await activityCard.click();

  await expect(page.getByTestId('activity-details-page')).toBeVisible();

  await page.once('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept(); // kliknięcie "OK"
  });

  const deleteButton = page.getByTestId('delete-button');

  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
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
