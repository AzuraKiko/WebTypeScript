import { Locator, Page } from '@playwright/test';
import BasePage from './BasePage';
import { TableUtils, FormUtils } from '../../helpers/uiUtils';

// Interface definitions for better type safety
interface OpenPositionData {
    contractCode: string;
    position: string;
    quantityOpen: string;
    longPending: string;
    shortPending: string;
    avgPrice: string;
    marketPrice: string;
    profitLossPercent: string;
    profitLoss: string;
}


type TabName = 'openPosition' | 'orderList' | 'history' | 'conditionalOrderList' | 'closedPosition' | 'PLReport' | 'Asset';

class PositionPage extends BasePage {
    // Constants
    private static readonly DEFAULT_TIMEOUT = 10000;
    private static readonly SHORT_TIMEOUT = 1000;
    private static readonly POLLING_INTERVAL = 500;

    // Navigation Elements
    positionButton!: Locator;
    openPositionTab!: Locator;
    orderListTab!: Locator;
    historyTab!: Locator;
    conditionalOrderListTab!: Locator;
    closedPositionTab!: Locator;
    PLReportTab!: Locator;
    AssetTab!: Locator;
    expandPositionButton!: Locator;
    closePositionButton!: Locator;
    closeAllPositionButton!: Locator;


    // Open Position Table Elements
    positionTable!: Locator;
    tableHeaders!: Locator;
    tableRows!: Locator;

    closeAllPositionModal!: Locator;
    closeAllPositionConfirmButton!: Locator;
    closeAllPositionModalCloseButton!: Locator;

    // Order List Table Elements

    constructor(page: Page) {
        super(page);
        this.initializeLocators(page);
    }

    /**
     * Initialize all locators in one place
     */
    private initializeLocators(page: Page): void {
        // Navigation Elements
        this.positionButton = page.locator('.footer-btn:has(.iOrderList)');
        this.openPositionTab = page.locator('.panel-tab', { hasText: /Vị thế mở/ });
        this.orderListTab = page.locator('.panel-tab', { hasText: /Sổ lệnh/ });
        this.historyTab = page.locator('.panel-tab', { hasText: /Lịch sử lệnh/ });
        this.conditionalOrderListTab = page.locator('.panel-tab', { hasText: /Sổ lệnh điều kiện/ });
        this.closedPositionTab = page.locator('.panel-tab', { hasText: /Vị thế đóng/ });
        this.PLReportTab = page.locator('.panel-tab', { hasText: /Báo cáo Lãi/ });
        this.AssetTab = page.locator('.panel-tab', { hasText: /Tài sản/ });
        this.expandPositionButton = page.locator('.panel-header .icon.iZoomOut');
        this.closePositionButton = page.locator('.panel-header .icon.iClose');
        this.closeAllPositionButton = page.locator('.btn--cancel.btn-icon');

        // Open Position Table Elements
        this.positionTable = page.locator('.derivative__postion');
        this.tableHeaders = page.locator('.derivative__postion thead th');
        this.tableRows = page.locator('.derivative__postion tbody tr');

        // Modal Elements
        this.initializeModalLocators(page);
    }

    /**
     * Initialize modal locators separately for better organization
     */
    private initializeModalLocators(page: Page): void {
        // Close All Position Modal
        this.closeAllPositionModal = page.locator('.wts-modal', { hasText: /Xác nhận đóng vị thế/ });
        this.closeAllPositionConfirmButton = page.locator('.wts-modal .btn.btn--primary');
        this.closeAllPositionModalCloseButton = page.locator('.wts-modal .btn-close');

    }

    // =================== DYNAMIC LOCATOR METHODS ===================

