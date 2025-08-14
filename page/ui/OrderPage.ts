import { Page, Locator, expect } from '@playwright/test';
import BasePage from './BasePage';
import { getRandomStockCode } from '../../tests/utils/testConfig';
import MatrixPage from './MatrixPage';
import OrderBook from './OrderBook';

class OrderPage extends BasePage {
    matrixPage: MatrixPage;
    orderBook: OrderBook;
    // Navigation
    orderButton: Locator;

    // Order Form
    stockCodeInput: Locator;
    quantityInput: Locator;
    priceInput: Locator;
    priceCeil: Locator;
    priceFloor: Locator;
    priceReference: Locator;
    placeOrderButton: Locator;
    confirmOrderButton: Locator;

    // Order Book
    orderIndayTab: Locator;
    cancelOrderButton: Locator;
    modifyOrderButton: Locator;

    // Portfolio
    portfolioTab: Locator;
    portfolioStockCode: Locator;

    // Messages
    titleMessage: Locator;
    descriptionMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.matrixPage = new MatrixPage(page);
        this.orderBook = new OrderBook(page);

        // Navigation
        this.orderButton = page.locator('.footer-btn:has(.iOrder)');

        // Order Form
        this.stockCodeInput = page.getByPlaceholder('Mã CK', { exact: true });
        this.priceInput = page.getByPlaceholder('Giá x1000');
        this.quantityInput = page.getByPlaceholder('KL x1');
        this.priceCeil = page.locator('span.cursor-pointer.c').first();
        this.priceFloor = page.locator('span.cursor-pointer.f').first();
        this.priceReference = page.locator('span.cursor-pointer.r').first();
        this.placeOrderButton = page.getByRole('button', { name: 'Đặt lệnh' });
        this.confirmOrderButton = page.getByRole('button', { name: 'Xác nhận' });

        // Order Book
        this.orderIndayTab = page.locator('.asset-panel .card-panel-header__title:nth-child(1)');
        this.cancelOrderButton = page.locator('td:nth-child(14) > div > span:nth-child(2) > .icon').first();
        this.modifyOrderButton = page.locator('td:nth-child(14) > div > span:nth-child(2) > .icon').nth(1);

        // Portfolio
        this.portfolioTab = page.locator('.asset-panel .card-panel-header__title:nth-child(2)');
        this.portfolioStockCode = page.locator('.table.table-bordered .cursor-pointer').first();

        // Messages
        this.titleMessage = page.locator('.toast-content .toast-title');
        this.descriptionMessage = page.locator('.toast-content .toast-description');
    }

    /**
     * Navigate to order page and handle matrix if needed
     */
    async navigateToOrder(): Promise<void> {
        await this.orderButton.click();
        await this.page.waitForTimeout(3000);

        if (await this.matrixPage.isMatrixVisible()) {
            await this.matrixPage.enterMatrixValid();
        }
        await this.page.waitForTimeout(5000);
    }

    /**
     * Place a buy order 
     */
    async placeBuyOrder(stockCode?: string, quantity: string = '1'): Promise<void> {
        const code = stockCode || getRandomStockCode();

        // Fill stock code
        await this.stockCodeInput.fill(code);

        // Wait for price to load and be clickable
        await expect(this.priceFloor).toHaveCount(1);
        // await this.priceFloor.scrollIntoViewIfNeeded();
        await expect(this.priceFloor).toBeVisible();
        await this.priceFloor.dblclick();

        // Fill quantity
        await this.quantityInput.fill(quantity);

        // Place order
        await this.placeOrderButton.click();
        await this.confirmOrderButton.click();
    }

    /**
     * Check if message is visible
     */
    async verifyMessage(expectedTitle: string, expectedDescription?: string) {
        await this.titleMessage.waitFor({ state: 'visible', timeout: 3000 });
        const titleText = await this.titleMessage.textContent();
        const descriptionText = await this.descriptionMessage.textContent();
        return titleText?.trim() === expectedTitle && expectedDescription ? descriptionText?.trim().includes(expectedDescription) : true;
    }

    /**
     * Place a sell order 
     */
    async placeSellOrder(quantity?: string): Promise<void> {
        await this.portfolioTab.click();
        await this.portfolioStockCode.dblclick();
        quantity ? await this.quantityInput.fill(quantity) : await this.portfolioStockCode.dblclick();

        // Wait for price to load and be clickable
        await expect(this.priceCeil).toBeVisible();
        await this.priceCeil.dblclick();

        await this.placeOrderButton.click();
        await this.confirmOrderButton.click();
    }
}

export default OrderPage;