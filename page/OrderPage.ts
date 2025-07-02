import { Page, Locator, expect } from '@playwright/test';
import BasePage from './BasePage';
import { getMatrixCodes, isValidCoordinate } from './Matrix';
import { getRandomStockCode } from '../tests/utils/testConfig';

class OrderPage extends BasePage {
    // Navigation
    orderButton: Locator;
    orderBookButton: Locator;

    // Matrix 2FA
    matrixGen: Locator;
    matrixInput: Locator;
    confirmButton: Locator;
    change2FA: Locator;
    refreshMatrix: Locator;
    popup2FA: Locator;

    // Order Form
    stockCodeInput: Locator;
    quantityInput: Locator;
    priceSpan: Locator;
    placeOrderButton: Locator;
    confirmOrderButton: Locator;

    // Order Book
    cancelOrderButton: Locator;
    modifyOrderButton: Locator;

    // Messages
    errorMessage: Locator;
    successMessage: Locator;

    constructor(page: Page) {
        super(page);

        // Navigation
        this.orderButton = page.getByText('Đặt lệnh');
        this.orderBookButton = page.getByText('Sổ lệnh');

        // Matrix 2FA
        this.matrixGen = page.locator('p.fw-500');
        this.matrixInput = page.locator('.text-center.text-otp');
        this.confirmButton = page.getByRole('button', { name: 'Xác nhận' });
        this.change2FA = page.locator('.btn.btn--primary2.fw-500');
        this.refreshMatrix = page.locator('.text-refresh.cursor-pointer');
        this.popup2FA = page.locator('.mb-0.text-title');

        // Order Form
        this.stockCodeInput = page.getByPlaceholder('Mã CK', { exact: true });
        this.quantityInput = page.getByPlaceholder('KL x1');
        this.priceSpan = page.locator('span.cursor-pointer.f');
        this.placeOrderButton = page.getByRole('button', { name: 'Đặt lệnh' });
        this.confirmOrderButton = page.getByRole('button', { name: 'Xác nhận' });

        // Order Book
        this.cancelOrderButton = page.locator('td:nth-child(14) > div > span:nth-child(2) > .icon').first();
        this.modifyOrderButton = page.locator('td:nth-child(14) > div > span:nth-child(2) > .icon').nth(1);

        // Messages
        this.errorMessage = page.locator('#root div').filter({
            hasText: 'Đặt lệnh không thành côngError: Hệ thống sẽ nhận lệnh cho ngày giao dịch tiếp'
        }).nth(2);
        this.successMessage = page.locator('.success-message'); // Adjust based on actual success message locator
    }

    /**
     * Navigate to order page and handle matrix if needed
     */
    async navigateToOrder(): Promise<void> {
        await this.orderButton.click();
        await this.handleMatrixIfVisible();
    }

    /**
     * Handle matrix input if the matrix popup is visible
     */
    async handleMatrixIfVisible(): Promise<void> {
        try {
            await this.matrixGen.waitFor({ state: 'visible', timeout: 3000 });
            await this.enterMatrix();
        } catch {
            // Matrix not required, continue
        }
    }

    /**
     * Enter matrix codes for 2FA
     */
    async enterMatrix(): Promise<void> {
        await expect(this.matrixGen).toBeVisible();

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

    /**
     * Place a buy order with specified or random stock code
     */
    async placeBuyOrder(stockCode?: string, quantity: string = '1'): Promise<void> {
        const code = stockCode || getRandomStockCode();

        // Fill stock code
        await this.stockCodeInput.fill(code);

        // Wait for price to load and be clickable
        await expect(this.priceSpan).toHaveCount(1);
        await this.priceSpan.scrollIntoViewIfNeeded();
        await expect(this.priceSpan).toBeVisible();
        await this.priceSpan.dblclick();

        // Fill quantity
        await this.quantityInput.fill(quantity);

        // Place order
        await this.placeOrderButton.click();
        await this.confirmOrderButton.click();
    }

    /**
     * Check if order placement was successful or failed
     */
    async isOrderSuccessful(): Promise<boolean> {
        try {
            await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
            const errorText = await this.errorMessage.textContent();
            console.log('Order failed with message:', errorText);
            return false;
        } catch {
            // No error message found, assume success
            return true;
        }
    }

    /**
     * Navigate to order book
     */
    async navigateToOrderBook(): Promise<void> {
        await this.orderBookButton.click();
    }

    /**
     * Cancel the first order in order book
     */
    async cancelFirstOrder(): Promise<void> {
        await this.navigateToOrderBook();
        await this.cancelOrderButton.click();
        await this.confirmOrderButton.click();
    }

    /**
     * Complete order flow: place order and cancel if successful
     */
    async completeOrderFlow(stockCode?: string, quantity: string = '1'): Promise<{ success: boolean; message?: string }> {
        await this.navigateToOrder();
        await this.placeBuyOrder(stockCode, quantity);

        const isSuccessful = await this.isOrderSuccessful();

        if (isSuccessful) {
            await this.cancelFirstOrder();
            return { success: true, message: 'Order placed and cancelled successfully' };
        } else {
            const errorText = await this.errorMessage.textContent();
            return { success: false, message: errorText || 'Order failed' };
        }
    }

    /**
     * Refresh matrix when needed
     */
    async refreshMatrixCodes(): Promise<void> {
        await this.refreshMatrix.click();
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

    // Legacy method for backward compatibility
    async openOrder(): Promise<void> {
        await this.navigateToOrder();
    }
}

export default OrderPage;