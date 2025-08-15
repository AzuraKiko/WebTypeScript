import { Page, Locator, expect } from '@playwright/test';
import BasePage from './BasePage';

// Interface definitions for better type safety
interface PortfolioRowData {
    stockCode: string;
    transaction: string;
    quantity: string;
    avgPrice: string;
    currentPrice: string;
    percentage: string;
}

interface PortfolioRowDataWithIndex extends PortfolioRowData {
    rowIndex: number;
}

interface PortfolioTotalData {
    totalAmount: string;
    totalPercentage: string;
}

interface PortfolioStatistics {
    totalItems: number;
    totalValue: number;
    totalPercentageChange: number;
    positiveStocks: number;
    negativeStocks: number;
    neutralStocks: number;
}

interface TestCase {
    value: string;
    expected: boolean;
    description: string;
}

class PortfolioPage extends BasePage {
    // Portfolio Elements
    portfolioTab!: Locator;
    portfolioTable!: Locator;
    portfolioTableHeaders!: Locator;
    portfolioTableRows!: Locator;
    portfolioTableHeaderRow!: Locator;
    portfolioTableBody!: Locator;
    portfolioTableTotalRow!: Locator;
    portfolioTableScrollContainer!: Locator;
    portfolioTableToggleLeft!: Locator;
    portfolioTableToggleRight!: Locator;

    // Message Elements
    titleMessage!: Locator;
    descriptionMessage!: Locator;

    // Constants
    private static readonly MAX_SCROLL_ATTEMPTS = 50;
    private static readonly SCROLL_TIMEOUT = 1000;
    private static readonly DEFAULT_TIMEOUT = 2000;
    private static readonly EXPECTED_HEADERS = ['Mã CK', 'GD', 'KL', 'Giá TB', 'Giá TT', '%'];
    private static readonly EXTENDED_EXPECTED_HEADERS = ['Mã CK', 'GD', 'KL', 'Giá TB', 'Giá TT', '%', 'Giá TT', 'Lãi/lỗ'];

    constructor(page: Page) {
        super(page);
        this.initializeLocators(page);
    }

    /**
     * Initialize all locators in one place
     */
    private initializeLocators(page: Page): void {
        // Portfolio Elements
        this.portfolioTab = page.locator('.asset-panel .card-panel-header__title:nth-child(2)');
        this.portfolioTable = page.locator('.card-panel-body.position-relative');
        this.portfolioTableHeaderRow = page.locator('.card-panel-body .table thead tr');
        this.portfolioTableHeaders = page.locator('.card-panel-body .table thead tr th');
        this.portfolioTableRows = page.locator('.card-panel-body .table tbody tr');
        this.portfolioTableBody = page.locator('.card-panel-body .scrollbar-container .table tbody');
        this.portfolioTableTotalRow = page.locator('.card-panel-body .table.position-absolute tbody tr');
        this.portfolioTableScrollContainer = page.locator('.card-panel-body .scrollbar-container');
        this.portfolioTableToggleLeft = page.locator('.tbl-toggle-left.toggle-color--light3');
        this.portfolioTableToggleRight = page.locator('.tbl-toggle-right.toggle-color--light3');

        // Message Elements
        this.titleMessage = page.locator('.toast-content .toast-title');
        this.descriptionMessage = page.locator('.toast-content .toast-description');
    }

    // =================== NAVIGATION METHODS ===================

    /**
     * Navigate to Portfolio tab
     */
    async navigateToPortfolio(): Promise<void> {
        await this.portfolioTab.click();
        await this.page.waitForTimeout(PortfolioPage.DEFAULT_TIMEOUT);
    }

    // =================== DATA RETRIEVAL METHODS ===================

    /**
     * Get Portfolio table headers
     */
    async getPortfolioTableHeaders(): Promise<string[]> {
        await this.portfolioTableHeaders.waitFor({ state: 'visible' });
        const headers = await this.portfolioTableHeaders.allTextContents();
        return headers.map((header: string) => header.trim());
    }

