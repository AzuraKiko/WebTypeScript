import { Page, Locator, expect } from '@playwright/test';
import BasePage from './BasePage';
import { getMatrixCodes, isValidCoordinate } from '../api/Matrix';

class MatrixPage extends BasePage {
    // Matrix 2FA
    matrixGen: Locator;
    matrixInput: Locator;
    confirmButton: Locator;
    change2FA: Locator;
    refreshMatrix: Locator;
    popup2FA: Locator;

    // Messages
    errorMessage: Locator;
    constructor(page: Page) {
        super(page);

        // Matrix 2FA
        this.matrixGen = page.locator('p.fw-500');
        this.matrixInput = page.locator('.text-center.text-otp');
        this.confirmButton = page.getByRole('button', { name: 'Xác nhận' });
        this.change2FA = page.locator('.btn.btn--primary2.fw-500');
        this.refreshMatrix = page.locator('.text-refresh.cursor-pointer');
        this.popup2FA = page.locator('.mb-0.text-title');

        // Messages
        this.errorMessage = page.locator('.d.mx-auto.text-error');
    }
    /**
     * Enter matrix codes for 2FA
     */
    async enterMatrixValid(): Promise<void> {
        await this.matrixGen.waitFor({ state: 'visible', timeout: 3000 });

        const coords: string[] = await this.matrixGen.allTextContents();
        const validCoords: string[] = coords.filter((coord: string) => isValidCoordinate(coord.trim()));

        if (validCoords.length < 3) {
            throw new Error(`Expected 3 valid coordinates, but got ${validCoords.length}. Coordinates: ${coords.join(', ')}`);
        }

        const matrixValues: string[] = getMatrixCodes(validCoords.slice(0, 3));

        // Use for...of loop instead of forEach for proper async handling
        for (let index = 0; index < matrixValues.length; index++) {
            await this.matrixInput.nth(index).fill(matrixValues[index]);
        }

        await this.confirmButton.click();
    }

    async enterMatrixInvalid(): Promise<void> {
        await this.matrixGen.waitFor({ state: 'visible', timeout: 3000 });

        for (let index = 0; index < 3; index++) {
            await this.matrixInput.nth(index).fill('123');
        }

        await this.confirmButton.click();
        const errorMessage = await this.errorMessage.textContent();
        expect(errorMessage).toBe('Error: Bạn đã nhập sai mã OTP.');
    }

    /**
     * Refresh matrix when needed
     */
    async refreshMatrixCodes(): Promise<void> {
        await this.refreshMatrix.click();

        // Wait for element to be disabled first
        await expect(this.matrixGen).toBeDisabled({ timeout: 5000 });

        // Wait for element to be enabled again after ~10 seconds
        await expect(this.matrixGen).toBeEnabled({ timeout: 15000 });
    }

    /**
     * Verify 2FA method change popup
     */
    async verifyChange2FAPopup(): Promise<boolean> {
        await this.change2FA.click();
        await expect(this.popup2FA).toBeVisible();
        const text = await this.popup2FA.textContent();
        return text?.trim() === "Chọn Phương Thức Xác Thực";
    }

}

export default MatrixPage;