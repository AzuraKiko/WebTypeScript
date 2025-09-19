import fs from 'fs';
import path from 'path';
import { ENV } from '../tests/utils/testConfig';
import LoginPage from '../page/ui/LoginPage';
import OrderPage from '../page/ui/OrderPage';
import OrderBook from '../page/ui/OrderBook';
import SubaccPage from '../page/ui/SubaccPage';

/**
 * Enhanced types for OMS test utilities
 */
export interface CapturedCall {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string | null;
    timestamp: string;
    responseTime?: number;
    statusCode?: number;
    responseData?: string | null;
}

export interface PostmanCollection {
    info: {
        name: string;
        schema: string;
        description?: string;
    };
    item: PostmanItem[];
}

export interface PostmanItem {
    name: string;
    request: {
        method: string;
        header: Array<{ key: string; value: string }>;
        body?: { mode: string; raw: string };
        url: string;
    };
    response?: any[];
}

export interface TestExecutionMetrics {
    startTime: number;
    endTime?: number;
    apiCallsCount: number;
    testSteps: string[];
    errors: string[];
}

export interface OrderWorkflowParams {
    page: any;
    orderPage: OrderPage;
    orderBook: OrderBook;
    apiCapture: ApiCallCapture;
    accountType: 'normal' | 'margin';
    side: 'buy' | 'sell';
    stockCode?: string;
    quantity: number;
    enableModify?: boolean;
    modifyQuantity?: number;
    modifyPrice?: number;
}

/**
 * OMS Test Configuration - Centralized configuration for OMS tests
 */
export class OmsTestConfig {
    // Environment-specific API domains with fallback handling
    private static readonly API_DOMAINS_CONFIG = {
        DEV: ['http://10.8.80.164:8888/', 'http://10.8.80.104:8888/'],
        UAT: ['http://10.8.90.164:8888/', 'http://10.8.90.16:8888/'],
        PROD: ['https://trade.pinetree.vn/']
    } as const;

    // Test configuration constants
    static readonly TIMEOUTS = {
        DEFAULT_WAIT: 2000,
        LONG_WAIT: 8000,
        API_RESPONSE: 3000,
    } as const;

    static readonly TEST_DATA = {
        STOCK_CODES: {
            NORMAL_ACCOUNT: 'CACB2510',
            MARGIN_ACCOUNT: 'CACB2510',
            ALTERNATIVE: 'ACB'
        },
        ORDER_QUANTITY: 100,
        ODD_QUANTITY: 1
    } as const;

    static readonly FUNCTION_TESTS = [
        'getAllOrderList', //Lấy danh sách lệnh trong ngày (Kiểm tra vào oms khi login có giá trị 'E')
        'PurchasePower', //Lấy sức mua	
        'NewOrder', //Đặt lệnh cơ sở	
        'CancelOrder', //Hủy lệnh cơ sở	
        'EditOrder', //Sửa lệnh cơ sở	
        'getPreOrder', //Lấy phí dự tính của lệnh	(WTS ko sd)

        'getDvxPP', //Lấy sức mua	
        'newDvxOrder', //Đặt lệnh	
        'editDvxOrder', //Sửa lệnh	
        'cancelDvxOrder', //Hủy lệnh	
        'cancelAllDvxOrder', //Hủy tất cả lệnh đang chờ khớp	
        'cancelSeltDvxOrder', //Hủy lệnh theo số hiệu lệnh	
        'getActvDvxOrdr', //Danh sách lệnh đang chờ khớp	
        'getDvxCurrPos', //Lấy vị thế hiện tại	
        'getDvxTotalAsset', //Tổng tài sản	
        'closeDvxPos', //Đóng vị thế	
        'closeAllDvxPos', //Đóng tất cả vị thế	
        'revertDvxPos', //Đảo vị thế		
        'getCfmClsRevtDvxPos' //Hiển Thông tin lênh đóng/đảo để KH xác nhận	
    ] as const;

