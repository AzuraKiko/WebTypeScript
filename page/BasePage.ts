import { Page, Locator } from '@playwright/test';

class BasePage {
    page: Page;
    pageTitle: Locator;
    pageLoader: Locator;
    errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.pageTitle = page.locator('h1.page-title');
        this.pageLoader = page.locator('.loading-spinner');
        this.errorMessage = page.locator('.error-message');
    }

    async getPageTitle(): Promise<string> {
        return await this.pageTitle.innerText();
    }

    async waitForPageLoad(): Promise<void> {
        // Wait for the loader to disappear
        await this.pageLoader.waitFor({ state: 'hidden', timeout: 10000 });
    }

    async getErrorMessage(): Promise<string | null> {
        if (await this.errorMessage.isVisible()) {
            return await this.errorMessage.innerText();
        }
        return null;
    }
}

export default BasePage; 