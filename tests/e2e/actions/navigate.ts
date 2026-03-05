import { test, Page } from '@playwright/test';

export class NavigateTo {
    static async activityListPage(page: Page) {
        test.step("Action: navigate to activity list page", async () => {
            await page.goto('/ActivityList/');
        });
    }
}