    static getApiDomains(): string[] {
        const domains = this.API_DOMAINS_CONFIG[ENV as keyof typeof this.API_DOMAINS_CONFIG];
        if (!domains) {
            console.warn(`Unknown environment: ${ENV}, falling back to PROD`);
            return [...this.API_DOMAINS_CONFIG.PROD]; // Create mutable copy
        }
        return [...domains]; // Return copy to prevent mutations
    }

    static getConfiguredOrigins(): string[] {
        const invalidDomains: string[] = [];

        const origins = this.getApiDomains().map((domain) => {
            let urlString = domain;
            if (!/^https?:\/\//i.test(domain)) {
                urlString = `http://${domain}`;
            }

            try {
                return new URL(urlString).origin;
            } catch {
                invalidDomains.push(domain);
                return null;
            }
        }).filter((origin): origin is string => origin !== null);

        if (invalidDomains.length) {
            console.warn(`Some domains could not be parsed: ${invalidDomains.join(', ')}`);
        }

        return origins;
    }

    static getOutputFile(type: 'url' | 'body'): string {
        return `oms_postman_collection_${type}_${ENV}.json`;
    }

    static getApiCallsFile(type: 'url' | 'body'): string {
        return `api_calls_${type}.json`;
    }
}

/**
 * Enhanced API call capture utilities with streaming file writing
 * 
 * STREAMING APPROACH:
 * - Immediately processes and writes each API call to file without batching delays
 * - No batch timers or intervals - all operations happen in real-time
 * - Postman collection updates every 5 calls or every second to balance performance
 * - Thread-safe file operations with write conflict prevention
 * - Real-time streaming provides immediate visibility into captured API calls
 */
export class ApiCallCapture {
    private apiCalls: CapturedCall[] = [];           // Mảng chứa các API calls
    private metrics: TestExecutionMetrics;           // Metrics của test
    private filterFunction?: (url: string, body?: string | null) => boolean;  // Filter function
    private outputFile: string;                      // File Postman collection
    private apiCallsFile: string;                    // File raw API calls
    private writeInProgress: boolean = false;        // Flag để tránh write conflict
    private writeQueue: CapturedCall[] = [];         // Queue cho streaming writes
    private debounceTimer: NodeJS.Timeout | null = null;
    private readonly DEBOUNCE_INTERVAL = 1000;
    private readonly STREAM_UPDATE_INTERVAL = 1000;  // Update Postman collection every 1 second
    private readonly MAX_RESPONSE_SIZE = 50000;      // Max response data size (50KB)

    constructor(type: 'url' | 'body', filterFunction?: (url: string, body?: string | null) => boolean) {
        this.metrics = {
            startTime: Date.now(),
            apiCallsCount: 0,
            testSteps: [],
            errors: []
        };
        this.filterFunction = filterFunction;
        this.outputFile = OmsTestConfig.getOutputFile(type);
        this.apiCallsFile = OmsTestConfig.getApiCallsFile(type);

        // Initialize empty files
        this.initializeFiles();
    }

    /**
     * Initialize empty files for real-time writing
     */
    private initializeFiles(): void {
        try {
            // Ensure directory exists
            const outputDir = path.dirname(this.outputFile);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Initialize empty API calls file with metadata structure
            const initialData = {
                metadata: {
                    environment: ENV,
                    startTime: new Date().toISOString(),
                    status: 'running',
                    totalCalls: 0
                },
                apiCalls: []
            };

            fs.writeFileSync(this.apiCallsFile, JSON.stringify(initialData, null, 2), 'utf-8');
            console.log(`📝 Initialized streaming API calls file: ${this.apiCallsFile}`);
        } catch (error) {
            console.error('Failed to initialize files:', error);
        }
    }

