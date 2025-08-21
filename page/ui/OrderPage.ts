import { Page, Locator, expect } from '@playwright/test';
import BasePage from './BasePage';
import { getRandomStockCode } from '../../tests/utils/testConfig';
import MatrixPage from './MatrixPage';
import OrderBook from './OrderBook';
import PortfolioPage from './PorfolioPage';
import { FormUtils, TableUtils, CommonSelectors } from '../../helpers/uiUtils';

// Interface definitions for better type safety
interface OrderFormData {
    stockCode: string;
    quantity: number;
    price?: number | string;
    side: 'buy' | 'sell';
}

interface OrderPageElements {
    navigation: {
        orderButton: Locator;
    };
    form: {
        buyTab: Locator;
        sellTab: Locator;
        stockCodeInput: Locator;
        quantityInput: Locator;
        priceInput: Locator;
        priceCeil: Locator;
        priceFloor: Locator;
        priceReference: Locator;
        ATO: Locator;
        ATC: Locator;
        MTL: Locator;
        PLO: Locator;
        MOK: Locator;
        MAK: Locator;
        placeOrderButton: Locator;
        confirmOrderButton: Locator;
        reloadPurchasePower: Locator;
        closeOrderButton: Locator
    };
    orderBook: {
        orderIndayTab: Locator;
        assetTab: Locator;
        toggleWaitingMatch: Locator;
        cancelOrderButton: Locator;
        modifyOrderButton: Locator;
        switchQtyColumn: Locator;
        dropdownQty: Locator;
    };
    messages: {
        toastMessage: Locator;
        titleMessage: Locator;
        descriptionMessage: Locator;
        closeToastMessage: Locator;
    };
}

class OrderPage extends BasePage {
    // Dependencies
    matrixPage: MatrixPage;
    orderBook: OrderBook;
    portfolioPage: PortfolioPage;

    // Constants
    private static readonly DEFAULT_QUANTITY = 1;
    private static readonly NAVIGATION_TIMEOUT = 3000;
    private static readonly MATRIX_TIMEOUT = 5000;
    private static readonly MESSAGE_TIMEOUT = 3000;

    // Element groups for better organization
    private elements!: OrderPageElements;

    constructor(page: Page) {
        super(page);
        this.matrixPage = new MatrixPage(page);
        this.orderBook = new OrderBook(page);
        this.portfolioPage = new PortfolioPage(page);
        this.initializeElements(page);
    }

    /**
     * Initialize all page elements in organized structure
     */
    private initializeElements(page: Page): void {
        this.elements = {
            navigation: {
                orderButton: page.locator('.footer-btn:has(.iOrder)')
            },
            form: {
                buyTab: page.locator('.order-button.order-buy'),
                sellTab: page.locator('.order-button.order-sell'),
                stockCodeInput: page.getByPlaceholder('Mã CK', { exact: true }),
                priceInput: page.getByPlaceholder('Giá x1000'),
                quantityInput: page.getByPlaceholder('KL x1'),
                priceCeil: page.locator('span.cursor-pointer.c').first(),
                priceFloor: page.locator('span.cursor-pointer.f').first(),
                priceReference: page.locator('span.cursor-pointer.r').first(),
                ATO: page.locator('.btn.btn-info', { hasText: 'ATO' }),
                ATC: page.locator('.btn.btn-info', { hasText: 'ATC' }),
                MTL: page.locator('.btn.btn-info', { hasText: 'MTL' }),
                PLO: page.locator('.btn.btn-info', { hasText: 'PLO' }),
                MOK: page.locator('.btn.btn-info', { hasText: 'MOK' }),
                MAK: page.locator('.btn.btn-info', { hasText: 'MAK' }),
                placeOrderButton: page.getByRole('button', { name: 'Đặt lệnh' }),
                confirmOrderButton: page.getByRole('button', { name: 'Xác nhận' }),
                reloadPurchasePower: page.locator('.reset-order .iRefresh.icon'),
                closeOrderButton: page.locator('.card-panel.order .icon.iClose')
            },
            orderBook: {
                orderIndayTab: page.locator('.asset-panel .card-panel-header__title:nth-child(1)'),
                assetTab: page.locator('.asset-panel .card-panel-header__title:nth-child(2)'),
                toggleWaitingMatch: page.locator('.asset-panel .custom-checkbox'),
                cancelOrderButton: page.locator('td:nth-child(14) > div > span:nth-child(2) > .icon').first(),
                modifyOrderButton: page.locator('td:nth-child(14) > div > span:nth-child(2) > .icon').nth(1),
                switchQtyColumn: page.locator('.asset-panel .icon.i3Dots'),
                dropdownQty: page.locator('.header-dropdown__items')
            },
            messages: {
                toastMessage: page.locator('.notification.toast.top-right'),
                titleMessage: page.locator('.toast-content .toast-title'),
                descriptionMessage: page.locator('.toast-content .toast-description'),
                closeToastMessage: page.locator('.toast-action .icon.iClose')
            }
        };

        // Create legacy property references for backward compatibility
        this.createLegacyReferences();
    }

