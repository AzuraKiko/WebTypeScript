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
        this.checkboxColumn = (rowIndex: number) => page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(1)`); // Chọn
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

    async getDeleteOrderModalInfo(): Promise<{ stockCode: string; orderType: string; orderNumber: string }> {
        await this.cancelOrderButton(0).click();
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

    async cancelAction(rowIndex: number = 0): Promise<void> {
        await this.cancelOrderButton(rowIndex).click();
        await this.deleteOrderModal.waitFor({ state: 'visible', timeout: 10000 });
        await this.deleteOrderCancelButton.click();
        await this.deleteOrderModal.waitFor({ state: 'hidden', timeout: 10000 });
        await this.page.waitForTimeout(1000);
    }

    // Modify Order
    async modifyOrder(rowIndex: number = 0): Promise<void> {
        await this.modifyOrderButton(rowIndex).click();
    }

    // Cancel All Orders
    async cancelAllOrders(): Promise<void> {
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

    async getCancelAllModalOrdersData(): Promise<any[]> {
        await this.cancelAllOrderButton.click();
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
}

export default OrderBook;