    /**
     * Get Portfolio table data for a specific row
     */
    async getPortfolioRowData(rowIndex: number): Promise<PortfolioRowData> {
        const row = this.portfolioTableRows.nth(rowIndex);
        await row.waitFor({ state: 'visible' });

        const stockCode = await row.locator('td:nth-child(1)').textContent() || '';
        const transaction = await row.locator('td:nth-child(2)').textContent() || '';
        const quantity = await row.locator('td:nth-child(3)').textContent() || '';
        const avgPrice = await row.locator('td:nth-child(4)').textContent() || '';
        const currentPrice = await row.locator('td:nth-child(5)').textContent() || '';
        const percentage = await row.locator('td:nth-child(6)').textContent() || '';

        return {
            stockCode: stockCode.trim(),
            transaction: transaction.trim(),
            quantity: quantity.trim(),
            avgPrice: avgPrice.trim(),
            currentPrice: currentPrice.trim(),
            percentage: percentage.trim()
        };
    }

    /**
     * Get all Portfolio table data (with auto-scrolling to load all data)
     */
    async getAllPortfolioData(autoScroll: boolean = true): Promise<PortfolioRowData[]> {
        await this.portfolioTableRows.first().waitFor({ state: 'visible' });

        if (autoScroll) {
            await this.loadAllPortfolioData();
        }

        const rowCount = await this.portfolioTableRows.count();
        const allData: PortfolioRowData[] = [];

        for (let i = 0; i < rowCount; i++) {
            const rowData = await this.getPortfolioRowData(i);
            allData.push(rowData);
        }

        return allData;
    }

    /**
     * Get Portfolio table data with scrolling and collecting unique entries
     */
    async getAllPortfolioDataWithScrolling(): Promise<PortfolioRowData[]> {
        await this.portfolioTableRows.first().waitFor({ state: 'visible' });
        await this.scrollPortfolioTableToTop();

        const allData: Map<string, PortfolioRowData> = new Map();
        let canScrollMore = true;
        let scrollAttempts = 0;

        while (canScrollMore && scrollAttempts < PortfolioPage.MAX_SCROLL_ATTEMPTS) {
            const rowCount = await this.portfolioTableRows.count();

            for (let i = 0; i < rowCount; i++) {
                try {
                    const rowData = await this.getPortfolioRowData(i);
                    if (rowData.stockCode) {
                        allData.set(rowData.stockCode, rowData);
                    }
                } catch (error) {
                    continue;
                }
            }

            canScrollMore = await this.canScrollPortfolioTableDown();
            if (canScrollMore) {
                const scrolled = await this.scrollPortfolioTablePageDown();
                if (!scrolled) break;
                await this.page.waitForTimeout(PortfolioPage.SCROLL_TIMEOUT);
            }

            scrollAttempts++;
        }

        return Array.from(allData.values());
    }

    /**
     * Get Portfolio table total row data
     */
    async getPortfolioTotalData(): Promise<PortfolioTotalData> {
        await this.portfolioTableTotalRow.waitFor({ state: 'visible' });

        const totalAmountElement = this.portfolioTableTotalRow.locator('.position-absolute.fw-500.text--light');
        const totalPercentageElement = this.portfolioTableTotalRow.locator('td:nth-child(6)');

        const totalAmount = await totalAmountElement.textContent() || '';
        const totalPercentage = await totalPercentageElement.textContent() || '';

        return {
            totalAmount: totalAmount.trim(),
            totalPercentage: totalPercentage.trim()
        };
    }

    /**
     * Get total count of Portfolio items (with scrolling)
     */
    async getPortfolioItemCount(withScrolling: boolean = true): Promise<number> {
        if (!withScrolling) {
            try {
                await this.portfolioTableRows.first().waitFor({ state: 'visible' });
                return await this.portfolioTableRows.count();
            } catch (error) {
                return 0;
            }
        }

        const allData = await this.getAllPortfolioDataWithScrolling();
        return allData.length;
    }

    // =================== SEARCH AND FIND METHODS ===================

    /**
     * Find Portfolio row by stock code (returns row data if found)
     */
    async findPortfolioRowByStockCode(stockCode: string): Promise<PortfolioRowDataWithIndex | null> {
        await this.portfolioTableRows.first().waitFor({ state: 'visible' });
        await this.scrollPortfolioTableToTop();

        let canScrollMore = true;
        let scrollAttempts = 0;

        while (canScrollMore && scrollAttempts < PortfolioPage.MAX_SCROLL_ATTEMPTS) {
            const rowCount = await this.portfolioTableRows.count();

            for (let i = 0; i < rowCount; i++) {
                try {
                    const rowData = await this.getPortfolioRowData(i);
                    if (rowData.stockCode === stockCode) {
                        return { ...rowData, rowIndex: i };
                    }
                } catch (error) {
                    continue;
                }
            }

            canScrollMore = await this.canScrollPortfolioTableDown();
            if (canScrollMore) {
                const scrolled = await this.scrollPortfolioTablePageDown();
                if (!scrolled) break;
                await this.page.waitForTimeout(PortfolioPage.SCROLL_TIMEOUT);
            }

            scrollAttempts++;
        }

        return null;
    }

