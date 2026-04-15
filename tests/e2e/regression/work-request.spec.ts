import { test, expect, Locator, Page } from "@playwright/test";

import { NavigateTo } from "../actions/navigate";
import { Click } from "../actions/click";
import { Form } from "../actions/form";
import { CheckIf } from "../checks";

type WorkRequestData = {
  id?: string;
  createdByNickname: string;
  type: string;
  exp: string;
  urgencyLabel: string;
  instructions: string;
};

const urgencyLabels = [
  "Nieokreślona",
  "Jak najszybciej",
  "W ciągu paru godzin",
  "W ciągu paru dni",
  "W ciągu paru tygodni",
  "W ciągu paru miesięcy",
  "Bez konkretnego terminu"
];

test("Work request creation, modification and deletion test", async ({ page }) => {
  await test.step("Going to activity creation page", async () => {
    await NavigateTo.workRequestListPage(page);
    await CheckIf.navigatedToWorkRequestListPage(page);
    await Click.createButton(page);
    await CheckIf.navigatedToWorkRequestEditPage(page);
  });

  const createdWorkRequest = await createWorkRequest(page);

  await test.step("Created work request appears on the work request list", async () => {
    await expect(page.getByTestId("work-request-list-page")).toBeVisible();
    const workRequestCard = await workRequestAppearsOnList(page, createdWorkRequest.id);
    await expect(workRequestCard.getByTestId("person-property")).toHaveText(createdWorkRequest.createdByNickname);
    await expect(workRequestCard.getByTestId("type-property")).toHaveText(createdWorkRequest.type);
    await expect(workRequestCard.getByTestId("exp-property")).toHaveText(`${createdWorkRequest.exp} xp`);
    await expect(workRequestCard.getByTestId("urgency-property")).toContainText(createdWorkRequest.urgencyLabel);
  });

  const updatedWorkRequest = createWorkRequestData(createdWorkRequest.createdByNickname);

  await test.step("Work request can be edited from details page", async () => {
    await openWorkRequestDetails(page, createdWorkRequest.id);

    await expect(page.getByTestId("work-request-type")).toHaveText(createdWorkRequest.type);
    await expect(page.getByTestId("work-request-instructions")).toHaveText(createdWorkRequest.instructions);

    await page.getByTestId("edit-button").click();
    await expect(page.getByTestId("work-request-edit-page")).toBeVisible();

    await page.getByTestId("work-request-type-input").fill(updatedWorkRequest.type);
    await page.getByTestId("work-request-exp-input").fill(updatedWorkRequest.exp);
    await page.getByTestId("work-request-urgency-input").selectOption({ label: updatedWorkRequest.urgencyLabel });
    await page.getByTestId("work-request-instructions-input").fill(updatedWorkRequest.instructions);
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("work-request-details-page")).toBeVisible();
    await expect(page.getByTestId("work-request-type")).toHaveText(updatedWorkRequest.type);
    await expect(page.getByTestId("work-request-exp")).toHaveText(updatedWorkRequest.exp);
    await expect(page.getByTestId("work-request-urgency")).toHaveText(updatedWorkRequest.urgencyLabel);
    await expect(page.getByTestId("work-request-instructions")).toHaveText(updatedWorkRequest.instructions);
  });

  await test.step("Work request can be deleted from details page", async () => {
    await page.getByTestId("delete-button").click();
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await page.getByTestId("confirm-button").click();
    await expect(page.getByTestId("confirm-dialog")).not.toBeVisible();
    await expect(page.getByTestId("work-request-list-page")).toBeVisible();

    const deletedCard = page.locator(`[data-testid="work-request-card"][data-objectid="${createdWorkRequest.id}"]`);
    await scrollTheListToLoadAllElements(page);
    await expect(deletedCard).not.toBeVisible();
  });
});

