import { test } from '@playwright/test';
import {
    createUrlCapture,
    executeOrderWorkflow,
    generateTestReport,
    initializePageObjects,
    performLogin,
    navigateToOrderPage,
    switchToMarginAccount,
    switchToFolioAccount,
    OmsTestConfig,
    switchToOddTab,
    openOrderBook,
    switchToOrderBookTab,
    closeOrderBook,
    switchToConditionalTab,
    switchToNormalAccount,
    executeConditionalOrderWorkflow,
    cancelAllOrders,
    createBodyFilteredCapture
} from '../../helpers/omsTestUtils';
import { WaitUtils } from '../../helpers/uiUtils';

const API_DOMAINS = OmsTestConfig.getApiDomains();

// Shared test logic for OMS API capture tests
function createOmsCaptureTest(captureType: 'url' | 'body', testStepMessage: string) {
    return async ({ page }: { page: any }) => {
        const apiCapture = captureType === 'url' ? createUrlCapture() : createBodyFilteredCapture();

        // Setup API call capturing
        apiCapture.setupRequestCapture(page);
        apiCapture.addTestStep(testStepMessage);

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
        });

        // Place sell order with normal account
        await executeOrderWorkflow({
            page,
            orderPage,
            orderBook,
            apiCapture,
            accountType: 'normal',
            side: 'sell',
            quantity: OmsTestConfig.TEST_DATA.ODD_QUANTITY
        });

        await WaitUtils.delay(3000);

        await switchToFolioAccount(subaccPage, apiCapture);

        await orderPage.placeBuyOrder({
            stockCode: OmsTestConfig.TEST_DATA.STOCK_CODES.NORMAL_ACCOUNT,
            quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY,
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
        });

        // Place sell order with margin account
        await executeOrderWorkflow({
            page,
            orderPage,
            orderBook,
            apiCapture,
            accountType: 'margin',
            side: 'sell',
            quantity: OmsTestConfig.TEST_DATA.ODD_QUANTITY
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

        await switchToNormalAccount(subaccPage, apiCapture);

        await switchToConditionalTab(orderPage, apiCapture);

        // Place outTime Conditional Order
        await executeConditionalOrderWorkflow({
            page,
            orderPage,
            orderBook,
            apiCapture,
            accountType: 'normal',
            sideConditional: 'buy',
            stockCode: OmsTestConfig.TEST_DATA.STOCK_CODES.NORMAL_ACCOUNT,
            quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY,
            navigationConditional: 'outTime',
        });

        // Place trend Conditional Order
        await executeConditionalOrderWorkflow({
            page,
            orderPage,
            orderBook,
            apiCapture,
            accountType: 'normal',
            sideConditional: 'buy',
            stockCode: OmsTestConfig.TEST_DATA.STOCK_CODES.NORMAL_ACCOUNT,
            quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY,
            navigationConditional: 'trend',
            differenceTP: 1000,
            pauseValue: 1,
        });

        // Place takeProfit Conditional Order
        await executeConditionalOrderWorkflow({
            page,
            orderPage,
            orderBook,
            apiCapture,
            accountType: 'normal',
            stockCode: OmsTestConfig.TEST_DATA.STOCK_CODES.NORMAL_ACCOUNT,
            quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY,
            navigationConditional: 'takeProfit',
            differenceBQ: 1000,
            sideConditional: 'sell',
        });

        // Place stopLoss Conditional Order
        await executeConditionalOrderWorkflow({
            page,
            orderPage,
            orderBook,
            apiCapture,
            accountType: 'normal',
            stockCode: OmsTestConfig.TEST_DATA.STOCK_CODES.NORMAL_ACCOUNT,
            quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY,
            navigationConditional: 'stopLoss',
            differenceBQ: 1000,
            sideConditional: 'sell',
        });

        // Place purchase Conditional Order
        await executeConditionalOrderWorkflow({
            page,
            orderPage,
            orderBook,
            apiCapture,
            accountType: 'normal',
            stockCode: 'ACB',
            quantity: OmsTestConfig.TEST_DATA.ORDER_QUANTITY,
            navigationConditional: 'purchase',
            sideConditional: 'buy',
            enableCancel: true,
        });

        await orderBook.openOrderBook();

        await cancelAllOrders(orderBook, apiCapture);

        // Generate comprehensive test report and export data
        await generateTestReport(apiCapture, API_DOMAINS, captureType);
    };
}

test('OMS filter Url- capture API calls to domain during trading flow', createOmsCaptureTest('url', 'Test started - API capture initialized'));


test('OMS Filter Body - capture API calls to domain during trading flow', createOmsCaptureTest('body', 'Test started - API capture initialized with body filtering'));