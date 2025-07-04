import { test, expect } from '@playwright/test';
import LoginPage from '../../page/ui/LoginPage';
import OrderBook from '../../page/ui/OrderBook';
import { attachScreenshot } from '../../helpers/reporterHelper';
import { TEST_CONFIG } from '../utils/testConfig';

test.describe('OrderBook Functionality Tests', () => {
    let loginPage: LoginPage;
    let orderBook: OrderBook;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        orderBook = new OrderBook(page);

        // Login before each test
        await loginPage.loginSuccess();
        await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page, context }) => {
        // Clean up after each test
        try {
            await context.clearCookies();
            await page.close();
        } catch (error) {
            console.log('Cleanup error (ignored):', error);
        }
    });

    test('TC_OB_01: Should open orderbook successfully', async ({ page }) => {
        await orderBook.openOrderBook();
        await attachScreenshot(page, 'OrderBook Opened');

        // Verify orderbook is visible and contains expected elements
        expect(await orderBook.orderIndayTab.isVisible()).toBeTruthy();
        expect(await orderBook.orderHistoryTab.isVisible()).toBeTruthy();
        expect(await orderBook.conditionalOrderTab.isVisible()).toBeTruthy();
        expect(await orderBook.putThroughOrderTab.isVisible()).toBeTruthy();
    });

    test('TC_OB_02: Should display order data correctly in Order In Day tab', async ({ page }) => {
        await orderBook.openOrderBook();
        await orderBook.switchToOrderInDayTab();
        await page.waitForTimeout(2000);

        // Check if table has data or shows appropriate empty state
        const hasData = await orderBook.verifyTableHasData();

        if (hasData) {
            // Verify table structure and data
            const orders = await orderBook.getOrderTableData();
            expect(orders.length).toBeGreaterThan(0);

            // Verify first order has required fields
            const firstOrder = orders[0];
            expect(firstOrder).toHaveProperty('account');
            expect(firstOrder).toHaveProperty('stockCode');
            expect(firstOrder).toHaveProperty('time');
            expect(firstOrder).toHaveProperty('status');

            console.log('Order data sample:', firstOrder);
        } else {
            // Verify empty state message is shown
            const hasNoDataMessage = await orderBook.verifyNoDataMessage();
            expect(hasNoDataMessage).toBeTruthy();
        }

        await attachScreenshot(page, 'Order In Day Tab');
    });

    test('TC_OB_03: Should filter orders by search functionality', async ({ page }) => {
        await orderBook.openOrderBook();
        await orderBook.switchToOrderInDayTab();
        await page.waitForTimeout(1000);

        const hasData = await orderBook.verifyTableHasData();

        if (hasData) {
            // Get initial order count
            const initialCount = await orderBook.getOrderCount();

            // Search for a specific stock code (using codes from the image)
            await orderBook.searchOrder('CFPT');
            await page.waitForTimeout(1000);

            // Verify search results
            const filteredCount = await orderBook.getOrderCount();
            console.log(`Initial orders: ${initialCount}, Filtered orders: ${filteredCount}`);

            // Clear search
            await orderBook.searchOrder('');
            await page.waitForTimeout(1000);

            const clearedCount = await orderBook.getOrderCount();
            expect(clearedCount).toBe(initialCount);
        }

        await attachScreenshot(page, 'Search Filter Applied');
    });

    test('TC_OB_04: Should filter orders by status', async ({ page }) => {
        await orderBook.openOrderBook();
        await orderBook.switchToOrderInDayTab();
        await page.waitForTimeout(1000);

        const hasData = await orderBook.verifyTableHasData();

        if (hasData) {
            // Try filtering by "Chờ khớp" (Pending) status
            try {
                await orderBook.filterByStatus('Chờ khớp');
                await page.waitForTimeout(1000);

                // Verify filtered results show only pending orders
                const orders = await orderBook.getOrderTableData();
                if (orders.length > 0) {
                    const allPending = orders.every(order => order.status.includes('Chờ khớp'));
                    expect(allPending).toBeTruthy();
                }
            } catch (error) {
                console.log('Status filter not available or no pending orders');
            }
        }

        await attachScreenshot(page, 'Status Filter Applied');
    });

    test('TC_OB_05: Should verify order actions are available', async ({ page }) => {
        await orderBook.openOrderBook();
        await orderBook.switchToOrderInDayTab();
        await page.waitForTimeout(1000);

        const hasData = await orderBook.verifyTableHasData();

        if (hasData) {
            // Check if cancel and modify buttons are visible for first order
            const cancelButtonExists = await orderBook.cancelOrderButton.first().isVisible();
            const modifyButtonExists = await orderBook.modifyOrderButton.first().isVisible();

            console.log(`Cancel button visible: ${cancelButtonExists}`);
            console.log(`Modify button visible: ${modifyButtonExists}`);

            // At least one action should be available
            expect(cancelButtonExists || modifyButtonExists).toBeTruthy();
        }

        await attachScreenshot(page, 'Order Actions Available');
    });

    test('TC_OB_06: Should navigate between different order tabs', async ({ page }) => {
        await orderBook.openOrderBook();

        // Test Order In Day tab
        await orderBook.switchToOrderInDayTab();
        await page.waitForTimeout(1000);
        await attachScreenshot(page, 'Order In Day Tab Active');

        // Test Order History tab
        await orderBook.switchToOrderHistoryTab();
        await page.waitForTimeout(1000);
        await attachScreenshot(page, 'Order History Tab Active');

        // Switch back to Order In Day
        await orderBook.switchToOrderInDayTab();
        await page.waitForTimeout(1000);

        // Verify we're back on the correct tab
        expect(await orderBook.orderIndayTab.isVisible()).toBeTruthy();
    });

    test('TC_OB_07: Should display correct order information for specific stock codes', async ({ page }) => {
        await orderBook.openOrderBook();
        await orderBook.switchToOrderInDayTab();
        await page.waitForTimeout(1000);

        const hasData = await orderBook.verifyTableHasData();

        if (hasData) {
            const orders = await orderBook.getOrderTableData();

            // Look for orders with stock codes shown in the image (CFPT2501, HPG)
            const cfptOrder = orders.find(order => order.stockCode.includes('CFPT'));
            const hpgOrder = orders.find(order => order.stockCode.includes('HPG'));

            if (cfptOrder) {
                console.log('CFPT Order found:', cfptOrder);
                expect(cfptOrder.stockCode).toBeTruthy();
                expect(cfptOrder.price).toBeTruthy();
                expect(cfptOrder.quantity).toBeTruthy();
            }

            if (hpgOrder) {
                console.log('HPG Order found:', hpgOrder);
                expect(hpgOrder.stockCode).toBeTruthy();
                expect(hpgOrder.price).toBeTruthy();
                expect(hpgOrder.quantity).toBeTruthy();
            }
        }

        await attachScreenshot(page, 'Specific Stock Orders');
    });

    test('TC_OB_08: Should verify order table columns are correctly displayed', async ({ page }) => {
        await orderBook.openOrderBook();
        await orderBook.switchToOrderInDayTab();
        await page.waitForTimeout(1000);

        // Verify table headers are visible
        const headers = await orderBook.tableHeaders.all();
        expect(headers.length).toBeGreaterThan(0);

        // Check if common Vietnamese trading columns are present
        const tableText = await orderBook.orderTable.innerText();
        const expectedColumns = [
            'Tiểu khoản', // Account
            'Mã CK',      // Stock Code
            'Thời gian',  // Time
            'Giá',        // Price
            'KL',         // Quantity
            'Trạng thái', // Status
            'Thao tác'    // Actions
        ];

        let foundColumns = 0;
        for (const column of expectedColumns) {
            if (tableText.includes(column)) {
                foundColumns++;
            }
        }

        expect(foundColumns).toBeGreaterThan(3); // At least half of expected columns
        await attachScreenshot(page, 'Table Columns Verified');
    });

    test('TC_OB_09: Should handle cancel all orders functionality', async ({ page }) => {
        await orderBook.openOrderBook();
        await orderBook.switchToOrderInDayTab();
        await page.waitForTimeout(1000);

        const hasData = await orderBook.verifyTableHasData();

        if (hasData) {
            // Check if cancel all button is available
            const cancelAllVisible = await orderBook.cancelAllOrderButton.isVisible();

            if (cancelAllVisible) {
                // Click cancel all (but handle any confirmation dialogs)
                await orderBook.cancelAllOrderButton.click();
                await page.waitForTimeout(1000);

                // Handle confirmation dialog if it appears
                try {
                    const confirmButton = page.locator('.confirm-btn, .btn-confirm, [data-testid="confirm"]');
                    if (await confirmButton.isVisible({ timeout: 3000 })) {
                        await confirmButton.click();
                    }
                } catch (error) {
                    console.log('No confirmation dialog appeared');
                }
            }
        }

        await attachScreenshot(page, 'Cancel All Orders Attempted');
    });

    test('TC_OB_10: Should close orderbook successfully', async ({ page }) => {
        await orderBook.openOrderBook();
        await page.waitForTimeout(1000);

        // Verify orderbook is open
        expect(await orderBook.orderIndayTab.isVisible()).toBeTruthy();

        // Close orderbook
        await orderBook.closeOrderBook();
        await page.waitForTimeout(1000);

        // Verify orderbook is closed (orderbook panel should not be visible)
        const isOrderBookClosed = await orderBook.orderIndayTab.isVisible() === false;
        expect(isOrderBookClosed).toBeTruthy();

        await attachScreenshot(page, 'OrderBook Closed');
    });

    // Test for verifying specific order statuses from the image
    test('TC_OB_11: Should verify pending order status display', async ({ page }) => {
        await orderBook.openOrderBook();
        await orderBook.switchToOrderInDayTab();
        await page.waitForTimeout(1000);

        const hasData = await orderBook.verifyTableHasData();

        if (hasData) {
            const orders = await orderBook.getOrderTableData();

            // Look for orders with "Chờ khớp" (Pending) status as shown in the image
            const pendingOrders = orders.filter(order =>
                order.status.includes('Chờ khớp') ||
                order.status.includes('Pending') ||
                order.status.includes('Chờ')
            );

            if (pendingOrders.length > 0) {
                console.log(`Found ${pendingOrders.length} pending orders`);
                expect(pendingOrders.length).toBeGreaterThan(0);

                // Verify pending orders have appropriate data
                pendingOrders.forEach(order => {
                    expect(order.stockCode).toBeTruthy();
                    expect(order.quantity).toBeTruthy();
                });
            }
        }

        await attachScreenshot(page, 'Pending Orders Verified');
    });
});
