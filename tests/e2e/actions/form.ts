import { test, expect, Page } from '@playwright/test';

export class Form {

    static async setDate(page: Page, date: string) {
        test.step("Action: set date to " + date, async () => {
            const dateField = page.getByTestId('activity-date-input'); 
            await expect(dateField).toBeVisible();
            await dateField.fill(date);
        });
    }

    static async setActivityPerson(page: Page, personNickName: string) {
        await test.step("Action: Setting activity person to " + personNickName, async () => {
            await page.getByTestId('activity-person-input').first().selectOption({label: personNickName});
        });
    }

    static async setActivityDate(page: Page, date: string) {
        await test.step("Action: Setting activity date to " + date, async () => {
            await page.getByTestId('activity-date-input').first().fill(date);
        })
    }   

    static async setActivityType(page: Page, type: string) {
        await test.step("Action: Setting activity type to " + type, async () => {
            await page.getByTestId('activity-type-input').first().fill(type);
        });
    }

    static async setActivityExp(page: Page, exp: string) {
        await test.step("Action: Setting activity exp to " + exp, async () => {
            await page.getByTestId('activity-exp-input').first().fill(exp);
        });
    }

    static async setActivityComment(page: Page, comment: string) {
        await test.step("Action: Setting activity comment to " + comment, async () => {
            await page.getByTestId('activity-comment-input').first().fill(comment);
        });
    }

    static async waitForActivityDateToBeLoaded(page: Page) {
        await expect(page.getByTestId('activity-date-input').first().textContent()).not.toBeUndefined();
    }

    static async waitForActivityTypeToBeLoaded(page: Page) {
        await expect(page.getByTestId('activity-type-input').first().textContent()).not.toBeUndefined();
    }

    static async waitForActivityExpToBeLoaded(page: Page) {
        await expect(page.getByTestId('activity-exp-input').first().textContent()).not.toBeUndefined();
    }

}