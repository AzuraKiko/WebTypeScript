import { Page, Locator } from '@playwright/test';

class SelectSubacc {
    page: Page;
    dropdownSubacc: Locator;
    normalSubacc: Locator;
    marginSubacc: Locator;
    futureSubacc: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dropdownSubacc = page.locator('[class*="user-select__control"]');
        this.futureSubacc = page.locator('#react-select-2-option-0');
        this.marginSubacc = page.locator('#react-select-2-option-1');
        this.normalSubacc = page.locator('#react-select-2-option-2');
    }

    async openDropdownSubacc() {
        await this.dropdownSubacc.click();
    }

    async selectNormalSubacc() {
        await this.openDropdownSubacc();
        await this.normalSubacc.click();
    }

    async selectMarginSubacc() {
        await this.openDropdownSubacc();
        await this.marginSubacc.click();
    }

    async selectFutureSubacc() {
        await this.openDropdownSubacc();
        await this.futureSubacc.click();
    }
}

export default SelectSubacc;