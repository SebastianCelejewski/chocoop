import { test, expect, Page } from '@playwright/test';
import { Activity } from './model/Activity'
import { goToActivityList, goToActivityCreate } from './actions/Navigation';

const activityListDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });

test('activity multi-test', async({page}) => {
  await test.step("Navigation: activity creation page", async () => {
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

  var activityWithComment = await Activity.withComment(page);
  var activityWithoutComment = await Activity.withoutComment(page);

  await test.step('Action: creation of two activities', async() => {
    await createActivity(page, activityWithComment);
    await createActivity(page, activityWithoutComment);
  })

  await test.step('Test: after activity is created system navigates to activity list', async() => {
    await after_activity_is_created_system_navigates_to_activity_list(page);
  });

  await test.step('Test: created activity appears on activity list', async () => {
    await created_activity_appears_on_activity_list(page, activityWithComment);
    await created_activity_appears_on_activity_list(page, activityWithoutComment);
  });

  await test.step('Test: created activity has properties with values set during the creation', async () => {
    await checkActivityProperties(page, activityWithComment);
  });

  await test.step('Test: created activity that has a comment should have a comment icon on activity list', async () => {
    await created_activity_that_has_a_comment_should_have_a_comment_icon_on_activity_list(page, activityWithComment);
  });

  await test.step('Test: created activity that does not have a comment should not have a comment icon on activity list', async () => {
    await created_activity_that_does_not_have_a_comment_should_not_have_a_comment_icon_on_activity_list(page, activityWithoutComment);
  });

  var modifiedActivityWithComment = await Activity.withComment(page);

  await test.step('Action: modification of existing activity', async () => {
    await modifyActivity(page, activityWithComment, modifiedActivityWithComment);
  });

  await test.step('Test: modified activity has properties with values set during the modification', async () => {
    await checkActivityProperties(page, activityWithComment);
  });

  await test.step('Action: cancelled attempt to delete an activity', async () => {
    await cancelled_attempt_to_delete_an_activity(page, activityWithComment);
  });

  await test.step("Test: after cancelled deletion activity still exists on activity list", async () => {
    await created_activity_appears_on_activity_list(page, activityWithComment);
    await created_activity_appears_on_activity_list(page, activityWithoutComment);
  });

  await test.step('Action: delete activities', async () => {
    await deleteActivity(page, activityWithComment);
    await deleteActivity(page, activityWithoutComment);
  });

  await test.step("Test: after confirmed deletion activities do not exist on activity list", async () => {
    await deleted_activity_does_not_appear_on_activity_list(page, activityWithComment);
    await deleted_activity_does_not_appear_on_activity_list(page, activityWithoutComment);
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

async function after_activity_is_created_system_navigates_to_activity_list(page: Page) {
  await expect(page.getByTestId('activity-list-page')).toBeVisible();
}

async function created_activity_appears_on_activity_list(page: Page, activity: any) {
  await goToActivityList(page);
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');
  await scrollTheListToLoadAllElements(page);
  await expect(activityCard).toBeVisible();
};

async function deleted_activity_does_not_appear_on_activity_list(page: Page, activity: any) {
  await goToActivityList(page);
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');
  await expect(activityCard).not.toBeVisible();
};

async function checkActivityProperties(page: Page, activity: Activity) {
  await goToActivityList(page);
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');

  await expect(activityCard.getByTestId('person-property')).toHaveText(activity.personNickName);
  await expect(activityCard.getByTestId('date-property')).toHaveText(activityListDateFormat.format(new Date(activity.date)));
  await expect(activityCard.getByTestId('type-property')).toHaveText(activity.type);
  await expect(activityCard.getByTestId('exp-property')).toHaveText(activity.exp + " xp");
};

async function created_activity_that_has_a_comment_should_have_a_comment_icon_on_activity_list(page: Page, activity: any) {
  await goToActivityList(page);
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');
  await scrollTheListToLoadAllElements(page);
  await expect(activityCard.getByTestId('comment-property')).toBeVisible();
};

async function created_activity_that_does_not_have_a_comment_should_not_have_a_comment_icon_on_activity_list(page: Page, activity: any) {
  await goToActivityList(page);
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');
  await scrollTheListToLoadAllElements(page);
  await expect(activityCard.getByTestId('comment-property')).not.toBeVisible();
};

async function cancelled_attempt_to_delete_an_activity(page: Page, activity: any) {
  await goToActivityList(page);
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');
  await scrollTheListToLoadAllElements(page);
  await expect(activityCard).toBeVisible();
  await activityCard.click();

  await expect(page.getByTestId('activity-details-page')).toBeVisible();

  await page.once('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    await dialog.dismiss();
  });

  const deleteButton = page.getByTestId('delete-button');

  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
}

async function createActivity(page: Page, activity: Activity) {
  await goToActivityList(page);
  await goToActivityCreate(page);

  await page.getByTestId('activity-person-input').first().selectOption({label: activity.personNickName});
  await page.getByTestId('activity-date-input').first().fill(activity.date.toString());
  await page.getByTestId('activity-type-input').first().fill(activity.type);
  await page.getByTestId('activity-exp-input').first().fill(activity.exp);
  await page.getByTestId('activity-comment-input').first().fill(activity.comment);

  const responsePromise = page.waitForResponse(resp =>
    resp.url().includes('/graphql') &&
    resp.request().method() === 'POST'
  );

  await page.getByTestId('submit-button').first().click();

  const response = await responsePromise;
  const body = await response.json();
  const activityId = body.data.createActivity.id

  activity.id = activityId;
}

async function modifyActivity(page: Page, activityToModify: Activity, modifiedActivity: Activity) {
  await goToActivityList(page);
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activityToModify.id + '"]');
  await scrollTheListToLoadAllElements(page);
  await expect(activityCard).toBeVisible();
  await activityCard.click();
  await expect(page.getByTestId('activity-details-page')).toBeVisible();
  const editButton = page.getByTestId('edit-button');
  await expect(editButton).toBeVisible();
  await editButton.click();
  await expect(page.getByTestId('activity-edit-page')).toBeVisible();

  await page.getByTestId('activity-person-input').first().selectOption({label: modifiedActivity.personNickName});
  await page.getByTestId('activity-date-input').first().fill(modifiedActivity.date.toString());
  await page.getByTestId('activity-type-input').first().fill(modifiedActivity.type);
  await page.getByTestId('activity-exp-input').first().fill(modifiedActivity.exp);
  await page.getByTestId('activity-comment-input').first().fill(modifiedActivity.comment);

  await page.getByTestId('submit-button').first().click();

  activityToModify.personNickName = modifiedActivity.personNickName;
  activityToModify.date = modifiedActivity.date;
  activityToModify.type = modifiedActivity.type;
  activityToModify.exp = modifiedActivity.exp;
  activityToModify.comment = modifiedActivity.comment;
}

async function deleteActivity(page: Page, activity: Activity) {
  await page.goto('/ActivityList/');
  const activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activity.id + '"]');
  await scrollTheListToLoadAllElements(page);
  await expect(activityCard).toBeVisible();
  await activityCard.click();

  await expect(page.getByTestId('activity-details-page')).toBeVisible();

  await page.once('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept();
  });

  const deleteButton = page.getByTestId('delete-button');

  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
}

async function scrollTheListToLoadAllElements(page: Page) {
  const grid = page.locator('.ReactVirtualized__Grid');

  await grid.evaluate(el => {
    el.scrollTop = el.scrollHeight;
  });
}