    /**
     * Get column locator for specific row
     */
    private getColumnOpenPositionLocator(rowIndex: number, columnIndex: number): Locator {
        return this.page.locator(`.table-bordered.tbl-list tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex})`);
    }
    private contractCodeColumn = (rowIndex: number): Locator => this.getColumnOpenPositionLocator(rowIndex, 1);
    private positionColumn = (rowIndex: number): Locator => this.getColumnOpenPositionLocator(rowIndex, 2);
    private quantityOpenColumn = (rowIndex: number): Locator => this.getColumnOpenPositionLocator(rowIndex, 3);
    private longPendingColumn = (rowIndex: number): Locator => this.getColumnOpenPositionLocator(rowIndex, 4);
    private shortPendingColumn = (rowIndex: number): Locator => this.getColumnOpenPositionLocator(rowIndex, 5);
    private avgPriceColumn = (rowIndex: number): Locator => this.getColumnOpenPositionLocator(rowIndex, 6);
    private marketPriceColumn = (rowIndex: number): Locator => this.getColumnOpenPositionLocator(rowIndex, 7);
    private profitLossPercentColumn = (rowIndex: number): Locator => this.getColumnOpenPositionLocator(rowIndex, 8);
    private profitLossColumn = (rowIndex: number): Locator => this.getColumnOpenPositionLocator(rowIndex, 9);

    /**
     * Get action button locators for specific row
     */
    private stopTakeProfitButton = (rowIndex: number): Locator =>
        this.page.locator(`.table tbody tr:nth-child(${rowIndex + 1}) .btn--authen`);

    private reversePositionButton = (rowIndex: number): Locator =>
        this.page.locator(`.table tbody tr:nth-child(${rowIndex + 1}) .btn--edit`);

    private closeOpenPositionButton = (rowIndex: number): Locator =>
        this.page.locator(`.table tbody tr:nth-child(${rowIndex + 1}) .btn--delete`);

    // =================== NAVIGATION METHODS ===================

    async openPositionPanel(): Promise<void> {
        await this.positionButton.click();
        await this.page.waitForSelector('.card-panel-body', { timeout: PositionPage.DEFAULT_TIMEOUT });
    }


    async expandPositionPanel(): Promise<void> {
        await this.expandPositionButton.click();
        await this.page.waitForTimeout(PositionPage.SHORT_TIMEOUT);
    }

    async closePositionPanel(): Promise<void> {
        await this.closePositionButton.click();
    }

    async switchToTab(tabName: TabName): Promise<void> {
        const tabMap = {
            openPosition: this.openPositionTab,
            orderList: this.orderListTab,
            history: this.historyTab,
            conditionalOrderList: this.conditionalOrderListTab,
            closedPosition: this.closedPositionTab,
            PLReport: this.PLReportTab,
            Asset: this.AssetTab
        };

        await tabMap[tabName].click();
        await this.page.waitForTimeout(PositionPage.SHORT_TIMEOUT);
    }

    // =================== DATA RETRIEVAL METHODS ===================


    async getOpenPositionTableHeader(): Promise<string[]> {
        return TableUtils.getTableHeaders(this.tableHeaders);
    }

    async getOpenPositionTableData(): Promise<OpenPositionData[]> {
        await this.positionTable.waitFor({ state: 'visible' });
        const rows = await this.tableRows.all();
        const openPositions: OpenPositionData[] = [];

        for (const row of rows) {
            const cells = await row.locator('td').all();
            if (cells.length > 0) {
                openPositions.push({
                    contractCode: await cells[1]?.innerText() || '',
                    position: await cells[2]?.innerText() || '',
                    quantityOpen: await cells[3]?.innerText() || '',
                    longPending: await cells[4]?.innerText() || '',
                    shortPending: await cells[5]?.innerText() || '',
                    avgPrice: await cells[6]?.innerText() || '',
                    marketPrice: await cells[8]?.innerText() || '',
                    profitLossPercent: await cells[9]?.innerText() || '',
                    profitLoss: await cells[10]?.innerText() || '',
                });
            }
        }
        return openPositions;
    }

    async getOpenPositionDataByIndex(rowIndex: number): Promise<OpenPositionData> {
        return {
            contractCode: await this.contractCodeColumn(rowIndex).innerText(),
            position: await this.positionColumn(rowIndex).innerText(),
            quantityOpen: await this.quantityOpenColumn(rowIndex).innerText(),
            longPending: await this.longPendingColumn(rowIndex).innerText(),
            shortPending: await this.shortPendingColumn(rowIndex).innerText(),
            avgPrice: await this.avgPriceColumn(rowIndex).innerText(),
            marketPrice: await this.marketPriceColumn(rowIndex).innerText(),
            profitLossPercent: await this.profitLossPercentColumn(rowIndex).innerText(),
            profitLoss: await this.profitLossColumn(rowIndex).innerText(),
        };
    }

