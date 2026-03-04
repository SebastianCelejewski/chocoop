import { Page } from '@playwright/test';

class Activity {
  testId: string
  id?: string
  personNickName: string
  date: string
  type: string
  exp: string
  comment: string

  constructor(testId: string, personNickName: string, date: string, type: string, exp: string, comment: string) {
    this.testId = testId;
    this.personNickName = personNickName;
    this.date = date;
    this.type = type;
    this.exp = exp;
    this.comment = comment;
  }

  static async withoutComment(page: Page): Promise<Activity> {
    const activityTestId = generateTestId();
    const activityType = generateTestType(activityTestId);
    const activityExp = generateTestExp();
    const activityDate = generateTestDate();
    const activityPerson = await page.getByTestId('user-nickname').textContent();
    if (!activityPerson) {
      throw new Error("Cannot fetch user nick name");
    }

    return new Activity(activityTestId, activityPerson, activityDate, activityType, activityExp, "");
  }

  static async withComment(page: Page): Promise<Activity> {
    const activity = await Activity.withoutComment(page);
    activity.comment = generateTestComment(activity.testId);
    return activity;
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

export { Activity };