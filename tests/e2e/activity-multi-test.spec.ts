import { test, expect, Page, Locator } from '@playwright/test';
import { Activity } from './model/Activity'
import { NavigateTo } from './actions/navigate';
import { Click } from './actions/click';
import { Form } from './actions/form';
import { CheckIf } from './checks';
import { Intercept, Intercepted, WaitFor } from "./utils/intercept";
import { Browser } from './utils/browser';

test('activity multi-test', async({page}) => {

  await test.step("Going to activity creation page", async () => {
    await NavigateTo.activityListPage(page);
    await CheckIf.navigatedToActivityListPage(page);
    await Click.createButton(page);
    await CheckIf.navigatedToActivityEditPage(page);
  });

  await test.step("Tests for date and template buttons", async () => {
    await CheckIf.currentDayIsUsedAsActivityDate(page);
    await Form.setDate(page, "1999-12-12");
    await Click.todayButton(page);
    await CheckIf.currentDayIsUsedAsActivityDate(page);
    await Click.yesterdayButton(page);
    await CheckIf.previousDayIsUsedAsActivityDate(page);
    await Click.firstTemplateButton(page);
    await CheckIf.typeAndExpFieldsAreFilledInForVacuuming(page);
  });

  // Tests for activity creation
  const activityWithComment = await Activity.withComment(page);
  const activityWithoutComment = await Activity.withoutComment(page);

  await test.step('Creation of two activities for further tests', async() => {
    await createActivity(page, activityWithComment);
    await createActivity(page, activityWithoutComment);
  });

  let activityWithCommentLocator : Locator;
  let activityWithoutCommentLocator : Locator;

  await test.step('Checking if created activities show correctly on activities list', async () => {
    await CheckIf.navigatedToActivityListPage(page);
    activityWithCommentLocator = await CheckIf.activityAppearsOnActivityList(page, activityWithComment.id);
    activityWithoutCommentLocator = await CheckIf.activityAppearsOnActivityList(page, activityWithoutComment.id);

    await CheckIf.activityHasCorrectProperties(page, activityWithCommentLocator, activityWithComment);
    await CheckIf.activityHasCorrectProperties(page, activityWithoutCommentLocator, activityWithoutComment);

    await CheckIf.ActivityHasACommentIcon(page, activityWithCommentLocator);
    await CheckIf.ActivityDoesNotHaveACommentIcon(page, activityWithoutCommentLocator);
  });

  // Tests for activity modification
  var modifiedActivityWithComment = await Activity.withComment(page);

  await test.step('Modification of an existing activity', async () => {
    await modifyActivity(page, activityWithCommentLocator, modifiedActivityWithComment);
  });

  await test.step("Checking if modified activity shows correctly on activities list", async () => {
    await CheckIf.navigatedToActivityDetailsPage(page);
    await NavigateTo.activityListPage(page);
    activityWithCommentLocator = await CheckIf.activityAppearsOnActivityList(page, activityWithComment.id);
    await CheckIf.activityHasCorrectProperties(page, activityWithCommentLocator, modifiedActivityWithComment);
  })

  // Tests for activity deletion
  await test.step('Cancelled deletion of an activity', async () => {
    await attemptActivityDeletionAndCancel(page, activityWithComment.id);
  });

  await test.step("Checking if activities still show on activities list", async () => {
      await CheckIf.activityAppearsOnActivityList(page, activityWithComment.id);
      await CheckIf.activityAppearsOnActivityList(page, activityWithoutComment.id);
  });

  await test.step('Tests for deletion of activities', async () => {
    await deleteActivity(page, activityWithComment);
    await deleteActivity(page, activityWithoutComment);
  });

  await test.step("Test: after confirmed deletion activities do not exist on activity list", async () => {
    await CheckIf.activityDoesNotAppearOnActivityList(page, activityWithComment.id);
    await CheckIf.activityDoesNotAppearOnActivityList(page, activityWithoutComment.id);
  });

});

async function createActivity(page: Page, activity: Activity) {
  await NavigateTo.activityListPage(page);
  await Click.createButton(page);

  await Form.setActivityPerson(page, activity.personNickName);
  await Form.setActivityDate(page, activity.date);
  await Form.setActivityType(page, activity.type);
  await Form.setActivityExp(page, activity.exp);
  await Form.setActivityComment(page, activity.comment);

  const response = Intercept.httpResponse(page);
  await Click.submitButton(page);
  activity.id = await Intercepted.createdActivityId(response);;
}

async function modifyActivity(page: Page, activityToModify: Locator, modifiedActivity: Activity) {
  await Click.activityCard(page, activityToModify);
  await CheckIf.navigatedToActivityDetailsPage(page);
  await Click.editButton(page);
  await CheckIf.navigatedToActivityEditPage(page);

  console.log(await page.getByTestId('activity-person-input').first().textContent());
  console.log(await page.getByTestId('activity-date-input').first().textContent());
  console.log(await page.getByTestId('activity-type-input').first().textContent());
  console.log(await page.getByTestId('activity-exp-input').first().textContent());

  await Form.waitForActivityDateToBeLoaded(page);
  await Form.waitForActivityTypeToBeLoaded(page);
  await Form.waitForActivityExpToBeLoaded(page);

  await Form.setActivityPerson(page, modifiedActivity.personNickName);
  await Form.setActivityDate(page, modifiedActivity.date);
  await Form.setActivityType(page, modifiedActivity.type);
  await Form.setActivityExp(page, modifiedActivity.exp);
  await Form.setActivityComment(page, modifiedActivity.comment);

  const response = Intercept.httpResponse(page);
  await Click.submitButton(page);
  await WaitFor.httpResponse(response);
}

async function deleteActivity(page: Page, activity: Activity) {
  await NavigateTo.activityListPage(page);
  await CheckIf.navigatedToActivityListPage(page);
  const activityToRemoveCard = await CheckIf.activityAppearsOnActivityList(page, activity.id);
  await Click.activityCard(page, activityToRemoveCard);
  await CheckIf.navigatedToActivityDetailsPage(page);

  await Browser.configureConfirmDialogToClickAccept(page);
  const response = Intercept.httpResponse(page);
  await Click.deleteButton(page);
  await WaitFor.httpResponse(response);
}

async function attemptActivityDeletionAndCancel(page: Page, activityId: string | undefined ) {
  await NavigateTo.activityListPage(page);
  await CheckIf.navigatedToActivityListPage(page);
  const activityCard = await CheckIf.activityAppearsOnActivityList(page, activityId);
  await Click.activityCard(page, activityCard);
  await CheckIf.navigatedToActivityDetailsPage(page);

  await Browser.configureConfirmDialogToClickDismiss(page);
  await Click.deleteButton(page);
}