    // =================== INTERACTION METHODS ===================

    /**
     * Click on a specific Portfolio table row
     */
    async clickPortfolioRow(rowIndex: number): Promise<void> {
        const row = this.portfolioTableRows.nth(rowIndex);
        await row.waitFor({ state: 'visible' });
        await row.click();
    }

    /**
     * Click on a Portfolio row by stock code (with scrolling search)
     */
    async clickPortfolioRowByStockCode(stockCode: string, searchWithScroll: boolean = true): Promise<void> {
        if (!searchWithScroll) {
            const rows = this.portfolioTableRows;
            const rowCount = await rows.count();

            for (let i = 0; i < rowCount; i++) {
                const row = rows.nth(i);
                const cellStockCode = await row.locator('td:nth-child(1)').textContent();
                if (cellStockCode?.trim() === stockCode) {
                    await row.click();
                    return;
                }
            }
            throw new Error(`Stock code ${stockCode} not found in portfolio table`);
        }

        await this.portfolioTableRows.first().waitFor({ state: 'visible' });
        await this.scrollPortfolioTableToTop();

        let found = false;
        let canScrollMore = true;
        let scrollAttempts = 0;

        while (!found && canScrollMore && scrollAttempts < PortfolioPage.MAX_SCROLL_ATTEMPTS) {
            const rowCount = await this.portfolioTableRows.count();

            for (let i = 0; i < rowCount; i++) {
                try {
                    const row = this.portfolioTableRows.nth(i);
                    const cellStockCode = await row.locator('td:nth-child(1)').textContent();
                    if (cellStockCode?.trim() === stockCode) {
                        await row.click();
                        found = true;
                        return;
                    }
                } catch (error) {
                    continue;
                }
            }

            canScrollMore = await this.canScrollPortfolioTableDown();
            if (canScrollMore) {
                const scrolled = await this.scrollPortfolioTablePageDown();
                if (!scrolled) break;
                await this.page.waitForTimeout(PortfolioPage.SCROLL_TIMEOUT);
            }

            scrollAttempts++;
        }

        if (!found) {
            throw new Error(`Stock code ${stockCode} not found in portfolio table after scrolling`);
        }
    }

    /**
     * Toggle Portfolio table percentage column view
     */
    async togglePortfolioPercentageView(direction: 'left' | 'right'): Promise<void> {
        const toggleButton = direction === 'left' ? this.portfolioTableToggleLeft : this.portfolioTableToggleRight;
        await toggleButton.waitFor({ state: 'visible' });
        await toggleButton.click();
        await this.page.waitForTimeout(PortfolioPage.SCROLL_TIMEOUT);
    }

    // =================== SCROLLING METHODS ===================

    /**
     * Scroll Portfolio table
     */
    async scrollPortfolioTable(direction: 'up' | 'down' | 'left' | 'right', amount: number = 100): Promise<void> {
        await this.portfolioTableScrollContainer.waitFor({ state: 'visible' });

        const scrollOptions = {
            up: { deltaY: -amount },
            down: { deltaY: amount },
            left: { deltaX: -amount },
            right: { deltaX: amount }
        };

        await this.portfolioTableScrollContainer.hover();
        const option = scrollOptions[direction];
        const deltaX = 'deltaX' in option ? option.deltaX : 0;
        const deltaY = 'deltaY' in option ? option.deltaY : 0;
        await this.page.mouse.wheel(deltaX, deltaY);
        await this.page.waitForTimeout(500);
    }

    /**
     * Scroll to top of Portfolio table
     */
    async scrollPortfolioTableToTop(): Promise<void> {
        await this.portfolioTableScrollContainer.waitFor({ state: 'visible' });
        await this.portfolioTableScrollContainer.hover();
        await this.page.keyboard.press('Home');
        await this.page.waitForTimeout(PortfolioPage.SCROLL_TIMEOUT);
    }