    /**
     * Create legacy property references for backward compatibility
     */
    private createLegacyReferences(): void {
        // Navigation
        this.orderButton = this.elements.navigation.orderButton;

        // Order Form
        this.buyTab = this.elements.form.buyTab;
        this.sellTab = this.elements.form.sellTab;
        this.stockCodeInput = this.elements.form.stockCodeInput;
        this.quantityInput = this.elements.form.quantityInput;
        this.priceInput = this.elements.form.priceInput;
        this.priceCeil = this.elements.form.priceCeil;
        this.priceFloor = this.elements.form.priceFloor;
        this.priceReference = this.elements.form.priceReference;
        this.ATO = this.elements.form.ATO;
        this.ATC = this.elements.form.ATC;
        this.MTL = this.elements.form.MTL;
        this.PLO = this.elements.form.PLO;
        this.MOK = this.elements.form.MOK;
        this.MAK = this.elements.form.MAK;
        this.placeOrderButton = this.elements.form.placeOrderButton;
        this.confirmOrderButton = this.elements.form.confirmOrderButton;
        this.reloadPurchasePower = this.elements.form.reloadPurchasePower;
        this.closeOrderButton = this.elements.form.closeOrderButton;

        // Order Book
        this.orderIndayTab = this.elements.orderBook.orderIndayTab;
        this.assetTab = this.elements.orderBook.assetTab;
        this.toggleWaitingMatch = this.elements.orderBook.toggleWaitingMatch;
        this.cancelOrderButton = this.elements.orderBook.cancelOrderButton;
        this.modifyOrderButton = this.elements.orderBook.modifyOrderButton;
        this.switchQtyColumn = this.elements.orderBook.switchQtyColumn;
        this.dropdownQty = this.elements.orderBook.dropdownQty;

        // Messages
        this.toastMessage = this.elements.messages.toastMessage;
        this.titleMessage = this.elements.messages.titleMessage;
        this.descriptionMessage = this.elements.messages.descriptionMessage;
        this.closeToastMessage = this.elements.messages.closeToastMessage;
    }

    // Legacy property declarations for backward compatibility
    orderButton!: Locator;
    buyTab!: Locator;
    sellTab!: Locator;
    stockCodeInput!: Locator;
    quantityInput!: Locator;
    priceInput!: Locator;
    priceCeil!: Locator;
    priceFloor!: Locator;
    priceReference!: Locator;
    ATO!: Locator;
    ATC!: Locator;
    MTL!: Locator;
    PLO!: Locator;
    MOK!: Locator;
    MAK!: Locator;
    placeOrderButton!: Locator;
    confirmOrderButton!: Locator;
    reloadPurchasePower!: Locator;
    closeOrderButton!: Locator;
    orderIndayTab!: Locator;
    assetTab!: Locator;
    toggleWaitingMatch!: Locator;
    cancelOrderButton!: Locator;
    modifyOrderButton!: Locator;
    switchQtyColumn!: Locator;
    dropdownQty!: Locator;

    toastMessage!: Locator;
    titleMessage!: Locator;
    descriptionMessage!: Locator;
    closeToastMessage!: Locator;

    // =================== NAVIGATION METHODS ===================

    /**
     * Navigate to order page and handle matrix if needed
     */
    async navigateToOrder(): Promise<void> {
        try {
            await this.orderButton.click();
            await this.page.waitForTimeout(OrderPage.NAVIGATION_TIMEOUT);

            if (await this.matrixPage.isMatrixVisible()) {
                await this.matrixPage.enterMatrixValid();
            }

            await this.page.waitForTimeout(OrderPage.MATRIX_TIMEOUT);
        } catch (error) {
            throw new Error(`Failed to navigate to order page: ${error}`);
        }
    }

    // =================== ORDER FORM METHODS ===================

    /**
     * Fill stock code in the form
     */
    async fillStockCode(stockCode?: string): Promise<string> {
        const code = stockCode || getRandomStockCode();
        try {
            await FormUtils.fillField(this.stockCodeInput, code);
            return code;
        } catch (error) {
            throw new Error(`Failed to fill stock code: ${error}`);
        }
    }

    /**
     * Fill quantity in the form
     */
    async fillQuantity(quantity: number): Promise<void> {
        try {
            await FormUtils.fillField(this.quantityInput, quantity);
        } catch (error) {
            throw new Error(`Failed to fill quantity: ${error}`);
        }
    }

