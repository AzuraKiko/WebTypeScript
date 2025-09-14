import { Page, Locator, expect } from '@playwright/test';
import BasePage from './BasePage';
import { getRandomStockCode } from '../../tests/utils/testConfig';
import MatrixPage from './MatrixPage';
import { FormUtils, TableUtils, CommonSelectors } from '../../helpers/uiUtils';
import SelectSubacc from './SubaccPage';

// Interface definitions for better type safety
interface OrderDerivativeFormData {
    stockCode: string;
    quantity: number;
    price?: number | string;
    side: 'long' | 'short';
}

interface DerivativePageElements {
    navigation: {
        orderButton: Locator;
    };
    form: {
        iconSearchStock: Locator;
        inputSearchStock: Locator;
        optionSearchStock: Locator;
        quantityInput: Locator;
        priceInput: Locator;
        priceCeil: Locator;
        priceFloor: Locator;
        priceReference: Locator;

        LO: Locator,
        ATO: Locator;
        ATC: Locator;
        MTL: Locator;
        MOK: Locator;
        MAK: Locator;

        longButton: Locator;
        shortButton: Locator;

        confirmOrderButton: Locator;
        closeOrderButton: Locator
    };
    messages: {
        toastMessage: Locator;
        titleMessage: Locator;
        descriptionMessage: Locator;
        closeToastMessage: Locator;
    };
}

class DerivativePage extends BasePage {
    // Dependencies
    matrixPage: MatrixPage;
    subaccPage: SelectSubacc;


    // Constants
    private static readonly DEFAULT_QUANTITY = 1;
    private static readonly NAVIGATION_TIMEOUT = 3000;
    private static readonly MATRIX_TIMEOUT = 5000;
    private static readonly MESSAGE_TIMEOUT = 3000;

    // Element groups for better organization
    private elements!: DerivativePageElements;

    constructor(page: Page) {
        super(page);
        this.matrixPage = new MatrixPage(page);
        this.subaccPage = new SelectSubacc(page);
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
                iconSearchStock: page.locator('.icon.iEdit'),
                inputSearchStock: page.getByPlaceholder('Mã hợp đồng', { exact: true }),
                optionSearchStock: page.locator('.list-unstyled'),
                priceInput: page.getByPlaceholder('Giá x1000'),
                quantityInput: page.locator('input.order-quantity'),
                priceCeil: page.locator('span.c.text.text--sm').first(),
                priceFloor: page.locator('span.f.text.text--sm').first(),
                priceReference: page.locator('span.r.text.text--sm').first(),

                LO: page.locator('.type.btn.btn--dark  ', { hasText: 'LO' }),
                ATO: page.locator('.type.btn.btn--dark  ', { hasText: 'ATO' }),
                ATC: page.locator('.type.btn.btn--dark  ', { hasText: 'ATC' }),
                MTL: page.locator('.type.btn.btn--dark  ', { hasText: 'MTL' }),
                MOK: page.locator('.type.btn.btn--dark  ', { hasText: 'MOK' }),
                MAK: page.locator('.type.btn.btn--dark  ', { hasText: 'MAK' }),

                longButton: page.locator('.btn.btn--buy:nth-child(1)'),
                shortButton: page.locator('.btn.btn--buy:nth-child(2)'),
                confirmOrderButton: page.locator('.btn-confirm'),
                closeOrderButton: page.locator('.btn--cancel')
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
        this.iconSearchStock = this.elements.form.iconSearchStock;
        this.inputSearchStock = this.elements.form.inputSearchStock;
        this.optionSearchStock = this.elements.form.optionSearchStock;
        this.quantityInput = this.elements.form.quantityInput;
        this.priceInput = this.elements.form.priceInput;
        this.priceCeil = this.elements.form.priceCeil;
        this.priceFloor = this.elements.form.priceFloor;
        this.priceReference = this.elements.form.priceReference;

        this.LO = this.elements.form.LO;
        this.ATO = this.elements.form.ATO;
        this.ATC = this.elements.form.ATC;
        this.MTL = this.elements.form.MTL;
        this.MOK = this.elements.form.MOK;
        this.MAK = this.elements.form.MAK;

        this.longButton = this.elements.form.longButton;
        this.shortButton = this.elements.form.shortButton;
        this.confirmOrderButton = this.elements.form.confirmOrderButton;
        this.closeOrderButton = this.elements.form.closeOrderButton;

        // Messages
        this.toastMessage = this.elements.messages.toastMessage;
        this.titleMessage = this.elements.messages.titleMessage;
        this.descriptionMessage = this.elements.messages.descriptionMessage;
        this.closeToastMessage = this.elements.messages.closeToastMessage;
    }

    // Legacy property declarations for backward compatibility
    orderButton!: Locator;
    iconSearchStock!: Locator;
    inputSearchStock!: Locator;
    optionSearchStock!: Locator;
    quantityInput!: Locator;
    priceInput!: Locator;
    priceCeil!: Locator;
    priceFloor!: Locator;
    priceReference!: Locator;

    LO!: Locator;
    ATO!: Locator;
    ATC!: Locator;
    MTL!: Locator;
    MOK!: Locator;
    MAK!: Locator;