    /**
     * Enhanced domain matching with better error handling and logging
     */
    private matchConfiguredDomain(url: string): boolean {
        if (!url || typeof url !== 'string') {
            return false;
        }

        const configuredOrigins = OmsTestConfig.getConfiguredOrigins();

        try {
            const origin = new URL(url).origin;
            const isMatch = configuredOrigins.some((configuredOrigin) => origin === configuredOrigin);

            if (isMatch) {
                console.debug(`API call matched domain: ${origin}`);
            }

            return isMatch;
        } catch (error) {
            // Fallback: string includes check if URL parsing fails
            console.warn(`URL parsing failed for: ${url}, using fallback matching`);
            return configuredOrigins.some((configuredOrigin) =>
                url.includes(configuredOrigin.replace(/^https?:\/\//, ''))
            );
        }
    }

    /**
     * Stream API call immediately to file
     */
    private async streamApiCall(newCall: CapturedCall): Promise<void> {
        this.writeQueue.push(newCall);

        // Thay vì xử lý ngay, dùng debounce để flush sau một khoảng thời gian
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.processStreamQueue();
        }, this.DEBOUNCE_INTERVAL);
    }

    /**
     * Process streaming queue (debounced & async)
     */
    private async processStreamQueue(): Promise<void> {
        if (this.writeInProgress || this.writeQueue.length === 0) {
            return;
        }

        this.writeInProgress = true;

        try {
            // Đọc file hiện tại
            const fileContent = fs.readFileSync(this.apiCallsFile, 'utf-8');
            const currentData = JSON.parse(fileContent);

            // Gom tất cả các calls trong queue
            const callsToProcess = [...this.writeQueue];
            currentData.apiCalls.push(...callsToProcess);
            currentData.metadata.totalCalls = currentData.apiCalls.length;
            currentData.metadata.lastUpdated = new Date().toISOString();

            // Ghi lại vào file
            fs.writeFileSync(this.apiCallsFile, JSON.stringify(currentData, null, 2), 'utf-8');

            // Quyết định có cần update Postman không
            const shouldUpdatePostman =
                currentData.apiCalls.length % 5 === 0 ||
                Date.now() - this.metrics.startTime > this.STREAM_UPDATE_INTERVAL;

            if (shouldUpdatePostman) {
                await this.updatePostmanCollection(currentData);
            }

            console.log(`🔵 STREAM: Wrote ${callsToProcess.length} API calls (Total: ${currentData.apiCalls.length})`);

            // Xóa queue đã xử lý
            this.writeQueue = [];
        } catch (error) {
            console.error('Stream file write failed:', error);
            // Giữ queue lại để retry lần sau
        } finally {
            this.writeInProgress = false;
        }
    }

    /**
     * Update Postman collection file in real-time
     */
    private async updatePostmanCollection(data: any): Promise<void> {
        try {
            const apiDomains = OmsTestConfig.getApiDomains();
            const postmanCollection: PostmanCollection = {
                info: {
                    name: `OMS Captured API - ${apiDomains.join(', ')} (${ENV}) - STREAMING`,
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                    description: `🔴 STREAMING CAPTURE - Updated: ${data.metadata.lastUpdated}. Environment: ${ENV}. Total calls: ${data.metadata.totalCalls}. Real-time API streaming without batch delays.`
                },
                item: data.apiCalls.map((call: CapturedCall) => ({
                    name: `${call.method} ${call.url} ${call.statusCode ? `(${call.statusCode})` : ''} ${call.responseTime ? `- ${call.responseTime}ms` : ''}`,
                    request: {
                        method: call.method,
                        header: Object.entries(call.headers).map(([key, value]) => ({ key, value })),
                        body: call.body ? { mode: 'raw', raw: call.body } : undefined,
                        url: call.url
                    },
                    response: call.statusCode ? [{
                        name: 'Captured Response',
                        status: call.statusCode ? `${call.statusCode}` : 'Unknown',
                        // body: call.responseData
                    }] : []
                }))
            };

            fs.writeFileSync(this.outputFile, JSON.stringify(postmanCollection, null, 2), 'utf-8');
        } catch (error) {
            console.error('Postman collection update failed:', error);
        }
    }