    /**
     * Select price option (floor, ceil, or reference)
     */
    async selectPriceOption(priceType: 'floor' | 'ceil' | 'reference'): Promise<void> {
        try {
            const priceElements = {
                floor: this.priceFloor,
                ceil: this.priceCeil,
                reference: this.priceReference
            };

            const selectedElement = priceElements[priceType];

            await expect(selectedElement).toBeVisible();
            await selectedElement.dblclick();
        } catch (error) {
            throw new Error(`Failed to select ${priceType} price: ${error}`);
        }
    }

    async selectMarketPrice(priceType: 'ATO' | 'ATC' | 'MTL' | 'PLO' | 'MOK' | 'MAK'): Promise<void> {
        try {
            const priceElements = {
                ATO: this.ATO,
                ATC: this.ATC,
                MTL: this.MTL,
                PLO: this.PLO,
                MOK: this.MOK,
                MAK: this.MAK
            };

            const selectedElement = priceElements[priceType];
            await this.priceInput.focus();

            await expect(selectedElement).toBeVisible();
            await selectedElement.click();
        } catch (error) {
            throw new Error(`Failed to select market price: ${error}`);
        }
    }
    /**
     * Set custom price
     */
    async setCustomPrice(price: number | string): Promise<void> {
        try {
            await FormUtils.fillField(this.priceInput, price);
        } catch (error) {
            throw new Error(`Failed to set custom price: ${error}`);
        }
    }

    /**
     * Submit order form
     */
    async submitOrder(): Promise<void> {
        try {
            await this.placeOrderButton.click();
            await this.confirmOrderButton.click();
        } catch (error) {
            throw new Error(`Failed to submit order: ${error}`);
        }
    }

    // =================== ORDER PLACEMENT METHODS ===================

    /**
     * Place a buy order with enhanced error handling
     */
    async placeBuyOrder(orderData?: Partial<OrderFormData>): Promise<string> {
        const {
            stockCode,
            quantity = OrderPage.DEFAULT_QUANTITY
        } = orderData || {};

        try {
            await this.buyTab.click();
            // Fill stock code
            const usedStockCode = await this.fillStockCode(stockCode);

            // Select price (default to floor for buy orders)
            await this.selectPriceOption('floor');

            // Fill quantity
            await this.fillQuantity(quantity);

            // Submit order
            await this.submitOrder();

            return usedStockCode;
        } catch (error) {
            throw new Error(`Failed to place buy order: ${error}`);
        }
    }

    /**
     * Place a sell order with enhanced error handling
     */
    async placeSellOrder(orderData?: Partial<OrderFormData>): Promise<string> {
        const {
            stockCode,
            quantity = OrderPage.DEFAULT_QUANTITY
        } = orderData || {};

        try {
            await this.sellTab.click();
            // Fill stock code
            const usedStockCode = await this.fillStockCode(stockCode);

            // Select price (default to ceil for sell orders)
            await this.selectPriceOption('ceil');

            // Fill quantity
            await this.fillQuantity(quantity);

            // Submit order
            await this.submitOrder();

            return usedStockCode;
        } catch (error) {
            throw new Error(`Failed to place sell order: ${error}`);
        }
    }

    async placeSellOrderFromPorfolio(orderData?: Partial<OrderFormData>): Promise<string> {
        const {
            quantity = OrderPage.DEFAULT_QUANTITY
        } = orderData || {};
        await this.sellTab.click();
        await this.portfolioPage.navigateToPortfolio();
        await this.portfolioPage.clickPorfolioRowByQuantity(quantity);

        const usedStockCode = await this.priceInput.textContent();
        await this.selectPriceOption('ceil');
        await this.fillQuantity(quantity);
        await this.submitOrder();

        return usedStockCode || '';
    }

    /**
     * Place order with custom price
     */
    async placeOrderWithCustomPrice(orderData: OrderFormData): Promise<string> {
        const { stockCode, quantity, price, side } = orderData;

        if (!price) {
            throw new Error('Custom price is required for this method');
        }

        try {
            if (side === 'buy') {
                await this.buyTab.click();
            } else {
                await this.sellTab.click();
            }

            // Fill stock code
            const usedStockCode = await this.fillStockCode(stockCode);

            // Set custom price
            await this.setCustomPrice(price);

            // Fill quantity
            await this.fillQuantity(quantity);

            // Submit order
            await this.submitOrder();

            return usedStockCode;
        } catch (error) {
            throw new Error(`Failed to place order with custom price: ${error}`);
        }
    }

