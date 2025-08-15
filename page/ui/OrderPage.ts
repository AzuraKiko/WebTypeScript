import { Page, Locator, expect } from '@playwright/test';
import BasePage from './BasePage';
import { getRandomStockCode } from '../../tests/utils/testConfig';
import MatrixPage from './MatrixPage';
import OrderBook from './OrderBook';

// Interface definitions for better type safety
interface OrderFormData {
    stockCode: string;
    quantity: string;
    price?: string;
}

interface MessageVerification {
    title: string;
    description?: string;
}

interface OrderPageElements {
    navigation: {
        orderButton: Locator;
    };
    form: {
        stockCodeInput: Locator;
        quantityInput: Locator;
        priceInput: Locator;
        priceCeil: Locator;
        priceFloor: Locator;
        priceReference: Locator;
        placeOrderButton: Locator;
        confirmOrderButton: Locator;
    };
    orderBook: {
        orderIndayTab: Locator;
        cancelOrderButton: Locator;
        modifyOrderButton: Locator;
    };
    messages: {
        titleMessage: Locator;
        descriptionMessage: Locator;
    };
}

class OrderPage extends BasePage {
    // Dependencies
    matrixPage: MatrixPage;
    orderBook: OrderBook;

    // Constants
    private static readonly DEFAULT_QUANTITY = '1';
    private static readonly NAVIGATION_TIMEOUT = 3000;
    private static readonly MATRIX_TIMEOUT = 5000;
    private static readonly MESSAGE_TIMEOUT = 3000;

    // Element groups for better organization
    private elements!: OrderPageElements;

    constructor(page: Page) {
        super(page);
        this.matrixPage = new MatrixPage(page);
        this.orderBook = new OrderBook(page);
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
                stockCodeInput: page.getByPlaceholder('Mã CK', { exact: true }),
                priceInput: page.getByPlaceholder('Giá x1000'),
                quantityInput: page.getByPlaceholder('KL x1'),
                priceCeil: page.locator('span.cursor-pointer.c').first(),
                priceFloor: page.locator('span.cursor-pointer.f').first(),
                priceReference: page.locator('span.cursor-pointer.r').first(),
                placeOrderButton: page.getByRole('button', { name: 'Đặt lệnh' }),
                confirmOrderButton: page.getByRole('button', { name: 'Xác nhận' })
            },
            orderBook: {
                orderIndayTab: page.locator('.asset-panel .card-panel-header__title:nth-child(1)'),
                cancelOrderButton: page.locator('td:nth-child(14) > div > span:nth-child(2) > .icon').first(),
                modifyOrderButton: page.locator('td:nth-child(14) > div > span:nth-child(2) > .icon').nth(1)
            },
            messages: {
                titleMessage: page.locator('.toast-content .toast-title'),
                descriptionMessage: page.locator('.toast-content .toast-description')
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
        this.stockCodeInput = this.elements.form.stockCodeInput;
        this.quantityInput = this.elements.form.quantityInput;
        this.priceInput = this.elements.form.priceInput;
        this.priceCeil = this.elements.form.priceCeil;
        this.priceFloor = this.elements.form.priceFloor;
        this.priceReference = this.elements.form.priceReference;
        this.placeOrderButton = this.elements.form.placeOrderButton;
        this.confirmOrderButton = this.elements.form.confirmOrderButton;

        // Order Book
        this.orderIndayTab = this.elements.orderBook.orderIndayTab;
        this.cancelOrderButton = this.elements.orderBook.cancelOrderButton;
        this.modifyOrderButton = this.elements.orderBook.modifyOrderButton;

        // Messages
        this.titleMessage = this.elements.messages.titleMessage;
        this.descriptionMessage = this.elements.messages.descriptionMessage;
    }

    // Legacy property declarations for backward compatibility
    orderButton!: Locator;
    stockCodeInput!: Locator;
    quantityInput!: Locator;
    priceInput!: Locator;
    priceCeil!: Locator;
    priceFloor!: Locator;
    priceReference!: Locator;
    placeOrderButton!: Locator;
    confirmOrderButton!: Locator;
    orderIndayTab!: Locator;
    cancelOrderButton!: Locator;
    modifyOrderButton!: Locator;
    titleMessage!: Locator;
    descriptionMessage!: Locator;

