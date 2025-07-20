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
                    account: await cells[0]?.innerText() || '',
                    stockCode: await cells[5]?.innerText() || '',
                    time: await cells[3]?.innerText() || '',
                    transactionType: await cells[4]?.innerText() || '',
                    price: await cells[7]?.innerText() || '',
                    quantity: await cells[8]?.innerText() || '',
                    matchedQuantity: await cells[9]?.innerText() || '',
                    remainingQuantity: await cells[10]?.innerText() || '',
                    status: await cells[11]?.innerText() || '',
                });
            }
        }
        return orders;
    }

    async getOrderDataByIndex(rowIndex: number) {
        return {
            account: await this.accountColumn(rowIndex).innerText(),
            stockCode: await this.stockCodeColumn(rowIndex).innerText(),
            time: await this.timeColumn(rowIndex).innerText(),
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
    async cancelOrder(rowIndex: number = 0): Promise<void> {
        const cancelButton = this.tableRows.nth(rowIndex).locator('.icon-cancel, .cancel-btn');
        await cancelButton.click();
        await this.page.waitForTimeout(1000);
    }

    async modifyOrder(rowIndex: number = 0): Promise<void> {
        const modifyButton = this.tableRows.nth(rowIndex).locator('.icon-edit, .modify-btn');
        await modifyButton.click();
        await this.page.waitForTimeout(1000);
    }

    async cancelAllOrders(): Promise<void> {
        await this.cancelAllOrderButton.click();
        // Wait for confirmation dialog
        await this.page.waitForTimeout(2000);
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
        const noDataMessage = this.page.locator('.no-data, .empty-state');
        return await noDataMessage.isVisible();
    }
}

export default OrderBook;