import { Page, Response } from '@playwright/test';

export class Intercept {
    static async httpResponse(page: Page): Promise<Response> {
        return page.waitForResponse(resp =>
            resp.url().includes('/graphql')
        );
    }
}

export class Intercepted {
    static async createdActivityId(responsePromise : Promise<Response>): Promise<string> {
        const response = await responsePromise;
        const body = await response.json();
        return body.data.createActivity.id
    }
}

export class WaitFor {
    static async httpResponse(responsePromise: Promise<Response>) {
        await responsePromise;
    }
}