    longButton!: Locator;
    shortButton!: Locator;

    confirmOrderButton!: Locator;
    closeOrderButton!: Locator;

    toastMessage!: Locator;
    titleMessage!: Locator;
    descriptionMessage!: Locator;
    closeToastMessage!: Locator;

    // =================== NAVIGATION METHODS ===================

    /**
     * Navigate to order page and handle matrix if needed
     */
    async navigateToDerivativeOrder(): Promise<void> {
        try {
            await this.orderButton.click();
            await this.page.waitForTimeout(DerivativePage.NAVIGATION_TIMEOUT);

            if (await this.matrixPage.isMatrixVisible()) {
                await this.matrixPage.enterMatrixValid();
            }

            await this.page.waitForTimeout(DerivativePage.MATRIX_TIMEOUT);
            await this.subaccPage.selectFutureSubacc();
            await this.orderButton.click();

        } catch (error) {
            throw new Error(`Failed to navigate to order page: ${error}`);
        }
    }

    // =================== ORDER FORM METHODS ===================

    /**
     * Select stock code in the form
     */
    async selectStockCode(stockCode: string): Promise<string> {
        const code: string = stockCode;
        try {
            await FormUtils.selectOption(this.page, this.iconSearchStock, this.optionSearchStock, code);
            await this.page.waitForTimeout(500);
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

    async selectMarketPrice(priceType: 'ATO' | 'ATC' | 'MTL' | 'MOK' | 'MAK'): Promise<void> {
        try {
            const priceElements = {
                ATO: this.ATO,
                ATC: this.ATC,
                MTL: this.MTL,
                MOK: this.MOK,
                MAK: this.MAK
            };

            const selectedElement = priceElements[priceType];
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
    async submitOrder(side: 'long' | 'short'): Promise<void> {
        try {
            if (side === 'long') {
                await this.longButton.click();
            } else {
                await this.shortButton.click();
            }
            await this.confirmOrderButton.click();
        } catch (error) {
            throw new Error(`Failed to submit order: ${error}`);
        }
    }

    // =================== ORDER PLACEMENT METHODS ===================

    /**
     * Place a buy order with enhanced error handling
     */
    async placeOrder(side: 'long' | 'short', orderData?: Partial<OrderDerivativeFormData>): Promise<string> {
        const {
            stockCode,
            quantity = DerivativePage.DEFAULT_QUANTITY
        } = orderData || {};

        try {
            // Fill stock code
            const usedStockCode: string = await this.selectStockCode(stockCode!);

            // Select price based on side: floor for long, ceil for short
            const priceType = side === 'long' ? 'floor' : 'ceil';
            await this.selectPriceOption(priceType);

            // Fill quantity
            await this.fillQuantity(quantity);

            // Submit order
            await this.submitOrder(side);

            return usedStockCode;
        } catch (error) {
            throw new Error(`Failed to place ${side} order: ${error}`);
        }
    }


    // async placeSellOrderFromPorfolio(orderData?: Partial<OrderDerivativeFormData>): Promise<string> {
    //     const {
    //         quantity = DerivativePage.DEFAULT_QUANTITY
    //     } = orderData || {};
    //     await this.portfolioPage.navigateToPortfolio();
    //     await this.portfolioPage.clickPorfolioRowByQuantity(quantity);

    //     const usedStockCode = await this.priceInput.textContent();
    //     await this.selectPriceOption('ceil');
    //     await this.fillQuantity(quantity);
    //     await this.submitOrder('short');

    //     return usedStockCode || '';
    // }

    /**
     * Place order with custom price
     */
    async placeOrderWithCustomPrice(orderData: OrderDerivativeFormData): Promise<string> {
        const { stockCode, quantity, price, side } = orderData;

        if (!price) {
            throw new Error('Custom price is required for this method');
        }

        try {
            const usedStockCode: string = await this.selectStockCode(stockCode!);

            // Set custom price
            await this.setCustomPrice(price);

            // Fill quantity
            await this.fillQuantity(quantity);


            if (side === 'long') {
                await this.longButton.click();
            } else {
                await this.shortButton.click();
            }
            await this.submitOrder(side);

            return usedStockCode;
        } catch (error) {
            throw new Error(`Failed to place order with custom price: ${error}`);
        }
    }

    /**
     * Place market order (using reference price)
     */
    async placeMarketOrder(orderData?: Partial<OrderDerivativeFormData>): Promise<string> {
        const {
            stockCode,
            quantity = DerivativePage.DEFAULT_QUANTITY,
            price,
            side
        } = orderData || {};

        try {
            // Fill stock code
            const usedStockCode = await this.selectStockCode(stockCode!);
            const priceType = price as 'ATO' | 'ATC' | 'MTL' | 'MOK' | 'MAK';

            // Select reference price for market order
            await this.selectMarketPrice(priceType);

            // Fill quantity
            await this.fillQuantity(quantity);

            if (side === 'long') {
                await this.longButton.click();
            } else {
                await this.shortButton.click();
            }
            await this.submitOrder(side!);

            return usedStockCode;
        } catch (error) {
            throw new Error(`Failed to place market order: ${error}`);
        }
    }
}

export default DerivativePage;