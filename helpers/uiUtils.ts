import { Page, Locator } from '@playwright/test';

/**
 * Common UI interaction utilities for Playwright tests
 */

// Interface definitions
export interface ScrollOptions {
    direction: 'up' | 'down' | 'left' | 'right';
    amount?: number;
    timeout?: number;
}

export interface WaitOptions {
    timeout?: number;
    state?: 'visible' | 'hidden' | 'attached' | 'detached';
}

export interface RetryOptions {
    maxAttempts?: number;
    delay?: number;
    exponentialBackoff?: boolean;
}

export interface TableScrollResult {
    success: boolean;
    scrolled: boolean;
    endReached: boolean;
}

export interface HealthCheckOptions {
    checkVisibility?: boolean;
    checkInteractivity?: boolean;
    checkDataIntegrity?: boolean;
    timeout?: number;
}

/**
 * Scrolling utilities for tables and containers
 */
export class ScrollUtils {
    private static readonly DEFAULT_SCROLL_AMOUNT = 100;
    private static readonly DEFAULT_TIMEOUT = 1000;
    private static readonly MAX_SCROLL_ATTEMPTS = 50;

    /**
     * Scroll element in specified direction
     */
    static async scrollElement(
        page: Page,
        element: Locator,
        options: ScrollOptions
    ): Promise<void> {
        const { direction, amount = ScrollUtils.DEFAULT_SCROLL_AMOUNT } = options;

        await element.waitFor({ state: 'visible' });
        await element.hover();

        const scrollDeltas = {
            up: { deltaX: 0, deltaY: -amount },
            down: { deltaX: 0, deltaY: amount },
            left: { deltaX: -amount, deltaY: 0 },
            right: { deltaX: amount, deltaY: 0 }
        };

        const delta = scrollDeltas[direction];
        await page.mouse.wheel(delta.deltaX, delta.deltaY);
        await page.waitForTimeout(500);
    }

    /**
     * Scroll to top of element using keyboard shortcut
     */
    static async scrollToTop(page: Page, element: Locator): Promise<void> {
        await element.waitFor({ state: 'visible' });
        await element.hover();
        await page.keyboard.press('Home');
        await page.waitForTimeout(ScrollUtils.DEFAULT_TIMEOUT);
    }

    /**
     * Scroll to bottom of element using keyboard shortcut
     */
    static async scrollToBottom(page: Page, element: Locator): Promise<void> {
        await element.waitFor({ state: 'visible' });
        await element.hover();
        await page.keyboard.press('End');
        await page.waitForTimeout(ScrollUtils.DEFAULT_TIMEOUT);
    }

    /**
     * Check if element can be scrolled down
     */
    static async canScrollDown(element: Locator): Promise<boolean> {
        await element.waitFor({ state: 'visible' });

        const scrollInfo = await element.evaluate((el) => {
            return {
                scrollTop: el.scrollTop,
                scrollHeight: el.scrollHeight,
                clientHeight: el.clientHeight
            };
        });

        return scrollInfo.scrollTop < (scrollInfo.scrollHeight - scrollInfo.clientHeight - 10);
    }

    /**
     * Scroll down one page and check if scrolling occurred
     */
    static async scrollPageDown(page: Page, element: Locator): Promise<boolean> {
        await element.waitFor({ state: 'visible' });

        const beforeScroll = await element.evaluate((el) => el.scrollTop);
        await element.hover();
        await page.keyboard.press('PageDown');
        await page.waitForTimeout(ScrollUtils.DEFAULT_TIMEOUT);

        const afterScroll = await element.evaluate((el) => el.scrollTop);
        return afterScroll > beforeScroll;
    }

    /**
     * Auto-scroll through entire element to load all data
     */
    static async loadAllData(page: Page, element: Locator): Promise<void> {
        await ScrollUtils.scrollToTop(page, element);

        let canScrollMore = true;
        let scrollAttempts = 0;

        while (canScrollMore && scrollAttempts < ScrollUtils.MAX_SCROLL_ATTEMPTS) {
            canScrollMore = await ScrollUtils.canScrollDown(element);

            if (canScrollMore) {
                const scrolled = await ScrollUtils.scrollPageDown(page, element);
                if (!scrolled) break;
                await page.waitForTimeout(500);
            }

            scrollAttempts++;
        }

        await ScrollUtils.scrollToTop(page, element);
    }
}

/**
 * Wait and retry utilities
 */
export class WaitUtils {
    private static readonly DEFAULT_TIMEOUT = 10000;
    private static readonly DEFAULT_RETRY_DELAY = 500;
    private static readonly DEFAULT_MAX_ATTEMPTS = 3;

    /**
     * Wait for element with custom options
     */
    static async waitForElement(
        element: Locator,
        options: WaitOptions = {}
    ): Promise<void> {
        const { timeout = WaitUtils.DEFAULT_TIMEOUT, state = 'visible' } = options;
        await element.waitFor({ state, timeout });
    }