    /**
     * Scroll to bottom of Portfolio table
     */
    async scrollPortfolioTableToBottom(): Promise<void> {
        await this.portfolioTableScrollContainer.waitFor({ state: 'visible' });
        await this.portfolioTableScrollContainer.hover();
        await this.page.keyboard.press('End');
        await this.page.waitForTimeout(PortfolioPage.SCROLL_TIMEOUT);
    }

    /**
     * Check if Portfolio table can be scrolled down (has more data)
     */
    async canScrollPortfolioTableDown(): Promise<boolean> {
        await this.portfolioTableScrollContainer.waitFor({ state: 'visible' });

        const scrollInfo = await this.portfolioTableScrollContainer.evaluate((element) => {
            return {
                scrollTop: element.scrollTop,
                scrollHeight: element.scrollHeight,
                clientHeight: element.clientHeight
            };
        });

        return scrollInfo.scrollTop < (scrollInfo.scrollHeight - scrollInfo.clientHeight - 10);
    }

    /**
     * Scroll down one page in Portfolio table and wait for new content
     */
    async scrollPortfolioTablePageDown(): Promise<boolean> {
        await this.portfolioTableScrollContainer.waitFor({ state: 'visible' });

        const beforeScroll = await this.portfolioTableScrollContainer.evaluate((element) => element.scrollTop);

        await this.portfolioTableScrollContainer.hover();
        await this.page.keyboard.press('PageDown');
        await this.page.waitForTimeout(PortfolioPage.SCROLL_TIMEOUT);

        const afterScroll = await this.portfolioTableScrollContainer.evaluate((element) => element.scrollTop);

        return afterScroll > beforeScroll;
    }

    /**
     * Auto-scroll through entire Portfolio table to load all data
     */
    async loadAllPortfolioData(): Promise<void> {
        await this.portfolioTableScrollContainer.waitFor({ state: 'visible' });
        await this.scrollPortfolioTableToTop();

        let canScrollMore = true;
        let scrollAttempts = 0;

        while (canScrollMore && scrollAttempts < PortfolioPage.MAX_SCROLL_ATTEMPTS) {
            canScrollMore = await this.canScrollPortfolioTableDown();

            if (canScrollMore) {
                const scrolled = await this.scrollPortfolioTablePageDown();
                if (!scrolled) break;
                await this.page.waitForTimeout(500);
            }

            scrollAttempts++;
        }

        await this.scrollPortfolioTableToTop();
    }

    // =================== VALIDATION METHODS ===================

    /**
     * Validate Portfolio table structure and headers
     */
    async validatePortfolioTableStructure(): Promise<boolean> {
        try {
            await this.portfolioTable.waitFor({ state: 'visible', timeout: 5000 });

            const headers = await this.getPortfolioTableHeaders();
            if (headers.length !== PortfolioPage.EXPECTED_HEADERS.length) {
                console.log(`Expected ${PortfolioPage.EXPECTED_HEADERS.length} headers, found ${headers.length}`);
                return false;
            }

            for (let i = 0; i < PortfolioPage.EXPECTED_HEADERS.length; i++) {
                if (!headers[i].includes(PortfolioPage.EXPECTED_HEADERS[i])) {
                    console.log(`Header mismatch at index ${i}: expected "${PortfolioPage.EXPECTED_HEADERS[i]}", found "${headers[i]}"`);
                    return false;
                }
            }

            await this.portfolioTableToggleLeft.waitFor({ state: 'visible' });
            await this.portfolioTableToggleRight.waitFor({ state: 'visible' });

            await this.portfolioTableToggleRight.click();
            await this.page.waitForTimeout(PortfolioPage.SCROLL_TIMEOUT);

            const newHeaders = await this.getPortfolioTableHeaders();
            if (newHeaders.length !== PortfolioPage.EXTENDED_EXPECTED_HEADERS.length) {
                console.log(`Expected ${PortfolioPage.EXTENDED_EXPECTED_HEADERS.length} headers, found ${newHeaders.length}`);
                return false;
            }

            for (let i = 0; i < PortfolioPage.EXTENDED_EXPECTED_HEADERS.length; i++) {
                if (!newHeaders[i].includes(PortfolioPage.EXTENDED_EXPECTED_HEADERS[i])) {
                    console.log(`Header mismatch at index ${i}: expected "${PortfolioPage.EXTENDED_EXPECTED_HEADERS[i]}", found "${newHeaders[i]}"`);
                    return false;
                }
            }

            await this.portfolioTableToggleRight.click();
            return true;
        } catch (error) {
            console.log(`Portfolio table validation failed: ${error}`);
            return false;
        }
    }