    /**
     * Enhanced request capturing with response time and status tracking
     */
    setupRequestCapture(page: any): void {
        const requestStartTimes = new Map<string, number>();

        page.on('request', (request: any) => {
            const url = request.url();
            const body = request.postData();
            requestStartTimes.set(request.url(), Date.now());

            // Apply domain matching
            if (!this.matchConfiguredDomain(url)) {
                return;
            }

            // Apply custom filter if provided
            if (this.filterFunction && !this.filterFunction(url, body)) {
                return;
            }

            try {
                const newCall: CapturedCall = {
                    url,
                    method: request.method(),
                    headers: request.headers(),
                    body,
                    timestamp: new Date().toISOString(),
                };

                this.apiCalls.push(newCall);
                this.metrics.apiCallsCount++;

                // Stream immediately to file
                this.streamApiCall(newCall);

                console.log(`🔴 LIVE: Captured ${request.method()} ${url} (Total: ${this.metrics.apiCallsCount})`);

            } catch (error) {
                console.error('Error capturing API call:', error);
                this.metrics.errors.push(`Request capture error: ${error}`);
            }
        });

        // Capture response information for performance metrics
        page.on('response', async (response: any) => {
            const url = response.url();
            const startTime = requestStartTimes.get(url);

            if (startTime && this.matchConfiguredDomain(url)) {
                const responseTime = Date.now() - startTime;
                const matchingCall = this.apiCalls.find(call =>
                    call.url === url && !call.responseTime
                );

                if (matchingCall) {
                    matchingCall.responseTime = responseTime;
                    matchingCall.statusCode = response.status();

                    // Capture response data with size limit
                    try {
                        // const responseData = await response.text();

                        // // Limit response data size to prevent memory issues
                        // if (responseData.length > this.MAX_RESPONSE_SIZE) {
                        //     matchingCall.responseData = responseData.substring(0, this.MAX_RESPONSE_SIZE) +
                        //         `\n\n... [TRUNCATED - Original size: ${responseData.length} bytes]`;
                        // } else {
                        //     matchingCall.responseData = responseData;
                        // }

                        // Stream updated call immediately
                        this.streamApiCall(matchingCall);

                        console.log(`📥 Response captured for ${matchingCall.method} ${url} (${matchingCall.statusCode}) - ${responseTime}ms`);
                    } catch (error) {
                        console.warn(`Failed to capture response data for ${url}:`, error);
                        matchingCall.responseData = null;
                        // Still stream the call even if response data capture fails
                        this.streamApiCall(matchingCall);
                    }
                }
            }

            requestStartTimes.delete(url);
        });
    }

    /**
     * Add test step for tracking
     */
    addTestStep(step: string): void {
        this.metrics.testSteps.push(`${new Date().toISOString()}: ${step}`);
        console.info(`Test step: ${step}`);
    }
    /**
     * Get test metrics
     */
    getMetrics(): TestExecutionMetrics {
        return {
            ...this.metrics,
            endTime: Date.now()
        };
    }

    /**
     * Generate performance summary
     */
    getPerformanceSummary(): string {
        const metrics = this.getMetrics();
        const totalTime = (metrics.endTime || Date.now()) - metrics.startTime;
        if (this.apiCalls.length === 0) {
            return `Test execution: ${totalTime}ms, API calls: ${metrics.apiCallsCount}, Avg response time: 0ms`;
        }
        const avgResponseTime = this.apiCalls
            .filter(call => call.responseTime)
            .reduce((sum, call) => sum + (call.responseTime || 0), 0) /
            this.apiCalls.filter(call => call.responseTime).length;

        return `Test execution: ${totalTime}ms, API calls: ${metrics.apiCallsCount}, Avg response time: ${avgResponseTime.toFixed(2)}ms`;
    }

