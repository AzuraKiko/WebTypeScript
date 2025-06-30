import { Page, Locator } from '@playwright/test';
import BasePage from './BasePage';
import LoginPage from './LoginPage';
import { getMatrixCodes, isValidCoordinate } from './Matrix';

class OrderPage extends BasePage {
    orderButton: Locator;
    loginPage: LoginPage;
    matrixGen: Locator;
    matrixInput: Locator;
    confirmButton: Locator;
    change2FA: Locator;
    constructor(page: Page) {
        super(page);
        this.loginPage = new LoginPage(page);


        this.orderButton = page.getByText('Đặt lệnh');
        this.matrixGen = page.locator('p.fw-500');
        this.matrixInput = page.locator('.text-center.text-otp]');
        this.confirmButton = page.getByRole('button', { name: 'Xác nhận' });
        this.change2FA = page.locator('.btn.btn--primary2.fw-500');
    }

    async openOrder() {
        await this.loginPage.loginSuccess();
        await this.page.waitForTimeout(5000);

        await this.orderButton.click();
        if (await this.matrixGen.isVisible()) {
            await this.enterMatrix();
        }
    }
    async enterMatrix() {
        await this.matrixGen.isVisible();
        const coords = await this.matrixGen.allTextContents();
        const validCoords = coords.filter(coord => isValidCoordinate(coord.trim()));
        if (validCoords.length < 3) {
            throw new Error(`Expected 3 valid coordinates, but got ${validCoords.length}. Coordinates: ${coords.join(', ')}`);
        }
        const matrixValues = getMatrixCodes(validCoords.slice(0, 3));
        matrixValues.forEach(async (value, index) => {
            await this.matrixInput.nth(index).fill(value);
        });
        await this.confirmButton.click();
    }
}

export default OrderPage;