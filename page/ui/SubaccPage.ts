import { Page, Locator } from '@playwright/test';
import { FormUtils } from '../../helpers/uiUtils';

class SelectSubacc {
    page: Page;
    dropdownSubacc: Locator;
    listSubacc: Locator;
    normalSubacc: Locator;
    marginSubacc: Locator;
    futureSubacc: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dropdownSubacc = page.locator('[class*="user-select__control"]');
        this.listSubacc = page.locator('.user-select__menu-list');
        // this.futureSubacc = page.locator('#react-select-2-option-0');
        // this.marginSubacc = page.locator('#react-select-2-option-1');
        // this.normalSubacc = page.locator('#react-select-2-option-2');
        this.normalSubacc = this.listSubacc.locator('.user-select__option').filter({ hasText: 'Thường' });
        this.marginSubacc = this.listSubacc.locator('.user-select__option').filter({ hasText: 'Margin' });
        this.futureSubacc = this.listSubacc.locator('.user-select__option').filter({ hasText: 'Phái sinh' });
    }

    async openDropdownSubacc() {
        await this.dropdownSubacc.click();
        await this.listSubacc.waitFor({ state: 'visible', timeout: 10000 });
        await this.page.waitForTimeout(1000);
    }

    async selectNormalSubacc() {
        await this.openDropdownSubacc();
        await this.normalSubacc.click();
    }

    async selectMarginSubacc() {
        await this.openDropdownSubacc();
        await this.marginSubacc.click();
        const dropText = await this.dropdownSubacc.textContent();
        console.log('dropText', dropText);
        if (!dropText?.includes('Margin')) throw new Error('Margin not selected!');
    }

    async selectFutureSubacc() {
        await this.openDropdownSubacc();
        await this.futureSubacc.click();
    }
}

export default SelectSubacc;