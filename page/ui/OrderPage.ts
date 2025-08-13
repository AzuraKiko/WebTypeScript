import { Page, Locator, expect } from '@playwright/test';
import BasePage from './BasePage';
import { getRandomStockCode } from '../../tests/utils/testConfig';
import MatrixPage from './MatrixPage';

class OrderPage extends BasePage {
    matrixPage: MatrixPage;
    // Navigation
    orderButton: Locator;

    // Order Form
    stockCodeInput: Locator;
    quantityInput: Locator;
    priceInput: Locator;
    priceSpan: Locator;
    placeOrderButton: Locator;
    confirmOrderButton: Locator;

    // Order Book
    orderIndayTab: Locator;
    orderHistoryTab: Locator;
    cancelOrderButton: Locator;
    modifyOrderButton: Locator;

    // Messages
    errorMessage: Locator;
    successMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.matrixPage = new MatrixPage(page);

        // Navigation
        this.orderButton = page.locator('.footer-btn:has(.iOrder)');

        // Order Form
        this.stockCodeInput = page.getByPlaceholder('Mã CK', { exact: true });
        this.priceInput = page.getByPlaceholder('Giá x1000');
        this.quantityInput = page.getByPlaceholder('KL x1');
        this.priceSpan = page.locator('span.cursor-pointer.f');
        this.placeOrderButton = page.getByRole('button', { name: 'Đặt lệnh' });
        this.confirmOrderButton = page.getByRole('button', { name: 'Xác nhận' });

        // Order Book
        this.orderIndayTab = page.locator('.asset-panel .card-panel-header__title:nth-child(1)');
        this.orderHistoryTab = page.locator('.asset-panel .card-panel-header__title:nth-child(2)');
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
        // Some pages show a modal overlay (e.g., 2FA or banners) that may intercept clicks.
        // Retry clicking the order button after handling 2FA when present.
        try {
            await this.orderButton.click();
        } catch {
            // If intercepted, attempt to resolve potential 2FA first, then retry
            try {
                await this.matrixPage.enterMatrixValid();
            } catch {
                // ignore if 2FA not present
            }
            await this.orderButton.click();
        }
        // If 2FA appears after clicking, handle it
        try {
            await this.matrixPage.enterMatrixValid();
        } catch {
            // ignore if 2FA not present
        }
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
     * Cancel the first order in order book
     */
    async cancelFirstOrder(): Promise<void> {
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

    // Legacy method for backward compatibility
    async openOrder(): Promise<void> {
        await this.navigateToOrder();
    }
}

export default OrderPage;