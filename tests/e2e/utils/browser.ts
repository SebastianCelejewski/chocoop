import { test, expect, Page } from '@playwright/test';

export class Browser {
    static async configureConfirmDialogToClickAccept(page: Page) {
        await test.step("Browser: configuring Confirm dialog to click Accept", async () => {
            await page.once('dialog', async dialog => {
                expect(dialog.type()).toBe('confirm');
                await dialog.accept();
            });
        });
    }

    static async configureConfirmDialogToClickDismiss(page: Page) {
        await test.step("Browser: configuring Confirm dialog to click Dismiss", async () => {
            await page.once('dialog', async dialog => {
                expect(dialog.type()).toBe('confirm');
                await dialog.dismiss();
            });
        });
    }

    static async waitForHttpResponse(page: Page) {
        await test.step("Browser: waiting for HTTP response", async () => {
            console.log("Waiting for response " + new Date().toString());
            // await page.waitForResponse(r =>
            //     r.url().includes('updateActivity') && r.status() === 200
            // );
            const response = await page.waitForResponse(r =>
                r.url().includes('/graphql')
            );
            console.log("Response arrived " + new Date().toString() + " " + response);
        });
    }
}