    // =================== NAVIGATION METHODS ===================

    /**
     * Navigate to order page and handle matrix if needed
     */
    async navigateToOrder(): Promise<void> {
        try {
            await this.elements.navigation.orderButton.click();
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
            await this.elements.form.stockCodeInput.fill(code);
            return code;
        } catch (error) {
            throw new Error(`Failed to fill stock code: ${error}`);
        }
    }

    /**
     * Fill quantity in the form
     */
    async fillQuantity(quantity: string): Promise<void> {
        try {
            await this.elements.form.quantityInput.fill(quantity);
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
                floor: this.elements.form.priceFloor,
                ceil: this.elements.form.priceCeil,
                reference: this.elements.form.priceReference
            };

            const selectedElement = priceElements[priceType];

            // Wait for element to be visible and clickable
            await expect(selectedElement).toHaveCount(1);
            await expect(selectedElement).toBeVisible();
            await selectedElement.dblclick();
        } catch (error) {
            throw new Error(`Failed to select ${priceType} price: ${error}`);
        }
    }

    /**
     * Set custom price
     */
    async setCustomPrice(price: string): Promise<void> {
        try {
            await this.elements.form.priceInput.fill(price);
        } catch (error) {
            throw new Error(`Failed to set custom price: ${error}`);
        }
    }

    /**
     * Submit order form
     */
    async submitOrder(): Promise<void> {
        try {
            await this.elements.form.placeOrderButton.click();
            await this.elements.form.confirmOrderButton.click();
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

    /**
     * Place order with custom price
     */
    async placeOrderWithCustomPrice(orderData: OrderFormData): Promise<string> {
        const { stockCode, quantity, price } = orderData;

        if (!price) {
            throw new Error('Custom price is required for this method');
        }

        try {
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
            quantity = OrderPage.DEFAULT_QUANTITY
        } = orderData || {};

        try {
            // Fill stock code
            const usedStockCode = await this.fillStockCode(stockCode);

            // Select reference price for market order
            await this.selectPriceOption('reference');

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
    async verifyMessage(expectedTitle: string, expectedDescription?: string): Promise<boolean> {
        try {
            await this.elements.messages.titleMessage.waitFor({
                state: 'visible',
                timeout: OrderPage.MESSAGE_TIMEOUT
            });

            const titleText = await this.elements.messages.titleMessage.textContent();
            const descriptionText = await this.elements.messages.descriptionMessage.textContent();

            const titleMatch = titleText?.trim() === expectedTitle;
            const descriptionMatch = expectedDescription ?
                (descriptionText?.trim().includes(expectedDescription) ?? false) : true;

            return (titleMatch ?? false) && descriptionMatch;
        } catch (error) {
            console.log(`Message verification failed: ${error}`);
            return false;
        }
    }

    /**
     * Get current message content
     */
    async getCurrentMessage(): Promise<MessageVerification> {
        try {
            await this.elements.messages.titleMessage.waitFor({
                state: 'visible',
                timeout: OrderPage.MESSAGE_TIMEOUT
            });

            const title = await this.elements.messages.titleMessage.textContent() || '';
            const description = await this.elements.messages.descriptionMessage.textContent() || '';

            return {
                title: title.trim(),
                description: description.trim()
            };
        } catch (error) {
            throw new Error(`Failed to get current message: ${error}`);
        }
    }

    /**
     * Wait for success message
     */
    async waitForSuccessMessage(timeout: number = OrderPage.MESSAGE_TIMEOUT): Promise<boolean> {
        try {
            await this.elements.messages.titleMessage.waitFor({
                state: 'visible',
                timeout
            });

            const titleText = await this.elements.messages.titleMessage.textContent();

            // Common success message patterns
            const successPatterns = [
                'Thành công',
                'Đặt lệnh thành công',
                'Success',
                'Order placed successfully'
            ];

            return successPatterns.some(pattern =>
                titleText?.toLowerCase().includes(pattern.toLowerCase())
            );
        } catch (error) {
            console.log(`Success message not found: ${error}`);
            return false;
        }
    }

    /**
     * Wait for error message
     */
    async waitForErrorMessage(timeout: number = OrderPage.MESSAGE_TIMEOUT): Promise<boolean> {
        try {
            await this.elements.messages.titleMessage.waitFor({
                state: 'visible',
                timeout
            });

            const titleText = await this.elements.messages.titleMessage.textContent();

            // Common error message patterns
            const errorPatterns = [
                'Lỗi',
                'Error',
                'Failed',
                'Thất bại',
                'Không thành công'
            ];

            return errorPatterns.some(pattern =>
                titleText?.toLowerCase().includes(pattern.toLowerCase())
            );
        } catch (error) {
            console.log(`Error message not found: ${error}`);
            return false;
        }
    }

    // =================== FORM VALIDATION METHODS ===================

    /**
     * Validate form inputs before placing order
     */
    async validateOrderForm(): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        try {
            // Check stock code
            const stockCode = await this.elements.form.stockCodeInput.inputValue();
            if (!stockCode || stockCode.trim() === '') {
                errors.push('Stock code is required');
            } else if (!/^[A-Z]{3}$/.test(stockCode.trim())) {
                errors.push('Stock code must be 3 uppercase letters');
            }

            // Check quantity
            const quantity = await this.elements.form.quantityInput.inputValue();
            if (!quantity || quantity.trim() === '') {
                errors.push('Quantity is required');
            } else {
                const quantityNum = parseFloat(quantity);
                if (isNaN(quantityNum) || quantityNum <= 0) {
                    errors.push('Quantity must be a positive number');
                }
            }

            // Check if price is set (either through price options or custom input)
            const customPrice = await this.elements.form.priceInput.inputValue();
            const hasPriceSelection = await this.checkPriceSelection();

            if (!customPrice && !hasPriceSelection) {
                errors.push('Price must be selected or entered');
            }

            // Check if buttons are enabled
            const placeOrderEnabled = await this.elements.form.placeOrderButton.isEnabled();
            if (!placeOrderEnabled) {
                errors.push('Place order button is disabled');
            }

        } catch (error) {
            errors.push(`Form validation error: ${error}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Check if any price option is selected
     */
    private async checkPriceSelection(): Promise<boolean> {
        try {
            // This is a simplified check - in reality, you might need to check
            // for visual indicators or class names that show selection state
            const priceElements = [
                this.elements.form.priceCeil,
                this.elements.form.priceFloor,
                this.elements.form.priceReference
            ];

            for (const element of priceElements) {
                const classes = await element.getAttribute('class');
                if (classes && (classes.includes('selected') || classes.includes('active'))) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.log(`Error checking price selection: ${error}`);
            return false;
        }
    }

    /**
     * Clear order form
     */
    async clearOrderForm(): Promise<void> {
        try {
            await this.elements.form.stockCodeInput.clear();
            await this.elements.form.quantityInput.clear();
            await this.elements.form.priceInput.clear();
        } catch (error) {
            throw new Error(`Failed to clear order form: ${error}`);
        }
    }

    // =================== UTILITY METHODS ===================

    /**
     * Get form data
     */
    async getFormData(): Promise<OrderFormData> {
        try {
            const stockCode = await this.elements.form.stockCodeInput.inputValue();
            const quantity = await this.elements.form.quantityInput.inputValue();
            const price = await this.elements.form.priceInput.inputValue();

            return {
                stockCode: stockCode.trim(),
                quantity: quantity.trim(),
                price: price.trim() || undefined
            };
        } catch (error) {
            throw new Error(`Failed to get form data: ${error}`);
        }
    }

    /**
     * Check if order form is ready for submission
     */
    async isFormReadyForSubmission(): Promise<boolean> {
        const validation = await this.validateOrderForm();
        return validation.isValid;
    }

    /**
     * Wait for form to be ready
     */
    async waitForFormReady(timeout: number = 10000): Promise<boolean> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            if (await this.isFormReadyForSubmission()) {
                return true;
            }
            await this.page.waitForTimeout(500);
        }

        return false;
    }

    // =================== LEGACY METHODS (for backward compatibility) ===================

    /**
     * Legacy method - use placeBuyOrder instead
     * @deprecated Use placeBuyOrder method instead
     */
    async placeBuyOrder_Legacy(stockCode?: string, quantity: string = OrderPage.DEFAULT_QUANTITY): Promise<void> {
        console.warn('placeBuyOrder_Legacy is deprecated. Use placeBuyOrder instead.');
        await this.placeBuyOrder({ stockCode, quantity });
    }
}

export default OrderPage;