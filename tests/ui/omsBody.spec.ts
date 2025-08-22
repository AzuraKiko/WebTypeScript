import { test, expect } from '@playwright/test';
import {
    createBodyFilteredCapture,
    executeOrderWorkflow,
    generateTestReport,
    initializePageObjects,
    performLogin,
    navigateToOrderPage,
    switchToMarginAccount,
    OmsTestConfig
} from '../../helpers/omsTestUtils';

const API_DOMAINS = OmsTestConfig.getApiDomains();

test('OMS - capture API calls to domain during trading flow', async ({ page }) => {
    const apiCapture = createBodyFilteredCapture();

    // Setup API call capturing with body filtering
    apiCapture.setupRequestCapture(page);
    apiCapture.addTestStep('Test started - API capture initialized with body filtering');

    // Initialize page objects using shared utility
    const { loginPage, orderPage, orderBook, subaccPage } = await initializePageObjects(page, apiCapture);

    // Enhanced login with retry mechanism
    await performLogin(loginPage, apiCapture);

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
        quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY
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

    // Switch to margin account using shared utility
    await switchToMarginAccount(subaccPage, apiCapture);

    // // Place buy order with margin account
    // await executeOrderWorkflow({
    //     page,
    //     orderPage,
    //     orderBook,
    //     apiCapture,
    //     accountType: 'margin',
    //     side: 'buy',
    //     stockCode: OmsTestConfig.TEST_DATA.STOCK_CODES.MARGIN_ACCOUNT,
    //     quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY,
    //     enableModify: true,
    //     modifyQuantity: 2
    // });

    // // Place sell order with margin account
    // await executeOrderWorkflow({
    //     page,
    //     orderPage,
    //     orderBook,
    //     apiCapture,
    //     accountType: 'margin',
    //     side: 'sell',
    //     quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY
    // });


    // Generate comprehensive test report and export data
    await generateTestReport(apiCapture, API_DOMAINS, 'body');
});