    /**
     * Finalize files when test completes
     */
    async finalizeFiles(): Promise<void> {
        try {
            // Process any remaining queued writes immediately
            await this.processStreamQueue();

            // Read current file content
            const currentData = JSON.parse(fs.readFileSync(this.apiCallsFile, 'utf-8'));

            // Update metadata with final information
            currentData.metadata.status = 'completed';
            currentData.metadata.endTime = new Date().toISOString();
            currentData.metadata.totalCalls = this.apiCalls.length;
            currentData.metadata.performanceSummary = this.getPerformanceSummary();
            currentData.metadata.testSteps = this.metrics.testSteps;
            currentData.metadata.errors = this.metrics.errors;

            // Ensure all API calls are in the file (streaming should have handled this already)
            if (currentData.apiCalls.length !== this.apiCalls.length) {
                console.warn(`⚠️ File sync issue detected. File: ${currentData.apiCalls.length}, Memory: ${this.apiCalls.length}`);
                currentData.apiCalls = this.apiCalls; // Fallback sync
            }

            // Write final version
            fs.writeFileSync(this.apiCallsFile, JSON.stringify(currentData, null, 2), 'utf-8');

            // Update final Postman collection
            await this.updatePostmanCollection(currentData);

            console.log(`✅ Finalized streaming API calls file: ${this.apiCallsFile} (${this.apiCalls.length} calls)`);
            console.log(`✅ Finalized Postman collection: ${this.outputFile}`);

        } catch (error) {
            console.error('Failed to finalize files:', error);
        }
    }
}

/**
 * Enhanced toast message handling utility
 */
async function handleToastMessages(page: any, orderPage: OrderPage, apiCapture: ApiCallCapture, action: string): Promise<void> {
    try {
        apiCapture.addTestStep(`Handling toast messages for: ${action}`);

        // Wait for toast messages to appear and stabilize
        await page.waitForTimeout(OmsTestConfig.TIMEOUTS.DEFAULT_WAIT);

        // Try to close all toast messages
        await orderPage.closeAllToastMessages(orderPage.toastMessage);

        // // Wait for toast messages to disappear with a more flexible approach
        // try {
        //     // Use first() to handle multiple elements gracefully
        //     const firstToast = orderPage.toastMessage.first();
        //     await WaitUtils.waitForElement(firstToast, {
        //         state: 'hidden',
        //         timeout: OmsTestConfig.TIMEOUTS.MESSAGE_WAIT
        //     });
        // } catch (waitError) {
        //     console.warn(`Toast message wait failed for ${action}, continuing anyway:`, waitError);
        //     // Continue execution even if toast wait fails
        // }

        // apiCapture.addTestStep(`Toast messages handled successfully for: ${action}`);
    } catch (error) {
        console.warn(`Toast message handling failed for ${action}:`, error);
        apiCapture.addTestStep(`Toast message handling failed for: ${action} - ${error}`);
    }
}

/**
 * Enhanced order workflow execution with comprehensive error handling
 */