    /**
     * Place market order (using reference price)
     */
    async placeMarketOrder(orderData?: Partial<OrderFormData>): Promise<string> {
        const {
            stockCode,
            quantity = OrderPage.DEFAULT_QUANTITY,
            price,
            side
        } = orderData || {};

        try {
            if (side === 'buy') {
                await this.buyTab.click();
            } else {
                await this.sellTab.click();
            }

            // Fill stock code
            const usedStockCode = await this.fillStockCode(stockCode);
            const priceType = price as 'ATO' | 'ATC' | 'MTL' | 'PLO' | 'MOK' | 'MAK';

            // Select reference price for market order
            await this.selectMarketPrice(priceType);

            // Fill quantity
            await this.fillQuantity(quantity);

            // Submit order
            await this.submitOrder();

            return usedStockCode;
        } catch (error) {
            throw new Error(`Failed to place market order: ${error}`);
        }
    }

    // =================== MESSAGE VERIFICATION METHODS ===================

    /**
     * Verify message with improved error handling and timeout
     */
    async verifyMessageOrder(expectedTitle: string | string[], expectedDescription?: string | string[]): Promise<void> {
        await FormUtils.verifyArrayMessage(expectedTitle, this.titleMessage, expectedDescription, this.descriptionMessage);
    }

    async closeToastMessageOrder(): Promise<void> {
        await this.closeToastMessage.click();
    }

    async closeAllToastMessages(elements: Locator): Promise<void> {
        const count = await elements.count();
        for (let i = 0; i < count; i++) {
            const iconClose = elements.nth(i).locator('.icon.iClose');
            await iconClose.click();
        }
    }

    /**
     * Get current message content
     */
    async getCurrentMessageOrder(): Promise<void> {
        await FormUtils.getCurrentMessage(this.titleMessage, this.descriptionMessage);
    }

    /**
     * Wait for success message
     */
    async waitForSuccessMessageOrder(timeout: number = OrderPage.MESSAGE_TIMEOUT): Promise<boolean> {
        return FormUtils.waitForSuccessMessage(this.titleMessage, timeout);
    }

    /**
     * Wait for error message
     */
    async waitForErrorMessageOrder(timeout: number = OrderPage.MESSAGE_TIMEOUT): Promise<boolean> {
        return FormUtils.waitForErrorMessage(this.titleMessage, timeout);
    }

    async updatePurchasePower(): Promise<void> {
        await this.reloadPurchasePower.click();
    }

    async closeOrder(): Promise<void> {
        await this.closeOrderButton.click();
    }

    // =================== ORDER IN DAY METHODS ===================

    async openOrderInDayTab(): Promise<void> {
        await this.orderIndayTab.click();
    }

    async switchToAssetTab(): Promise<void> {
        await this.assetTab.click();
    }

    async reloadData(): Promise<void> {
        await this.orderBook.reloadOrderBook();
    }
    async closeOrderInDay(): Promise<void> {
        await this.page.locator('.card-panel.asset-panel .icon.iClose').click();
    }
    async verifyToggleWaitingMatchOn(): Promise<boolean> {
        return await FormUtils.verifyToggle(this.toggleWaitingMatch, 'ON');
    }

    async verifyToggleWaitingMatchOff(): Promise<boolean> {
        return await FormUtils.verifyToggle(this.toggleWaitingMatch, 'OFF');
    }

    async clickToggleWaitingMatch(): Promise<void> {
        await this.toggleWaitingMatch.click();
    }

    async getOrderInDayRowData(rowIndex: number): Promise<any> {
        await this.orderIndayTab.waitFor({ state: 'visible' });
        const rows = await this.orderBook.tableRows.nth(rowIndex);
        await rows.waitFor({ state: 'visible' });

        const stockCode = await rows.locator('td:nth-child(1)').textContent();
        const side = await rows.locator('td:nth-child(2)').textContent();
        const price = await rows.locator('td:nth-child(3)').textContent();
        const remainingQuantity = await rows.locator('td:nth-child(4)').textContent();
        const status = await rows.locator('td:nth-child(5)').textContent();

        await this.switchQtyColumn.click();
        await FormUtils.selectOption(this.page, this.dropdownQty, this.dropdownQty, 'KL');

        const quantity = await rows.locator('td:nth-child(4)').textContent();

        await this.switchQtyColumn.click();
        await FormUtils.selectOption(this.page, this.dropdownQty, this.dropdownQty, 'KL khớp');
        const matchedQuantity = await rows.locator('td:nth-child(4)').textContent();

        return {
            stockCode,
            side,
            price,
            quantity,
            matchedQuantity,
            remainingQuantity,
            status
        };
    }

    async getAllOrderInDayData(useScrolling: boolean = true): Promise<any[]> {
        await this.orderIndayTab.waitFor({ state: 'visible' });
        return await TableUtils.getAllTableData(this.page, this.orderBook.tableRows, this.page.locator(CommonSelectors.SCROLL_TABLE), this.getOrderInDayRowData, useScrolling);
    }


}

export default OrderPage;