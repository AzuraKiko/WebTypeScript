import { test, expect } from '@playwright/test';
import {
    createUrlCapture,
    executeOrderWorkflow,
    generateTestReport,
    initializePageObjects,
    performLogin,
    navigateToOrderPage,
    switchToMarginAccount,
    OmsTestConfig,
    switchToOddTab,
    openOrderBook,
    switchToOrderBookTab,
    closeOrderBook
} from '../../helpers/omsTestUtils';
import { WaitUtils } from '../../helpers/uiUtils';

const API_DOMAINS = OmsTestConfig.getApiDomains();

test('OMS - capture API calls to domain during trading flow', async ({ page }) => {
    const apiCapture = createUrlCapture();

    // Setup API call capturing
    apiCapture.setupRequestCapture(page);
    apiCapture.addTestStep('Test started - API capture initialized');

    // Initialize page objects using shared utility
    const { loginPage, orderPage, orderBook, subaccPage } = await initializePageObjects(page, apiCapture);

    // Enhanced login with retry mechanism
    await performLogin(loginPage, apiCapture);

    await openOrderBook(orderBook, apiCapture);
    await switchToOrderBookTab(orderBook, apiCapture, 'history');
    await switchToOrderBookTab(orderBook, apiCapture, 'conditional');
    await switchToOrderBookTab(orderBook, apiCapture, 'putthrough');
    await closeOrderBook(orderBook, apiCapture);

    // Navigate to order page with validation
    await navigateToOrderPage(orderPage, apiCapture);

    // Enhanced order placement workflow with better error handling and logging
    await executeOrderWorkflow({
        page,
        orderPage,
        orderBook,
        apiCapture,
        accountType: 'normal',
        side: 'buy',
        stockCode: OmsTestConfig.TEST_DATA.STOCK_CODES.NORMAL_ACCOUNT,
        quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY,
        enableModify: true,
    });

    // Place sell order with normal account
    await executeOrderWorkflow({
        page,
        orderPage,
        orderBook,
        apiCapture,
        accountType: 'normal',
        side: 'sell',
        quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY
    });

    await WaitUtils.delay(3000);
    // Switch to margin account using shared utility
    await switchToMarginAccount(subaccPage, apiCapture);

    // Place buy order with margin account
    await executeOrderWorkflow({
        page,
        orderPage,
        orderBook,
        apiCapture,
        accountType: 'margin',
        side: 'buy',
        stockCode: OmsTestConfig.TEST_DATA.STOCK_CODES.MARGIN_ACCOUNT,
        quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY,
        enableModify: true,
        modifyQuantity: 200
    });

    // Place sell order with margin account
    await executeOrderWorkflow({
        page,
        orderPage,
        orderBook,
        apiCapture,
        accountType: 'margin',
        side: 'sell',
        quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY
    });

    await switchToOddTab(orderPage, apiCapture);
    await WaitUtils.delay(3000);

    await executeOrderWorkflow({
        page,
        orderPage,
        orderBook,
        apiCapture,
        accountType: 'margin',
        side: 'buy',
        stockCode: OmsTestConfig.TEST_DATA.STOCK_CODES.MARGIN_ACCOUNT,
        quantity: OmsTestConfig.TEST_DATA.ODD_QUANTITY,
    });

    // Generate comprehensive test report and export data
    await generateTestReport(apiCapture, API_DOMAINS, 'url');
});