    /**
     * Validate Portfolio row data format
     */
    async validatePortfolioRowDataFormat(rowIndex: number): Promise<boolean> {
        try {
            const rowData = await this.getPortfolioRowData(rowIndex);

            if (!this.validateStockCodeFormat(rowData.stockCode)) return false;
            if (!this.validateNumberFormat(rowData.quantity, 'quantity')) return false;
            if (!this.validateNumberFormat(rowData.avgPrice, 'average price')) return false;
            if (!this.validateNumberFormat(rowData.currentPrice, 'current price')) return false;
            if (!this.validatePercentageFormat(rowData.percentage)) return false;

            // Check extended fields
            await this.portfolioTableToggleRight.click();
            await this.page.waitForTimeout(PortfolioPage.SCROLL_TIMEOUT);

            const painLoss = await this.portfolioTableRows.nth(rowIndex).locator('td:nth-child(7)').textContent();
            if (painLoss && painLoss.trim() !== '') {
                const painLossPattern = /^-?(\d{1,3}(,\d{3})*(\.\d+)?|\d+(\.\d+)?)$/;
                if (!painLossPattern.test(painLoss.trim())) {
                    console.log(`Invalid Pain/Loss format: ${painLoss}`);
                    await this.portfolioTableToggleRight.click();
                    return false;
                }
            }

            await this.portfolioTableToggleRight.click();
            return true;
        } catch (error) {
            console.log(`Portfolio row data validation failed: ${error}`);
            return false;
        }
    }