    /**
     * Wait for condition with retry mechanism
     */
    static async waitForCondition(
        conditionFn: () => Promise<boolean>,
        options: RetryOptions & WaitOptions = {}
    ): Promise<boolean> {
        const {
            maxAttempts = WaitUtils.DEFAULT_MAX_ATTEMPTS,
            delay = WaitUtils.DEFAULT_RETRY_DELAY,
            exponentialBackoff = false,
            timeout = WaitUtils.DEFAULT_TIMEOUT
        } = options;

        const startTime = Date.now();

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                if (Date.now() - startTime > timeout) {
                    return false;
                }

                const result = await conditionFn();
                if (result) {
                    return true;
                }

                if (attempt < maxAttempts) {
                    const currentDelay = exponentialBackoff ? delay * Math.pow(2, attempt - 1) : delay;
                    await WaitUtils.delay(currentDelay);
                }
            } catch (error) {
                console.log(`Attempt ${attempt} failed:`, error);

                if (attempt < maxAttempts) {
                    const currentDelay = exponentialBackoff ? delay * Math.pow(2, attempt - 1) : delay;
                    await WaitUtils.delay(currentDelay);
                }
            }
        }

        return false;
    }

    /**
     * Wait for specific count of elements
     */
    static async waitForElementCount(
        elements: Locator,
        expectedCount: number,
        timeout: number = WaitUtils.DEFAULT_TIMEOUT
    ): Promise<boolean> {
        return WaitUtils.waitForCondition(
            async () => {
                const count = await elements.count();
                return count === expectedCount;
            },
            { timeout }
        );
    }

    /**
     * Utility delay function
     */
    static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Wait for page to be ready (all elements loaded)
     */
    static async waitForPageReady(page: Page, timeout: number = WaitUtils.DEFAULT_TIMEOUT): Promise<void> {
        await page.waitForLoadState('networkidle', { timeout });
        await page.waitForLoadState('domcontentloaded', { timeout });
    }
}

/**
 * Form interaction utilities
 */
export class FormUtils {
    /**
     * Fill form field with retry mechanism
     */
    static async fillField(
        field: Locator,
        value: string,
        options: RetryOptions = {}
    ): Promise<void> {
        const { maxAttempts = 3 } = options;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await field.waitFor({ state: 'visible' });
                await field.clear();
                await field.fill(value);

                // Verify the value was set correctly
                const inputValue = await field.inputValue();
                if (inputValue === value) {
                    return;
                }
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw new Error(`Failed to fill field after ${maxAttempts} attempts: ${error}`);
                }
                await WaitUtils.delay(500);
            }
        }
    }

    /**
     * Select option from dropdown
     */
    static async selectOption(
        page: Page,
        selectElement: Locator,
        dropdownSelector: Locator,
        optionText: string,
        options: RetryOptions = {}
    ): Promise<void> {
        const { maxAttempts = 3 } = options;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await selectElement.click();
                await dropdownSelector.waitFor({ state: 'visible' });
                await dropdownSelector
                    .filter({ hasText: optionText })
                    .click();
                await WaitUtils.delay(1000);
                return;
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw new Error(`Failed to select option after ${maxAttempts} attempts: ${error}`);
                }
                await WaitUtils.delay(500);
            }
        }
    }

    /**
     * Submit form with confirmation
     */
    static async submitForm(
        submitButton: Locator,
        confirmButton?: Locator,
        options: WaitOptions = {}
    ): Promise<void> {
        await submitButton.click();

        if (confirmButton) {
            await WaitUtils.waitForElement(confirmButton, options);
            await confirmButton.click();
        }
    }

    /**
     * Clear all form fields
     */
    static async clearForm(fields: Locator[]): Promise<void> {
        for (const field of fields) {
            try {
                await field.clear();
            } catch (error) {
                console.log(`Failed to clear field: ${error}`);
            }
        }
    }
}

/**
 * Table interaction utilities
 */
export class TableUtils {
    /**
     * Get all table data with scrolling support
     */
    static async getAllTableData<T>(
        page: Page,                  // Trang Playwright
        tableRows: Locator,          // Locator của các dòng trong bảng
        scrollContainer: Locator,    // Locator của vùng chứa scrollable
        dataExtractor: (rowIndex: number) => Promise<T>, // Hàm trích xuất dữ liệu
        useScrolling: boolean = true // Có tự động scroll không?
    ): Promise<T[]> {
        if (useScrolling) {
            await ScrollUtils.loadAllData(page, scrollContainer);
        }

        const rowCount = await tableRows.count();
        const allData: T[] = [];

        for (let i = 0; i < rowCount; i++) {
            try {
                const rowData = await dataExtractor(i);
                allData.push(rowData);
            } catch (error) {
                console.log(`Failed to extract data from row ${i}: ${error}`);
            }
        }

        return allData;
    }

