import { Page, Locator, expect } from '@playwright/test';
import BasePage from './BasePage';

class OrderBook extends BasePage {
    orderBookButton: Locator;
    orderIndayTab: Locator;
    orderHistoryTab: Locator;
    conditionalOrderTab: Locator;
    putThroughOrderTab: Locator;
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
    checkboxColumn: Locator;
    accountColumn: Locator;
    orderNoColumn: Locator;
    stockCodeColumn: Locator;
    timeColumn: Locator;
    transactionTypeColumn: Locator;
    priceColumn: Locator;
    quantityColumn: Locator;
    matchedQuantityColumn: Locator;
    remainingQuantityColumn: Locator;
    statusColumn: Locator;
    actionColumn: Locator;

    // Action Buttons in Table
    cancelOrderButton: Locator;
    modifyOrderButton: Locator;

    // Status Indicators
    pendingStatus: Locator;
    matchedStatus: Locator;
    cancelledStatus: Locator;

    constructor(page: Page) {
        super(page);
        this.orderBookButton = page.locator('.footer-btn:has(.iOrder)');
        this.orderIndayTab = page.locator('.panel-tab', { hasText: /Lệnh trong ngày/ });
        this.orderHistoryTab = page.locator('.panel-tab', { hasText: /Lịch sử lệnh/ });
        this.conditionalOrderTab = page.locator('.panel-tab', { hasText: /Lệnh điều kiện/ });
        this.putThroughOrderTab = page.locator('.panel-tab', { hasText: /Sổ lệnh thoả thuận/ });
        this.closeOrderBookButton = page.locator('.icon.iClose');

        // Filter and Search Elements
        this.cancelAllOrderButton = page.locator('.btn-icon--sell2.cursor-pointer');
        this.searchInput = page.locator('.input-text-search .form-control');
        this.statusSelect = page.locator('.filter-control-select__control').nth(0);
        this.accountSelect = page.locator('.filter-control-select__control').nth(1);
        this.orderTypeSelect = page.locator('.filter-control-select__control').nth(2);

        // Table Elements
        this.orderTable = page.locator('.table.table-bordered.tbl-list');
        this.tableHeaders = page.locator('.table-bordered.tbl-list thead th');
        this.tableRows = page.locator('.table-bordered.tbl-list tbody tr');
        this.totalOrder = page.locator('.card-panel-header__label');

        // Table Column Locators
        this.checkboxColumn = page.locator('.table-bordered.tbl-list tbody tr td:nth-child(1)'); // Chọn
        this.accountColumn = page.locator('.table-bordered.tbl-list tbody tr td:nth-child(2)'); // Tiểu khoản
        this.orderNoColumn = page.locator('.table-bordered.tbl-list tbody tr td:nth-child(3)'); // SHL

        this.stockCodeColumn = page.locator('.table-bordered.tbl-list tbody tr td:nth-child(6)'); // Mã CK
        this.timeColumn = page.locator('.table-bordered.tbl-list tbody tr td:nth-child(4)'); // Thời gian
        this.transactionTypeColumn = page.locator('.table-bordered.tbl-list tbody tr td:nth-child(5)'); // GD
        this.priceColumn = page.locator('.table-bordered.tbl-list tbody tr td:nth-child(8)'); // Giá
        this.quantityColumn = page.locator('.table-bordered.tbl-list tbody tr td:nth-child(9)'); // KL
        this.matchedQuantityColumn = page.locator('.table-bordered.tbl-list tbody tr td:nth-child(10)'); // KL khớp
        this.remainingQuantityColumn = page.locator('.table-bordered.tbl-list tbody tr td:nth-child(11)'); // KL còn lại
        this.statusColumn = page.locator('td:nth-child(12)'); // Trạng thái
        this.actionColumn = page.locator('td:nth-child(13)'); // Thao tác

        // Action Buttons in Table
        this.cancelOrderButton = page.locator('td:nth-child(13) .icon-cancel, td:nth-child(13) .cancel-btn');
        this.modifyOrderButton = page.locator('td:nth-child(13) .icon-edit, td:nth-child(13) .modify-btn');

        // Status Indicators
        this.pendingStatus = page.locator('.status-pending, .cho-khop');
        this.matchedStatus = page.locator('.status-matched, .da-khop');
        this.cancelledStatus = page.locator('.status-cancelled, .da-huy');
    }

    // Navigation Methods
    async openOrderBook(): Promise<void> {
        await this.orderBookButton.click();
        await this.page.waitForSelector('.asset-panel', { timeout: 10000 });
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

    // Filter and Search Methods
    async searchOrder(searchTerm: string): Promise<void> {
        await this.searchInput.fill(searchTerm);
        await this.page.waitForTimeout(1000);
    }

    async filterByStatus(status: string): Promise<void> {
        await this.statusSelect.click();
        await this.page.locator(`option:has-text("${status}")`).click();
        await this.page.waitForTimeout(1000);
    }

    async filterByAccount(account: string): Promise<void> {
        await this.accountSelect.click();
        await this.page.locator(`option:has-text("${account}")`).click();
        await this.page.waitForTimeout(1000);
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

    async getOrderCount(): Promise<number> {
        return await this.tableRows.count();
    }

    async getTotalOrderText(): Promise<string> {
        return await this.totalOrder.innerText();
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