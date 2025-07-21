import { Page, Locator, expect } from '@playwright/test';
import BasePage from './BasePage';

class OrderBook extends BasePage {
    orderBookButton: Locator;
    orderIndayTab: Locator;
    orderHistoryTab: Locator;
    conditionalOrderTab: Locator;
    putThroughOrderTab: Locator;
    reloadOrderBookButton: Locator;
    expandOrderBookButton: Locator;
    closeOrderBookButton: Locator;

    // Filter and Search Elements
    cancelAllOrderButton: Locator;
    searchInput: Locator;
    statusSelect: Locator;
    accountSelect: Locator;
    orderTypeSelect: Locator;

    // Table Elements
    orderTable: Locator;
    tableHeaders: Locator;
    tableRows: Locator;
    totalOrder: Locator;

    // Table Column Locators
    checkboxHeaderAll: Locator;
    checkboxColumn: (rowIndex: number) => Locator;
    accountColumn: (rowIndex: number) => Locator;
    orderNoColumn: (rowIndex: number) => Locator;
    originOrderNoColumn: (rowIndex: number) => Locator;
    sideColumn: (rowIndex: number) => Locator;
    stockCodeColumn: (rowIndex: number) => Locator;
    timeColumn: (rowIndex: number) => Locator;
    orderTypeColumn: (rowIndex: number) => Locator;
    priceColumn: (rowIndex: number) => Locator;
    quantityColumn: (rowIndex: number) => Locator;
    matchedQuantityColumn: (rowIndex: number) => Locator;
    remainingQuantityColumn: (rowIndex: number) => Locator;
    statusColumn: (rowIndex: number) => Locator;
    actionColumn: (rowIndex: number) => Locator;
    expandOrderButton: (rowIndex: number) => Locator;

    // Action Buttons in Table
    cancelOrderButton: (rowIndex: number) => Locator;
    modifyOrderButton: (rowIndex: number) => Locator;

    // Cancel All Orders Modal Elements
    cancelAllModal: Locator;
    cancelAllModalHeader: Locator;
    cancelAllModalTable: Locator;
    cancelAllConfirmButton: Locator;
    cancelAllModalCloseButton: Locator;

    // Individual Order Cancel Modal Elements
    deleteOrderModal: Locator;
    deleteOrderStockCode: Locator;
    deleteOrderType: Locator;
    deleteOrderNumber: Locator;
    deleteOrderConfirmButton: Locator;
    deleteOrderCancelButton: Locator;

    // Modify Order Modal Elements
    modifyOrderModal: Locator;
    modifyOrderNumber: Locator;
    modifyOrderAccount: Locator;
    modifyOrderType: Locator;
    modifyOrderSymbol: Locator;
    modifyOrderPriceInput: Locator;
    modifyOrderQuantityInput: Locator;
    modifyOrderConfirmButton: Locator;
    modifyOrderCancelButton: Locator;