    async getOpenPositionCount(): Promise<number> {
        return await this.tableRows.count();
    }

    // =================== ORDER ACTION METHODS ===================

    async stopTakeProfit(rowIndex: number = 0): Promise<void> {
        await this.stopTakeProfitButton(rowIndex).click();
        await this.page.waitForTimeout(PositionPage.SHORT_TIMEOUT);
    }

    async reversePosition(rowIndex: number = 0): Promise<void> {
        await this.reversePositionButton(rowIndex).click();
        await this.page.waitForTimeout(PositionPage.SHORT_TIMEOUT);
    }

    async closeOpenPosition(rowIndex: number = 0): Promise<void> {
        await this.closeOpenPositionButton(rowIndex).click();
        await this.page.waitForTimeout(PositionPage.SHORT_TIMEOUT);
    }


    // =================== CANCEL ALL ORDERS METHODS ===================

    async cancelAllOrders(): Promise<void> {
        await this.selectAllOrders();
        await this.cancelAllOrderButton.click();
        await this.cancelAllModal.waitFor({ state: 'visible', timeout: OrderBook.DEFAULT_TIMEOUT });
        await this.cancelAllConfirmButton.click();
        await this.cancelAllModal.waitFor({ state: 'hidden', timeout: OrderBook.DEFAULT_TIMEOUT });
        await this.page.waitForTimeout(2000);
    }

    async closeCancelAllModal(): Promise<void> {
        await this.cancelAllModalCloseButton.click();
        await this.cancelAllModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async cancelSelectedOrders(): Promise<void> {
        await this.cancelAllOrderButton.click();
        await this.cancelAllModal.waitFor({ state: 'visible', timeout: OrderBook.DEFAULT_TIMEOUT });
        await this.cancelAllConfirmButton.click();
        await this.cancelAllModal.waitFor({ state: 'hidden', timeout: OrderBook.DEFAULT_TIMEOUT });
        await this.page.waitForTimeout(2000);
    }

    async cancelOrdersBySelection(orderIndexes: number[]): Promise<void> {
        await this.selectOrdersByIndexes(orderIndexes);
        await this.cancelSelectedOrders();
    }

    async getCancelAllModalOrdersData(): Promise<OrderData[]> {
        await this.cancelAllModal.waitFor({ state: 'visible', timeout: OrderBook.DEFAULT_TIMEOUT });
        const modalTable = this.cancelAllModalTable;
        const rows = await modalTable.locator('tbody tr').all();
        const orders: OrderData[] = [];

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
                    // Fill empty fields for consistency
                    originOrderNo: '',
                    time: '',
                    orderType: '',
                    quantity: '',
                    matchedQuantity: '',
                    status: ''
                });
            }
        }
        return orders;
    }

    async openCancelAllModalAndGetData(): Promise<OrderData[]> {
        await this.selectAllOrders();
        await this.cancelAllOrderButton.click();
        return await this.getCancelAllModalOrdersData();
    }

    // =================== SEARCH AND FIND UTILITY METHODS ===================

    private async findOrderIndexByOrderNumber(orderNumber: string): Promise<number> {
        const allOrders = await this.getOrderTableData();
        return allOrders.findIndex(order => order.orderNo === orderNumber);
    }

    async getOrderByOrderNumber(orderNumber: string): Promise<OrderData | null> {
        const orders = await this.getOrderTableData();
        return orders.find(order => order.orderNo === orderNumber) || null;
    }

    async getOrdersByStatus(status: string): Promise<OrderData[]> {
        const orders = await this.getOrderTableData();
        return orders.filter(order => order.status.includes(status));
    }

    async getOrdersByStockCode(stockCode: string): Promise<OrderData[]> {
        const orders = await this.getOrderTableData();
        return orders.filter(order => order.stockCode.includes(stockCode));
    }

    async getAllOrderStatuses(): Promise<string[]> {
        const orders = await this.getOrderTableData();
        const statuses = orders.map(order => order.status);
        return [...new Set(statuses)];
    }

    async getAllStockCodes(): Promise<string[]> {
        const orders = await this.getOrderTableData();
        const stockCodes = orders.map(order => order.stockCode);
        return [...new Set(stockCodes)];
    }

    // =================== VERIFICATION METHODS ===================

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


}

export default PositionPage;