    /**
     * Validate all Portfolio table data
     */
    async validateAllPortfolioData(): Promise<boolean> {
        try {
            const rowCount = await this.portfolioTableRows.count();

            if (rowCount === 0) {
                console.log('No portfolio data found');
                return false;
            }

            for (let i = 0; i < rowCount; i++) {
                const isValid = await this.validatePortfolioRowDataFormat(i);
                if (!isValid) {
                    console.log(`Portfolio row ${i} validation failed`);
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.log(`Portfolio data validation failed: ${error}`);
            return false;
        }
    }

    /**
     * Verify Portfolio table total calculation and format
     */
    async verifyPortfolioTotalCalculation(): Promise<boolean> {
        try {
            const allData = await this.getAllPortfolioData();
            const totalData = await this.getPortfolioTotalData();

            if (!this.validateNumberFormat(totalData.totalAmount, 'total amount')) return false;
            if (!this.validatePercentageFormat(totalData.totalPercentage)) return false;

            let expectedTotal = 0;
            for (const row of allData) {
                if (!this.validateNumberFormat(row.quantity, `quantity for ${row.stockCode}`)) return false;
                if (!this.validateNumberFormat(row.currentPrice, `current price for ${row.stockCode}`)) return false;

                const quantity = this.parseNumberWithCommas(row.quantity);
                const currentPrice = this.parseNumberWithCommas(row.currentPrice);
                expectedTotal += quantity * currentPrice;
            }

            const actualTotal = this.parseNumberWithCommas(totalData.totalAmount);
            const difference = Math.abs(expectedTotal - actualTotal);
            const tolerance = Math.max(expectedTotal * 0.01, 1);

            if (difference > tolerance) {
                console.log(`Total calculation mismatch: expected ${expectedTotal}, actual ${actualTotal}, difference ${difference}`);
                return false;
            }

            return true;
        } catch (error) {
            console.log(`Portfolio total calculation verification failed: ${error}`);
            return false;
        }
    }

    // =================== STATISTICS AND ANALYTICS METHODS ===================

    /**
     * Get Portfolio table statistics
     */
    async getPortfolioStatistics(): Promise<PortfolioStatistics> {
        const allData = await this.getAllPortfolioDataWithScrolling();
        const totalData = await this.getPortfolioTotalData();

        let totalValue = 0;
        let positiveStocks = 0;
        let negativeStocks = 0;
        let neutralStocks = 0;

        for (const item of allData) {
            if (!this.validateNumberFormat(item.quantity, `quantity for ${item.stockCode}`) ||
                !this.validateNumberFormat(item.currentPrice, `current price for ${item.stockCode}`)) {
                console.log(`Skipping invalid data for ${item.stockCode}`);
                continue;
            }

            const quantity = this.parseNumberWithCommas(item.quantity);
            const currentPrice = this.parseNumberWithCommas(item.currentPrice);
            totalValue += quantity * currentPrice;

            if (!this.validatePercentageFormat(item.percentage)) continue;

            const percentageValue = item.percentage.replace('%', '');
            const percentage = this.parseNumberWithCommas(percentageValue);
            if (percentage > 0) {
                positiveStocks++;
            } else if (percentage < 0) {
                negativeStocks++;
            } else {
                neutralStocks++;
            }
        }

        const totalPercentageValue = totalData.totalPercentage.replace('%', '');
        const totalPercentageChange = this.parseNumberWithCommas(totalPercentageValue);

        return {
            totalItems: allData.length,
            totalValue,
            totalPercentageChange,
            positiveStocks,
            negativeStocks,
            neutralStocks
        };
    }

    // =================== UTILITY METHODS ===================

    /**
     * Validate stock code format (3 uppercase letters)
     */
    private validateStockCodeFormat(stockCode: string): boolean {
        const stockCodePattern = /^[A-Z]{3}$/;
        if (!stockCodePattern.test(stockCode)) {
            console.log(`Invalid stock code format: ${stockCode}`);
            return false;
        }
        return true;
    }

    /**
     * Validate percentage format
     */
    private validatePercentageFormat(percentage: string): boolean {
        if (!percentage.endsWith('%')) {
            console.log(`Invalid percentage format: ${percentage} (missing %)`);
            return false;
        }

        const percentageValue = percentage.replace('%', '');
        const percentagePattern = /^-?(\d{1,3}(,\d{3})*(\.\d+)?|\d+(\.\d+)?)$/;
        if (!percentagePattern.test(percentageValue)) {
            console.log(`Invalid percentage number format: ${percentage}`);
            return false;
        }
        return true;
    }

    /**
     * Validate number format with comma thousands separator
     */
    private validateNumberFormat(value: string, fieldName: string): boolean {
        const numberWithoutCommas = value.replace(/,/g, '');
        const parsedNumber = parseFloat(numberWithoutCommas);

        if (isNaN(parsedNumber) || parsedNumber < 0) {
            console.log(`Invalid ${fieldName} format: ${value} (not a valid number)`);
            return false;
        }

        const commaFormatPattern = /^(\d{1,3}(,\d{3})*(\.\d+)?|\d+(\.\d+)?)$/;
        if (!commaFormatPattern.test(value)) {
            console.log(`Invalid ${fieldName} format: ${value} (improper comma formatting)`);
            return false;
        }

        return true;
    }

    /**
     * Format number with comma thousands separator
     */
    private formatNumberWithCommas(value: number): string {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        });
    }

    /**
     * Parse number from string with comma format
     */
    private parseNumberWithCommas(value: string): number {
        return parseFloat(value.replace(/,/g, ''));
    }

    // =================== TESTING METHODS ===================

    /**
     * Test and validate various number formats
     */
    async testNumberFormats(): Promise<void> {
        const testCases: TestCase[] = [
            { value: '1,000', expected: true, description: 'Simple thousands' },
            { value: '1,000,000', expected: true, description: 'Millions' },
            { value: '100', expected: true, description: 'Simple number' },
            { value: '1,000.50', expected: true, description: 'Decimal with comma' },
            { value: '10,00', expected: false, description: 'Invalid comma placement' },
            { value: '1,00,000', expected: false, description: 'Invalid comma pattern' },
            { value: '1000000', expected: true, description: 'Large number without comma' },
            { value: 'abc', expected: false, description: 'Non-numeric' },
            { value: '', expected: false, description: 'Empty string' }
        ];

        console.log('Testing number format validation:');
        for (const testCase of testCases) {
            const result = this.validateNumberFormat(testCase.value, 'test');
            const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} - ${testCase.description}: "${testCase.value}" -> ${result}`);
        }
    }
}

export default PortfolioPage;