    /**
     * Find row by search criteria with scrolling
     */
    static async findRowWithScrolling<T>(
        page: Page,
        tableRows: Locator,
        scrollContainer: Locator,
        dataExtractor: (rowIndex: number) => Promise<T>,
        searchCriteria: (data: T) => boolean
    ): Promise<{ data: T; index: number } | null> {
        await ScrollUtils.scrollToTop(page, scrollContainer);

        let canScrollMore = true;
        let scrollAttempts = 0;

        while (canScrollMore && scrollAttempts < 50) {
            const rowCount = await tableRows.count();

            for (let i = 0; i < rowCount; i++) {
                try {
                    const rowData = await dataExtractor(i);
                    if (searchCriteria(rowData)) {
                        return { data: rowData, index: i };
                    }
                } catch (error) {
                    continue;
                }
            }

            canScrollMore = await ScrollUtils.canScrollDown(scrollContainer);
            if (canScrollMore) {
                const scrolled = await ScrollUtils.scrollPageDown(page, scrollContainer);
                if (!scrolled) break;
                await WaitUtils.delay(1000);
            }

            scrollAttempts++;
        }

        return null;
    }

    /**
     * Click table row with error handling
     */
    static async clickTableRow(
        tableRows: Locator,
        rowIndex: number,
        options: RetryOptions = {}
    ): Promise<void> {
        const { maxAttempts = 3 } = options;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const row = tableRows.nth(rowIndex);
                await row.waitFor({ state: 'visible' });
                await row.click();
                return;
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw new Error(`Failed to click row after ${maxAttempts} attempts: ${error}`);
                }
                await WaitUtils.delay(500);
            }
        }
    }
}

/**
 * Modal interaction utilities
 */
export class ModalUtils {
    /**
     * Wait for modal to appear and return modal element
     */
    static async waitForModal(
        page: Page,
        modalSelector: string,
        timeout: number = 10000
    ): Promise<Locator> {
        const modal = page.locator(modalSelector);
        await modal.waitFor({ state: 'visible', timeout });
        return modal;
    }

    /**
     * Close modal by clicking close button or escape key
     */
    static async closeModal(
        page: Page,
        modal: Locator,
        closeButtonSelector?: string
    ): Promise<void> {
        try {
            if (closeButtonSelector) {
                const closeButton = modal.locator(closeButtonSelector);
                await closeButton.click();
            } else {
                await page.keyboard.press('Escape');
            }
            await modal.waitFor({ state: 'hidden', timeout: 5000 });
        } catch (error) {
            throw new Error(`Failed to close modal: ${error}`);
        }
    }

    /**
     * Confirm modal action
     */
    static async confirmModal(
        modal: Locator,
        confirmButtonSelector: string = '.btn-confirm, .btn-primary'
    ): Promise<void> {
        const confirmButton = modal.locator(confirmButtonSelector);
        await confirmButton.click();
        await modal.waitFor({ state: 'hidden', timeout: 10000 });
    }

    /**
     * Cancel modal action
     */
    static async cancelModal(
        modal: Locator,
        cancelButtonSelector: string = '.btn-cancel, .btn-secondary'
    ): Promise<void> {
        const cancelButton = modal.locator(cancelButtonSelector);
        await cancelButton.click();
        await modal.waitFor({ state: 'hidden', timeout: 10000 });
    }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceUtils {
    /**
     * Measure execution time of a function
     */
    static async measureExecutionTime<T>(
        operation: () => Promise<T>
    ): Promise<{ result: T; duration: number }> {
        const startTime = Date.now();
        const result = await operation();
        const duration = Date.now() - startTime;

        return { result, duration };
    }

    /**
     * Monitor page load performance
     */
    static async measurePageLoadTime(page: Page): Promise<number> {
        const startTime = Date.now();
        await WaitUtils.waitForPageReady(page);
        return Date.now() - startTime;
    }

    /**
     * Measure element load time
     */
    static async measureElementLoadTime(element: Locator): Promise<number> {
        return PerformanceUtils.measureExecutionTime(async () => {
            await element.waitFor({ state: 'visible' });
        }).then(result => result.duration);
    }
}

// Export all utilities as a single object for convenience
export const UIUtils = {
    Scroll: ScrollUtils,
    Wait: WaitUtils,
    Form: FormUtils,
    Table: TableUtils,
    Modal: ModalUtils,
    Performance: PerformanceUtils
};

// Export common selectors
export const CommonSelectors = {
    CLOSE_BUTTON: '.btn-close, .close, .icon-close',
    CONFIRM_BUTTON: '.btn-confirm, .btn-primary, [data-testid="confirm"]',
    CANCEL_BUTTON: '.btn-cancel, .btn-secondary, [data-testid="cancel"]',
    LOADING_SPINNER: '.loading, .spinner, [data-testid="loading"]',
    ERROR_MESSAGE: '.error, .alert-error, [data-testid="error"]',
    SUCCESS_MESSAGE: '.success, .alert-success, [data-testid="success"]'
};
