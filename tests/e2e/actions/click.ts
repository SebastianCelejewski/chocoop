import { test, Page, Locator } from '@playwright/test';

export class Click {
    static async activityCard(page: Page, activityCard: Locator) {
        await test.step("Action: click activity card", async () => {
            await activityCard.click();
        });
    }

    static async createButton(page: Page) {
        test.step("Action: click create button", async () => {
            await page.getByTestId('create-button').first().click();
        });
    }

    static async editButton(page: Page) {
        test.step("Action: click edit button", async () => {
            await page.getByTestId('edit-button').first().click();
        });
    }

    static async deleteButton(page: Page) {
        test.step("Action: click delete button", async () => {
            await page.getByTestId('delete-button').first().click();
        });
    }

    static async cancelButton(page: Page) {
        test.step("Action: click cancel button", async () => {
            await page.getByTestId('cancel-button').first().click();
        });
    }

    static async confirmButton(page: Page) {
        test.step("Action: click confirm button", async () => {
            await page.getByTestId('confirm-button').first().click();
        });
    }

    static async backButton(page: Page) {
        test.step("Action: click back button", async () => {
            await page.getByTestId('back-button').first().click();
        });
    }

    static async submitButton(page: Page) {
        test.step("Action: click submit button", async () => {
            await page.getByTestId('submit-button').first().click();
        });
    }

    static async todayButton(page: Page) {
        test.step("Action: click today button", async () => {
            await page.getByTestId('today-button').first().click();
        });
    }

    static async yesterdayButton(page: Page) {
        test.step("Action: click yesterday button", async () => {
            await page.getByTestId('yesterday-button').first().click();
        });
    }

    static async firstTemplateButton(page: Page) {
        test.step("Action: click first template button", async () => {
            await page.getByTestId('template-button').first().click();
        });
    }
}