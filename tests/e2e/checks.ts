import { test, expect, Page, Locator } from '@playwright/test';
import { Activity } from './model/Activity';

const activityListDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });

export class CheckIf {
    static async navigatedToActivityListPage(page: Page) {
        await test.step("Check: navigated to activity list page", async() => {
            await expect(page.getByTestId('activity-list-page')).toBeVisible();
        })
    }

    static async navigatedToActivityDetailsPage(page: Page) {
        await test.step("Check: navigated to activity details page", async() => {
            await expect(page.getByTestId('activity-details-page')).toBeVisible();
        })
    }

    static async navigatedToActivityEditPage(page: Page) {
        await test.step("Check: navigated to activity edit page", async() => {
            await expect(page.getByTestId('activity-edit-page')).toBeVisible();
        })
    }

    static async currentDayIsUsedAsActivityDate(page: Page) {
        await test.step("Test: current day is used as activity date if no date is selected", async () => {
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
        });
    }

    static async previousDayIsUsedAsActivityDate(page: Page) {
        await test.step('Test: previous day is used as activity date if previous date button is clicked', async () => {
            const yesterdayButton = page.getByTestId('yesterday-button');
            const dateField = page.getByTestId('activity-date-input');

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
        });
    };

    static async typeAndExpFieldsAreFilledInForVacuuming(page: Page) {
        await test.step("Test: type and exp fields are filled in for vacuuming", async () => {
            const typeField = page.getByTestId('activity-type-input');
            const expField = page.getByTestId('activity-exp-input');
  
            await expect(typeField).toHaveValue("odkurzanie");
            await expect(expField).toHaveValue("10");
        })
    }

    static async activityAppearsOnActivityList(page: Page, activityId: string | undefined) : Promise<Locator> {
        let activityCard: Locator;
        await test.step("Check: activity appears on activity list", async () => {
            activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activityId + '"]');
            await this.scrollTheListToLoadAllElements(page);
            await expect(activityCard).toBeVisible();
        });
        return activityCard!;
    };

    static async activityDoesNotAppearOnActivityList(page: Page, activityId: string | undefined) : Promise<Locator> {
        let activityCard: Locator;
        await test.step("Check: activity appears on activity list", async () => {
            activityCard = page.locator('[data-testid="activity-card"][data-objectid="' + activityId + '"]');
            await this.scrollTheListToLoadAllElements(page);
            await expect(activityCard).not.toBeVisible();
        });
        return activityCard!;
    };

    static async activityHasCorrectProperties(page: Page, activityCard: Locator, activity: Activity) {
        await test.step("Check: activity has correct person", async () => {
            await expect(activityCard.getByTestId('person-property')).toHaveText(activity.personNickName);
        });

        await test.step("Check: activity has correct date", async () => {
            await expect(activityCard.getByTestId('date-property')).toHaveText(activityListDateFormat.format(new Date(activity.date)));
        });

        await test.step("Check: activity has correct type", async () => {
            await expect(activityCard.getByTestId('type-property')).toHaveText(activity.type);
        });

        await test.step("Check: activity has correct exp", async () => {
            await expect(activityCard.getByTestId('exp-property')).toHaveText(activity.exp + " xp");
        });
    };

    static async ActivityHasACommentIcon(page: Page, activityCard: Locator) {
        await test.step("Check: activity has a comment icon", async () => {
            await expect(activityCard.getByTestId('comment-property')).toBeVisible();
        });
    };

    static async ActivityDoesNotHaveACommentIcon(page: Page, activityCard: Locator) {
        await test.step("Check: activity has a comment icon", async () => {
            await expect(activityCard.getByTestId('comment-property')).not.toBeVisible();
        });
    };

    static async confirmDialogIsDisplayed(page: Page) {
        await test.step("Check: confirm dialog was displayed", async() => {
            await expect(page.getByTestId('confirm-dialog')).toBeVisible();
        })
    }    

    static async confirmDialogIsNotDisplayed(page: Page) {
        await test.step("Check: confirm dialog was displayed", async() => {
            await expect(page.getByTestId('confirm-dialog')).not.toBeVisible();
        })
    }    

    static async scrollTheListToLoadAllElements(page: Page) {
        const grid = page.locator('.ReactVirtualized__Grid');

        await grid.evaluate(el => {
            el.scrollTop = el.scrollHeight;
        });
    }
}