test("Work request promotion test", async ({ page }) => {
  const workRequest = await createWorkRequest(page);

  await test.step("Promotion opens activity edit page prefilled from work request", async () => {
    await openWorkRequestDetails(page, workRequest.id);

    await expect(page.getByTestId("work-request-pending-message")).toBeVisible();
    await page.getByTestId("done-button").click();

    await expect(page.getByTestId("activity-edit-page")).toBeVisible();
    await expect(page.getByTestId("activity-edit-page")).toHaveAttribute("data-mode", "promoteWorkRequest");
    await expect(page.getByTestId("activity-type-input")).toHaveValue(workRequest.type);
    await expect(page.getByTestId("activity-exp-input")).toHaveValue(workRequest.exp);
  });

  await test.step("Submitting promoted activity completes the work request", async () => {
    const createActivityResponsePromise = page.waitForResponse((response) => {
      return response.url().includes("/graphql")
        && response.request().method() === "POST"
        && (response.request().postData() ?? "").includes("createActivity");
    });

    await page.getByTestId("submit-button").click();

    const createActivityResponse = await createActivityResponsePromise;
    const responseBody = await createActivityResponse.json();
    const createdActivityId = responseBody.data.createActivity.id;

    await expect(page.getByTestId("activity-list-page")).toBeVisible();

    const createdActivityCard = await activityAppearsOnList(page, createdActivityId);
    await expect(createdActivityCard.getByTestId("type-property")).toHaveText(workRequest.type);
    await expect(createdActivityCard.getByTestId("exp-property")).toHaveText(`${workRequest.exp} xp`);

    await openWorkRequestDetails(page, workRequest.id, true);
    await expect(page.getByTestId("work-request-completed-message")).toBeVisible();
    await expect(page.getByTestId("done-button")).toBeDisabled();

    await page.getByRole("link", { name: "Przejdź do czynności" }).click();
    await expect(page.getByTestId("activity-details-page")).toBeVisible();
    await expect(page.getByText("Na podstawie zlecenia.")).toBeVisible();
  });
});

async function goToWorkRequestList(page: Page) {
  await page.goto("/WorkRequestList/");
  await expect(page.getByTestId("work-request-list-page")).toBeVisible();
}

async function createWorkRequest(page: Page): Promise<WorkRequestData> {
  await goToWorkRequestList(page);
  await page.getByTestId("create-button").click();
  await expect(page.getByTestId("work-request-edit-page")).toBeVisible();

  const createdByNickname = await page.getByTestId("user-nickname").textContent();
  if (!createdByNickname) {
    throw new Error("Cannot fetch current user nickname");
  }

  const workRequest = createWorkRequestData(createdByNickname);

  await page.getByTestId("work-request-type-input").fill(workRequest.type);
  await page.getByTestId("work-request-exp-input").fill(workRequest.exp);
  await page.getByTestId("work-request-urgency-input").selectOption({ label: workRequest.urgencyLabel });
  await page.getByTestId("work-request-instructions-input").fill(workRequest.instructions);

  const responsePromise = page.waitForResponse((response) => {
    return response.url().includes("/graphql")
      && response.request().method() === "POST"
      && (response.request().postData() ?? "").includes("createWorkRequest");
  });

  await page.getByTestId("submit-button").click();

  const response = await responsePromise;
  const body = await response.json();
  workRequest.id = body.data.createWorkRequest.id;
  return workRequest;
}

async function workRequestAppearsOnList(page: Page, workRequestId?: string, showCompleted = false): Promise<Locator> {
  if (showCompleted) {
    const showCompletedCheckbox = page.getByTestId("show-completed-checkbox");
    await expect(showCompletedCheckbox).toBeVisible();
    if (!(await showCompletedCheckbox.isChecked())) {
      await showCompletedCheckbox.check();
    }
  }

  const card = page.locator(`[data-testid="work-request-card"][data-objectid="${workRequestId}"]`);
  await scrollTheListToLoadAllElements(page);
  await expect(card).toBeVisible();
  return card;
}

async function openWorkRequestDetails(page: Page, workRequestId?: string, showCompleted = false) {
  await goToWorkRequestList(page);
  const card = await workRequestAppearsOnList(page, workRequestId, showCompleted);
  await card.click();
  await expect(page.getByTestId("work-request-details-page")).toBeVisible();
}

async function activityAppearsOnList(page: Page, activityId: string): Promise<Locator> {
  const card = page.locator(`[data-testid="activity-card"][data-objectid="${activityId}"]`);
  await scrollTheListToLoadAllElements(page);
  await expect(card).toBeVisible();
  return card;
}

function createWorkRequestData(createdByNickname: string): WorkRequestData {
  const id = crypto.randomUUID().split("-").at(-1);
  if (!id) {
    throw new Error("Failed to generate test id");
  }

  const urgencyLabel = urgencyLabels[(Math.floor(Math.random() * (urgencyLabels.length - 1)) + 1)];

  return {
    createdByNickname,
    type: `Work request ${id}`,
    exp: `${Math.floor(Math.random() * 50) + 10}`,
    urgencyLabel,
    instructions: `Instructions ${id}`
  };
}

async function scrollTheListToLoadAllElements(page: Page) {
  const grid = page.locator(".ReactVirtualized__Grid");

  await grid.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
}