export async function executeOrderWorkflow(params: OrderWorkflowParams): Promise<void> {
    const {
        page,
        orderPage,
        orderBook,
        apiCapture,
        accountType,
        side,
        stockCode,
        quantity,
        enableModify = false,
        modifyQuantity,
        modifyPrice
    } = params;

    const workflowId = `${side}-${accountType}-${Date.now()}`;
    apiCapture.addTestStep(`Starting ${side} order workflow for ${accountType} account (${workflowId})`);

    try {
        // Place order based on type
        if (side === 'buy' && stockCode) {
            await orderPage.placeBuyOrder({ stockCode, quantity });
        } else if (side === 'sell') {
            await orderPage.placeSellOrderFromPorfolio({ quantity });
        } else {
            throw new Error(`Invalid order configuration: ${side} order requires stockCode`);
        }

        // Verify order success message
        await orderPage.verifyMessageOrder(
            ['Đặt lệnh thành công', 'Thông báo'],
            ['Số hiệu lệnh', 'thành công']
        );

        // Handle toast messages after order placement
        await handleToastMessages(page, orderPage, apiCapture, 'order placement');

        apiCapture.addTestStep(`${side} order placed successfully`);
        // Update purchase power for normal account buy orders
        if (accountType === 'normal' && side === 'buy') {
            await orderPage.updatePurchasePower();
            apiCapture.addTestStep('Purchase power updated');
            await orderPage.fillStockCode(stockCode);
        }

        if (enableModify) {
            await orderPage.openOrderInDayTab();
            // Get current price for modification
            let newPrice = modifyPrice;
            if (!newPrice) {
                const priceText = await orderPage.priceFloor.textContent();
                newPrice = Number(priceText) + 0.1;
            }


            await orderBook.modifyOrder(0, newPrice, undefined);
            apiCapture.addTestStep(`Order modified - Price: ${newPrice}}`);

            // Handle toast messages after order modification
            await handleToastMessages(page, orderPage, apiCapture, 'order modification');
        }

        if (enableModify && modifyQuantity) {
            await orderPage.openOrderInDayTab();
            await orderBook.modifyOrder(0, undefined, modifyQuantity);
            apiCapture.addTestStep(`Order modified - Quantity: ${modifyQuantity}`);
        }

        // Cancel order and clean up
        if (!enableModify) {
            await orderPage.openOrderInDayTab();
        }

        await orderBook.cancelOrder(0);
        apiCapture.addTestStep(`Order cancelled successfully`);

        // Handle toast messages after order cancellation
        await handleToastMessages(page, orderPage, apiCapture, 'order cancellation');


        apiCapture.addTestStep(`${side} order workflow completed successfully (${workflowId})`);

    } catch (error) {
        apiCapture.addTestStep(`${side} order workflow failed (${workflowId}): ${error}`);

        // Attempt cleanup on error using the robust toast handler
        await handleToastMessages(page, orderPage, apiCapture, 'error cleanup');

        throw new Error(`Order workflow failed for ${side} ${accountType}: ${error}`);
    }
}

// export async function executeConditionalOrderWorkflow(params: ConditionalOrderWorkflowParams): Promise<void> {
//     const {
//         page,
//         orderPage,
//         orderBook,
//         apiCapture,
//     } = params;
// }

/**
 * Initialize page objects with enhanced error handling
 */
export async function initializePageObjects(page: any, apiCapture: ApiCallCapture): Promise<{
    loginPage: LoginPage;
    orderPage: OrderPage;
    orderBook: OrderBook;
    subaccPage: SubaccPage;
}> {
    try {
        const loginPage = new LoginPage(page);
        const orderPage = new OrderPage(page);
        const orderBook = new OrderBook(page);
        const subaccPage = new SubaccPage(page);

        apiCapture.addTestStep('Page objects initialized');

        return { loginPage, orderPage, orderBook, subaccPage };
    } catch (error) {
        apiCapture.addTestStep(`Page initialization failed: ${error}`);
        throw error;
    }
}

/**
 * Enhanced login with retry mechanism
 */
export async function performLogin(loginPage: LoginPage, apiCapture: ApiCallCapture): Promise<void> {
    try {
        apiCapture.addTestStep('Starting login process');
        await loginPage.loginSuccess();
        apiCapture.addTestStep('Login successful');
    } catch (error) {
        apiCapture.addTestStep(`Login failed: ${error}`);
        throw new Error(`Login process failed: ${error}`);
    }
}

/**
 * Navigate to order page with validation
 */
export async function navigateToOrderPage(orderPage: OrderPage, apiCapture: ApiCallCapture): Promise<void> {
    try {
        apiCapture.addTestStep('Navigating to order page');
        await orderPage.navigateToOrder();
        apiCapture.addTestStep('Order page navigation completed');
    } catch (error) {
        apiCapture.addTestStep(`Order page navigation failed: ${error}`);
        throw new Error(`Failed to navigate to order page: ${error}`);
    }
}

/**
 * Switch to margin account with error handling
 */
export async function switchToMarginAccount(subaccPage: SubaccPage, apiCapture: ApiCallCapture): Promise<void> {
    try {
        apiCapture.addTestStep('Switching to margin account');
        await subaccPage.selectMarginSubacc();
        apiCapture.addTestStep('Margin account selected');
    } catch (error) {
        apiCapture.addTestStep(`Margin account selection failed: ${error}`);
        throw new Error(`Failed to select margin account: ${error}`);
    }
}