    constructor(page: Page) {
        super(page);
        this.orderBookButton = page.locator('.footer-btn:has(.iOrderList)');
        this.orderIndayTab = page.locator('.panel-tab', { hasText: /Lệnh trong ngày/ });
        this.orderHistoryTab = page.locator('.panel-tab', { hasText: /Lịch sử lệnh/ });
        this.conditionalOrderTab = page.locator('.panel-tab', { hasText: /Lệnh điều kiện/ });
        this.putThroughOrderTab = page.locator('.panel-tab', { hasText: /Sổ lệnh thoả thuận/ });
        this.reloadOrderBookButton = page.locator('.icon.iRefresh');
        this.expandOrderBookButton = page.locator('.icon.iZoomIn');
        this.closeOrderBookButton = page.locator('.icon.iClose');

        // Filter and Search Elements
        this.cancelAllOrderButton = page.locator('.btn-icon--sell2.cursor-pointer');
        this.searchInput = page.locator('.input-text-search .form-control');
        this.statusSelect = page.locator('.filter-control-select__control').nth(0);
        this.accountSelect = page.locator('.filter-control-select__control').nth(1);
        this.orderTypeSelect = page.locator('.filter-control-select__control').nth(2);

        // Table Elements
        this.totalOrder = page.locator('.card-panel-header__label');
        this.orderTable = page.locator('.table.table-bordered.tbl-list');
        this.tableHeaders = page.locator('.table-bordered.tbl-list thead th');
        this.tableRows = page.locator('.table-bordered.tbl-list tbody tr');

        // Table Column Locators
        this.checkboxHeaderAll = page.locator('.table-bordered.tbl-list thead th:nth-child(1) span]'); // Checkbox chọn tất cả
        this.checkboxColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(1)"]`); // Checkbox từng lệnh
        this.accountColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(2)`); // Tiểu khoản
        this.orderNoColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(3)`); // SHL
        this.originOrderNoColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(4)`); //SHL gốc
        this.timeColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(5)`); // Thời gian
        this.sideColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(6)`); // GD
        this.stockCodeColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(7)`); // Mã CK
        this.orderTypeColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(8)`); // Loại lệnh
        this.priceColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(9)`); // Giá
        this.quantityColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(10)`); // KL đặt
        this.matchedQuantityColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(11)`); // KL khớp
        this.remainingQuantityColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(12)`); // KL còn lại
        this.statusColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(13)`); // Trạng thái
        this.actionColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(14)`); // Thao tác
        this.expandOrderButton = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(15)`); // Mở rộng lệnh con khớp

        // Action Buttons in Table
        this.cancelOrderButton = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(14) .icon-cancel, .table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(14) .cancel-btn`);
        this.modifyOrderButton = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(14) .icon-edit, .table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(14) .modify-btn`);

        // Cancel All Orders Modal Elements
        this.cancelAllModal = page.locator('.wts-modal', { hasText: /Xác nhận hủy lệnh/ });
        this.cancelAllModalHeader = page.locator('.wts-modal__header', { hasText: /Xác nhận hủy lệnh/ });
        this.cancelAllModalTable = page.locator('.wts-modal .table.table-bordered.table-fix');
        this.cancelAllConfirmButton = page.locator('.wts-modal .btn.btn--primary');
        this.cancelAllModalCloseButton = page.locator('C');

        // Individual Order Cancel Modal Elements
        this.deleteOrderModal = page.locator('.delete-order');
        this.deleteOrderStockCode = page.locator('.delete-order-body__infor-value p').nth(0);
        this.deleteOrderType = page.locator('.delete-order-body__infor-value p').nth(1);
        this.deleteOrderNumber = page.locator('.delete-order-body__infor-value p').nth(2);
        this.deleteOrderConfirmButton = page.locator('.delete-order .btn-confirm');
        this.deleteOrderCancelButton = page.locator('.delete-order .btn-cancel');

        // Modify Order Modal Elements
        this.modifyOrderModal = page.locator('.confirm-order');
        this.modifyOrderNumber = page.locator('.confirm-order-body__infor-value p').nth(0);
        this.modifyOrderAccount = page.locator('.confirm-order-body__infor-value p').nth(1);
        this.modifyOrderType = page.locator('.confirm-order-body__detail .order-type .i');
        this.modifyOrderSymbol = page.locator('.confirm-order-body__detail .order-symbol');
        this.modifyOrderPriceInput = page.locator('.confirm-order-body__detail input[name="newPrice"]');
        this.modifyOrderQuantityInput = page.locator('.confirm-order-body__detail input[name="newVol"]');
        this.modifyOrderConfirmButton = page.locator('.confirm-order .btn-confirm');
        this.modifyOrderCancelButton = page.locator('.confirm-order .btn-cancel');
    }

    // Navigation Methods
    async openOrderBook(): Promise<void> {
        await this.orderBookButton.click();
        await this.page.waitForSelector('.card-panel-body', { timeout: 10000 });
    }

    async reloadOrderBook(): Promise<void> {
        await this.reloadOrderBookButton.click();
        await this.page.waitForTimeout(1000);
    }

    async expandOrderBook(): Promise<void> {
        await this.expandOrderBookButton.click();
        await this.page.waitForTimeout(1000);
    }

    async closeOrderBook(): Promise<void> {
        await this.closeOrderBookButton.click();
    }

    async switchToOrderInDayTab(): Promise<void> {
        await this.orderIndayTab.click();
        await this.page.waitForTimeout(1000);
    }

    async switchToOrderHistoryTab(): Promise<void> {
        await this.orderHistoryTab.click();
        await this.page.waitForTimeout(1000);
    }

    async switchToConditionalOrderTab(): Promise<void> {
        await this.conditionalOrderTab.click();
        await this.page.waitForTimeout(1000);
    }

    async switchToPutThroughOrderTab(): Promise<void> {
        await this.putThroughOrderTab.click();
        await this.page.waitForTimeout(1000);
    }

    // Filter and Search Methods
    async searchOrder(searchTerm: string): Promise<void> {
        await this.searchInput.fill(searchTerm);
        await this.page.waitForTimeout(1000);
    }

    async filterByStatus(status: string): Promise<void> {
        await this.statusSelect.click();
        await this.page.waitForSelector('.filter-control-select__menu-list', { state: 'visible' });
        await this.page.locator('.filter-control-select__option').filter({ hasText: status }).click();
        await this.page.waitForTimeout(1000);
    }

    async filterByAccount(account: string): Promise<void> {
        await this.accountSelect.click();
        await this.page.waitForSelector('.filter-control-select__menu-list', { state: 'visible' });
        await this.page.locator('.filter-control-select__option').filter({ hasText: account }).click();
        await this.page.waitForTimeout(1000);
    }

    async filterByOrderType(orderType: string): Promise<void> {
        await this.orderTypeSelect.click();
        await this.page.waitForSelector('.filter-control-select__menu-list', { state: 'visible' });
        await this.page.locator('.filter-control-select__option').filter({ hasText: orderType }).click();
        await this.page.waitForTimeout(1000);
    }

    async getTotalOrder(): Promise<string> {
        return await this.totalOrder.textContent() ?? '';
    }

    // Checkbox Methods
    async selectAllOrders(): Promise<void> {
        await this.checkboxHeaderAll.click();
        await this.page.waitForTimeout(500);
    }

    async selectOrderByIndex(rowIndex: number): Promise<void> {
        await this.checkboxColumn(rowIndex).click();
        await this.page.waitForTimeout(300);
    }

    // Table Data Methods
    async getOrderTableData(): Promise<any[]> {
        await this.orderTable.waitFor({ state: 'visible' });
        const rows = await this.tableRows.all();
        const orders = [];

        for (const row of rows) {
            const cells = await row.locator('td').all();
            if (cells.length > 0) {
                orders.push({
                    account: await cells[1]?.innerText() || '',
                    orderNo: await cells[2]?.innerText() || '',
                    originOrderNo: await cells[3]?.innerText() || '',
                    time: await cells[4]?.innerText() || '',
                    side: await cells[5]?.innerText() || '',
                    stockCode: await cells[6]?.innerText() || '',
                    orderType: await cells[7]?.innerText() || '',
                    price: await cells[8]?.innerText() || '',
                    quantity: await cells[9]?.innerText() || '',
                    matchedQuantity: await cells[10]?.innerText() || '',
                    remainingQuantity: await cells[11]?.innerText() || '',
                    status: await cells[12]?.innerText() || '',
                });
            }
        }
        return orders;
    }

    async getOrderDataByIndex(rowIndex: number) {
        return {
            account: await this.accountColumn(rowIndex).innerText(),
            orderNo: await this.orderNoColumn(rowIndex).innerText(),
            originOrderNo: await this.originOrderNoColumn(rowIndex).innerText(),
            time: await this.timeColumn(rowIndex).innerText(),
            side: await this.sideColumn(rowIndex).innerText(),
            stockCode: await this.stockCodeColumn(rowIndex).innerText(),
            orderType: await this.orderTypeColumn(rowIndex).innerText(),
            price: await this.priceColumn(rowIndex).innerText(),
            quantity: await this.quantityColumn(rowIndex).innerText(),
            matchedQuantity: await this.matchedQuantityColumn(rowIndex).innerText(),
            remainingQuantity: await this.remainingQuantityColumn(rowIndex).innerText(),
            status: await this.statusColumn(rowIndex).innerText(),
        };
    }

    async getOrderCount(): Promise<number> {
        return await this.tableRows.count();
    }

    // Order Action Methods
    // Cancel Order
    async cancelOrder(rowIndex: number = 0): Promise<void> {
        await this.cancelOrderButton(rowIndex).click();
        await this.deleteOrderModal.waitFor({ state: 'visible', timeout: 10000 });
        await this.deleteOrderConfirmButton.click();
        await this.deleteOrderModal.waitFor({ state: 'hidden', timeout: 10000 });
        await this.page.waitForTimeout(1000);
    }

    async getDeleteOrderModalInfo(rowIndex: number = 0): Promise<{ stockCode: string; orderType: string; orderNumber: string }> {
        await this.cancelOrderButton(rowIndex).click();
        await this.deleteOrderModal.waitFor({ state: 'visible', timeout: 10000 });
        return {
            stockCode: await this.deleteOrderStockCode.textContent() ?? '',
            orderType: await this.deleteOrderType.textContent() ?? '',
            orderNumber: await this.deleteOrderNumber.textContent() ?? ''
        };
    }

    async cancelOrderByStatus(targetStatus: string): Promise<void> {
        const allOrders = await this.getOrderTableData();
        const ordersToCancel = allOrders.filter(order => order.status.includes(targetStatus));

        console.log(`Found ${ordersToCancel.length} orders with status '${targetStatus}' to cancel`);

        for (let i = 0; i < ordersToCancel.length; i++) {
            try {
                const currentOrders = await this.getOrderTableData();
                const orderIndex = currentOrders.findIndex(order =>
                    order.orderNo === ordersToCancel[i].orderNo &&
                    order.stockCode === ordersToCancel[i].stockCode
                );

                if (orderIndex >= 0) {
                    await this.cancelOrder(orderIndex);
                    console.log(`Canceled order ${ordersToCancel[i].stockCode} - ${ordersToCancel[i].orderNo}`);
                } else {
                    console.log(`Order not found: ${ordersToCancel[i].stockCode} - ${ordersToCancel[i].orderNo}`);
                }

                await this.page.waitForTimeout(500);
            } catch (error) {
                console.log(`Failed to cancel order ${ordersToCancel[i].stockCode}: ${error}`);
            }
        }
    }

    async cancelOrderByOrderNumber(orderNumber: string): Promise<void> {
        const allOrders = await this.getOrderTableData();
        const orderIndex = allOrders.findIndex(order => order.orderNo === orderNumber);
        if (orderIndex >= 0) {
            await this.cancelOrder(orderIndex);
        }
    }

    async cancelActionCancelOrder(rowIndex: number = 0): Promise<void> {
        await this.cancelOrderButton(rowIndex).click();
        await this.deleteOrderModal.waitFor({ state: 'visible', timeout: 10000 });
        await this.deleteOrderCancelButton.click();
        await this.deleteOrderModal.waitFor({ state: 'hidden', timeout: 10000 });
        await this.page.waitForTimeout(1000);
    }

    // Modify Order Methods
    async openModifyOrderModal(rowIndex: number = 0): Promise<void> {
        await this.modifyOrderButton(rowIndex).click();
        await this.modifyOrderModal.waitFor({ state: 'visible', timeout: 10000 });
    }

    async getModifyOrderModalInfo(rowIndex: number = 0): Promise<{ orderNumber: string; account: string; orderType: string; symbol: string; currentPrice: string; currentQuantity: string }> {
        await this.openModifyOrderModal(rowIndex);
        return {
            orderNumber: await this.modifyOrderNumber.textContent() ?? '',
            account: await this.modifyOrderAccount.textContent() ?? '',
            orderType: await this.modifyOrderType.textContent() ?? '',
            symbol: await this.modifyOrderSymbol.textContent() ?? '',
            currentPrice: await this.modifyOrderPriceInput.inputValue(),
            currentQuantity: await this.modifyOrderQuantityInput.inputValue()
        };
    }

    async modifyOrderPrice(newPrice: string): Promise<void> {
        await this.modifyOrderPriceInput.clear();
        await this.modifyOrderPriceInput.fill(newPrice);
    }

    async modifyOrderQuantity(newQuantity: string): Promise<void> {
        await this.modifyOrderQuantityInput.clear();
        await this.modifyOrderQuantityInput.fill(newQuantity);
    }

    async modifyOrder(rowIndex: number = 0, newPrice?: string, newQuantity?: string): Promise<void> {
        await this.openModifyOrderModal(rowIndex);

        if (newPrice) {
            await this.modifyOrderPrice(newPrice);
        }

        if (newQuantity) {
            await this.modifyOrderQuantity(newQuantity);
        }

        await this.modifyOrderConfirmButton.click();
        await this.modifyOrderModal.waitFor({ state: 'hidden', timeout: 10000 });
        await this.page.waitForTimeout(1000);
    }

    async cancelModifyOrder(): Promise<void> {
        await this.modifyOrderCancelButton.click();
        await this.modifyOrderModal.waitFor({ state: 'hidden', timeout: 10000 });
        await this.page.waitForTimeout(1000);
    }

    async modifyOrderByOrderNumber(orderNumber: string, newPrice?: string, newQuantity?: string): Promise<void> {
        const allOrders = await this.getOrderTableData();
        const orderIndex = allOrders.findIndex(order => order.orderNo === orderNumber);

        if (orderIndex >= 0) {
            await this.modifyOrder(orderIndex, newPrice, newQuantity);
            console.log(`Modified order ${orderNumber} with new price: ${newPrice}, new quantity: ${newQuantity}`);
        } else {
            throw new Error(`Order with number ${orderNumber} not found`);
        }
    }

    async modifyOrderByStockCode(stockCode: string, newPrice?: string, newQuantity?: string): Promise<void> {
        const allOrders = await this.getOrderTableData();
        const orderIndex = allOrders.findIndex(order => order.stockCode.includes(stockCode));

        if (orderIndex >= 0) {
            await this.modifyOrder(orderIndex, newPrice, newQuantity);
            console.log(`Modified order for ${stockCode} with new price: ${newPrice}, new quantity: ${newQuantity}`);
        } else {
            throw new Error(`Order for stock ${stockCode} not found`);
        }
    }

    // Cancel All Orders
    async cancelAllOrders(): Promise<void> {
        await this.selectAllOrders();
        await this.cancelAllOrderButton.click();
        await this.cancelAllModal.waitFor({ state: 'visible', timeout: 10000 });
        await this.cancelAllConfirmButton.click();
        await this.cancelAllModal.waitFor({ state: 'hidden', timeout: 10000 });
        await this.page.waitForTimeout(2000);
    }

    async closeCancelAllModal(): Promise<void> {
        await this.cancelAllModalCloseButton.click();
        await this.cancelAllModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async cancelSelectedOrders(): Promise<void> {
        await this.cancelAllOrderButton.click();
        await this.cancelAllModal.waitFor({ state: 'visible', timeout: 10000 });
        await this.cancelAllConfirmButton.click();
        await this.cancelAllModal.waitFor({ state: 'hidden', timeout: 10000 });
        await this.page.waitForTimeout(2000);
    }

    async cancelOrdersBySelection(orderIndexes: number[]): Promise<void> {
        // Hủy các lệnh được chọn theo index
        for (const index of orderIndexes) {
            await this.selectOrderByIndex(index);
        }
        await this.cancelSelectedOrders();
    }

    async getCancelAllModalOrdersData(): Promise<any[]> {
        await this.cancelAllModal.waitFor({ state: 'visible', timeout: 10000 });
        const modalTable = this.cancelAllModalTable;
        const rows = await modalTable.locator('tbody tr').all();
        const orders = [];

        for (const row of rows) {
            const cells = await row.locator('td').all();
            if (cells.length > 0) {
                orders.push({
                    account: await cells[0]?.innerText() || '',
                    orderNo: await cells[1]?.innerText() || '',
                    stockCode: await cells[2]?.innerText() || '',
                    side: await cells[3]?.innerText() || '',
                    price: await cells[4]?.innerText() || '',
                    remainingQuantity: await cells[5]?.innerText() || '',
                });
            }
        }
        return orders;
    }

    async openCancelAllModalAndGetData(): Promise<any[]> {
        await this.selectAllOrders();
        await this.cancelAllOrderButton.click();
        return await this.getCancelAllModalOrdersData();
    }

    // Verification Methods
    async verifyOrderExists(stockCode: string): Promise<boolean> {
        const orders = await this.getOrderTableData();
        return orders.some(order => order.stockCode.includes(stockCode));
    }

    async verifyOrderStatus(stockCode: string, expectedStatus: string): Promise<boolean> {
        const orders = await this.getOrderTableData();
        const order = orders.find(order => order.stockCode.includes(stockCode));
        return order ? order.status.includes(expectedStatus) : false;
    }

    async verifyTableHasData(): Promise<boolean> {
        const count = await this.getOrderCount();
        return count > 0;
    }

    async verifyNoDataMessage(): Promise<boolean> {
        const noDataMessage = this.page.locator('table.table-bordered.tbl-list + p');
        const message = await noDataMessage.textContent();
        return message?.includes('Không có dữ liệu') ?? false;
    }

    async verifyOrderModified(stockCode: string, expectedPrice?: string, expectedQuantity?: string): Promise<boolean> {
        await this.page.waitForTimeout(2000);
        const orders = await this.getOrderTableData();
        const modifiedOrder = orders.find(order => order.stockCode.includes(stockCode));

        if (!modifiedOrder) return false;

        let priceMatch = true;
        let quantityMatch = true;

        if (expectedPrice) {
            priceMatch = modifiedOrder.price.includes(expectedPrice);
        }

        if (expectedQuantity) {
            quantityMatch = modifiedOrder.quantity.includes(expectedQuantity);
        }

        return priceMatch && quantityMatch;
    }

    // Additional Helper Methods for Better Testing Coverage

    // Check if orderbook is currently visible
    async isOrderBookVisible(): Promise<boolean> {
        try {
            return await this.orderTable.isVisible({ timeout: 3000 });
        } catch {
            return false;
        }
    }

    // Wait for orderbook to load completely
    async waitForOrderBookToLoad(timeout: number = 10000): Promise<void> {
        await this.orderTable.waitFor({ state: 'visible', timeout });
        await this.page.waitForTimeout(1000); // Additional wait for data to load
    }

    // Get all available order statuses from the table
    async getAllOrderStatuses(): Promise<string[]> {
        const orders = await this.getOrderTableData();
        const statuses = orders.map(order => order.status);
        return [...new Set(statuses)]; // Remove duplicates
    }

    // Get all available stock codes from the table
    async getAllStockCodes(): Promise<string[]> {
        const orders = await this.getOrderTableData();
        const stockCodes = orders.map(order => order.stockCode);
        return [...new Set(stockCodes)]; // Remove duplicates
    }

    // Check if specific tab is active
    async isTabActive(tabName: 'inday' | 'history' | 'conditional' | 'putthrough'): Promise<boolean> {
        let tab: Locator;
        switch (tabName) {
            case 'inday':
                tab = this.orderIndayTab;
                break;
            case 'history':
                tab = this.orderHistoryTab;
                break;
            case 'conditional':
                tab = this.conditionalOrderTab;
                break;
            case 'putthrough':
                tab = this.putThroughOrderTab;
                break;
        }

        try {
            const classes = await tab.getAttribute('class');
            return classes?.includes('active') || classes?.includes('selected') || false;
        } catch {
            return false;
        }
    }

    // Get orders by specific status
    async getOrdersByStatus(status: string): Promise<any[]> {
        const orders = await this.getOrderTableData();
        return orders.filter(order => order.status.includes(status));
    }

    // Get orders by specific stock code
    async getOrdersByStockCode(stockCode: string): Promise<any[]> {
        const orders = await this.getOrderTableData();
        return orders.filter(order => order.stockCode.includes(stockCode));
    }

    // Check if any action buttons are available for a specific order
    async hasActionButtons(rowIndex: number): Promise<{ hasCancel: boolean; hasModify: boolean }> {
        try {
            const hasCancel = await this.cancelOrderButton(rowIndex).isVisible({ timeout: 1000 });
            const hasModify = await this.modifyOrderButton(rowIndex).isVisible({ timeout: 1000 });
            return { hasCancel, hasModify };
        } catch {
            return { hasCancel: false, hasModify: false };
        }
    }

    // Get order by order number
    async getOrderByOrderNumber(orderNumber: string): Promise<any | null> {
        const orders = await this.getOrderTableData();
        return orders.find(order => order.orderNo === orderNumber) || null;
    }

    // Check if search functionality is working
    async verifySearchFunctionality(searchTerm: string): Promise<{ success: boolean; filteredCount: number; originalCount: number }> {
        const originalCount = await this.getOrderCount();

        await this.searchOrder(searchTerm);
        await this.page.waitForTimeout(1000);

        const filteredCount = await this.getOrderCount();

        // Clear search
        await this.searchOrder('');
        await this.page.waitForTimeout(1000);

        const clearedCount = await this.getOrderCount();

        return {
            success: clearedCount === originalCount,
            filteredCount,
            originalCount
        };
    }

    // Validate table structure
    async validateTableStructure(): Promise<{ hasHeaders: boolean; hasRows: boolean; columnCount: number }> {
        try {
            const headers = await this.tableHeaders.count();
            const rows = await this.tableRows.count();

            return {
                hasHeaders: headers > 0,
                hasRows: rows > 0,
                columnCount: headers
            };
        } catch {
            return {
                hasHeaders: false,
                hasRows: false,
                columnCount: 0
            };
        }
    }

    // Check if filters are available
    async checkAvailableFilters(): Promise<{ status: boolean; account: boolean; orderType: boolean }> {
        try {
            const statusAvailable = await this.statusSelect.isVisible({ timeout: 2000 });
            const accountAvailable = await this.accountSelect.isVisible({ timeout: 2000 });
            const orderTypeAvailable = await this.orderTypeSelect.isVisible({ timeout: 2000 });

            return {
                status: statusAvailable,
                account: accountAvailable,
                orderType: orderTypeAvailable
            };
        } catch {
            return {
                status: false,
                account: false,
                orderType: false
            };
        }
    }

    // Performance and monitoring methods

    // Measure order loading time
    async measureOrderLoadTime(): Promise<number> {
        const startTime = Date.now();
        await this.waitForOrderBookToLoad();
        const endTime = Date.now();
        return endTime - startTime;
    }

    // Check if pagination exists
    async hasPagination(): Promise<boolean> {
        try {
            const paginationElement = this.page.locator('.pagination, .page-navigation, .pager');
            return await paginationElement.isVisible({ timeout: 3000 });
        } catch {
            return false;
        }
    }

    // Get order summary statistics
    async getOrderSummaryStats(): Promise<{
        totalOrders: number;
        uniqueStocks: number;
        uniqueStatuses: number;
        avgOrderQuantity?: number;
        hasMatches: boolean;
    }> {
        const orders = await this.getOrderTableData();
        const stockCodes = new Set(orders.map(o => o.stockCode));
        const statuses = new Set(orders.map(o => o.status));

        // Calculate average quantity (if numeric)
        let avgQuantity: number | undefined;
        const quantities = orders
            .map(o => parseFloat(o.quantity.replace(/[,\s]/g, '')))
            .filter(q => !isNaN(q));

        if (quantities.length > 0) {
            avgQuantity = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;
        }

        // Check if any orders have matches
        const hasMatches = orders.some(o =>
            o.matchedQuantity &&
            parseFloat(o.matchedQuantity.replace(/[,\s]/g, '')) > 0
        );

        return {
            totalOrders: orders.length,
            uniqueStocks: stockCodes.size,
            uniqueStatuses: statuses.size,
            avgOrderQuantity: avgQuantity,
            hasMatches
        };
    }

    // Utility method to wait for specific order count
    async waitForOrderCount(expectedCount: number, timeout: number = 10000): Promise<boolean> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            try {
                const currentCount = await this.getOrderCount();
                if (currentCount === expectedCount) {
                    return true;
                }
                await this.page.waitForTimeout(500);
            } catch {
                await this.page.waitForTimeout(500);
            }
        }
        return false;
    }

    // Advanced validation methods

    // Validate order data consistency
    async validateOrderDataConsistency(): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        try {
            const orders = await this.getOrderTableData();

            orders.forEach((order, index) => {
                // Check required fields
                if (!order.stockCode || order.stockCode.trim() === '') {
                    errors.push(`Order ${index}: Missing stock code`);
                }

                if (!order.status || order.status.trim() === '') {
                    errors.push(`Order ${index}: Missing status`);
                }

                if (!order.time || order.time.trim() === '') {
                    errors.push(`Order ${index}: Missing time`);
                }

                // Validate quantity is numeric (if present)
                if (order.quantity) {
                    const qty = parseFloat(order.quantity.replace(/[,\s]/g, ''));
                    if (isNaN(qty) || qty <= 0) {
                        errors.push(`Order ${index}: Invalid quantity: ${order.quantity}`);
                    }
                }

                // Validate price is numeric (if present and not market order)
                if (order.price && !order.price.includes('MP') && !order.price.includes('ATO') && !order.price.includes('ATC')) {
                    const price = parseFloat(order.price.replace(/[,\s]/g, ''));
                    if (isNaN(price) || price <= 0) {
                        errors.push(`Order ${index}: Invalid price: ${order.price}`);
                    }
                }
            });
        } catch (error) {
            errors.push(`Failed to validate data: ${error}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Get performance metrics
    async getPerformanceMetrics(): Promise<{
        orderLoadTime: number;
        tableRenderTime: number;
        searchResponseTime: number;
    }> {
        // Measure order loading time
        const orderLoadTime = await this.measureOrderLoadTime();

        // Measure table render time
        const tableRenderStart = Date.now();
        await this.orderTable.waitFor({ state: 'visible' });
        const tableRenderTime = Date.now() - tableRenderStart;

        // Measure search response time
        const searchStart = Date.now();
        await this.searchOrder('TEST');
        await this.page.waitForTimeout(500);
        await this.searchOrder(''); // Clear search
        const searchResponseTime = Date.now() - searchStart;

        return {
            orderLoadTime,
            tableRenderTime,
            searchResponseTime
        };
    }

    // Comprehensive health check
    async performHealthCheck(): Promise<{
        overall: 'healthy' | 'warning' | 'error';
        checks: {
            tableStructure: boolean;
            dataIntegrity: boolean;
            filtersWorking: boolean;
            searchWorking: boolean;
            tabsWorking: boolean;
        };
        issues: string[];
    }> {
        const issues: string[] = [];
        const checks = {
            tableStructure: false,
            dataIntegrity: false,
            filtersWorking: false,
            searchWorking: false,
            tabsWorking: false
        };

        try {
            // Check table structure
            const tableStructure = await this.validateTableStructure();
            checks.tableStructure = tableStructure.hasHeaders && tableStructure.columnCount > 5;
            if (!checks.tableStructure) {
                issues.push('Table structure invalid');
            }

            // Check data integrity
            const dataValidation = await this.validateOrderDataConsistency();
            checks.dataIntegrity = dataValidation.isValid;
            if (!checks.dataIntegrity) {
                issues.push(...dataValidation.errors);
            }

            // Check filters
            const availableFilters = await this.checkAvailableFilters();
            checks.filtersWorking = Object.values(availableFilters).some(f => f);
            if (!checks.filtersWorking) {
                issues.push('No filters available');
            }

            // Check search
            try {
                await this.verifySearchFunctionality('TEST');
                checks.searchWorking = true;
            } catch {
                checks.searchWorking = false;
                issues.push('Search functionality not working');
            }

            // Check tabs
            try {
                await this.switchToOrderHistoryTab();
                await this.switchToOrderInDayTab();
                checks.tabsWorking = true;
            } catch {
                checks.tabsWorking = false;
                issues.push('Tab switching not working');
            }

        } catch (error) {
            issues.push(`Health check failed: ${error}`);
        }

        const healthyChecks = Object.values(checks).filter(c => c).length;
        const totalChecks = Object.values(checks).length;

        let overall: 'healthy' | 'warning' | 'error';
        if (healthyChecks === totalChecks) {
            overall = 'healthy';
        } else if (healthyChecks >= totalChecks * 0.6) {
            overall = 'warning';
        } else {
            overall = 'error';
        }

        return {
            overall,
            checks,
            issues
        };
    }
}

export default OrderBook;