export async function switchToOddTab(orderPage: OrderPage, apiCapture: ApiCallCapture): Promise<void> {
    try {
        apiCapture.addTestStep('Switching to odd tab');
        await orderPage.switchToOddTab();
        apiCapture.addTestStep('Odd tab selected');
    } catch (error) {
        apiCapture.addTestStep(`Odd tab selection failed: ${error}`);
        throw new Error(`Failed to select odd tab: ${error}`);
    }
}

// Order book
export async function openOrderBook(orderBook: OrderBook, apiCapture: ApiCallCapture): Promise<void> {
    try {
        apiCapture.addTestStep('Opening order book');
        await orderBook.openOrderBook();
        apiCapture.addTestStep('Order book opened');
    } catch (error) {
        apiCapture.addTestStep(`Order book opening failed: ${error}`);
        throw new Error(`Failed to open order book: ${error}`);
    }
}

export type OrderBookTab = 'inday' | 'history' | 'conditional' | 'putthrough';
export async function switchToOrderBookTab(orderBook: OrderBook, apiCapture: ApiCallCapture, tab: OrderBookTab): Promise<void> {
    try {
        apiCapture.addTestStep(`Switching to ${tab} tab`);
        await orderBook.switchToTab(tab);
        apiCapture.addTestStep(`${tab} tab selected`);
    } catch (error) {
        apiCapture.addTestStep(`${tab} tab selection failed: ${error}`);
        throw new Error(`Failed to select ${tab} tab: ${error}`);
    }
}

export async function closeOrderBook(orderBook: OrderBook, apiCapture: ApiCallCapture): Promise<void> {
    try {
        apiCapture.addTestStep('Closing order book');
        await orderBook.closeOrderBook();
        apiCapture.addTestStep('Order book closed');
    } catch (error) {
        apiCapture.addTestStep(`Order book closing failed: ${error}`);
        throw new Error(`Failed to close order book: ${error}`);
    }
}

/**
 * Enhanced test report generation with performance metrics (now uses real-time files)
 */
export async function generateTestReport(
    apiCapture: ApiCallCapture,
    apiDomains: string[],
    type: 'url' | 'body'
): Promise<void> {
    try {
        apiCapture.addTestStep('Finalizing test report and files');

        // Finalize files with all captured data
        await apiCapture.finalizeFiles();

        const metrics = apiCapture.getMetrics();
        const performanceSummary = apiCapture.getPerformanceSummary();

        // Log performance summary
        console.log(`📊 Performance Summary: ${performanceSummary}`);
        console.log(`🎯 Test completed with ${metrics.errors.length} errors`);
        console.log(`🔴 STREAMING CAPTURE: Files were updated immediately without batch delays during test execution`);

        if (metrics.errors.length > 0) {
            console.warn('⚠️  Errors encountered during test:');
            metrics.errors.forEach((error, index) => {
                console.warn(`  ${index + 1}. ${error}`);
            });
        }

        apiCapture.addTestStep('Test report finalized successfully');

    } catch (error) {
        console.error('Failed to finalize test report:', error);
        apiCapture.addTestStep(`Test report finalization failed: ${error}`);
        throw error;
    }
}

/**
 * Create API capture with body filtering (for omsBody.spec.ts)
 */
export function createBodyFilteredCapture(): ApiCallCapture {
    return new ApiCallCapture('body', (url: string, body?: string | null) => {
        // Only capture requests that contain function test keywords in body
        return OmsTestConfig.FUNCTION_TESTS.some(func => body?.includes(func));
    });
}

/**
 * Create API capture without body filtering (for omsUrl.spec.ts)
 */
export function createUrlCapture(): ApiCallCapture {
    return new ApiCallCapture('url'); // No additional filtering beyond domain matching
}
