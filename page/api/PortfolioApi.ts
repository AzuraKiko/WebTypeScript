import ApiHelper from "../../helpers/ApiHelper";

// Interface definitions for better type safety
interface PortfolioPayload {
    group: string;
    user: string;
    session: string;
    cmd: string;
    rqId: string;
    channel: string;
    data: {
        acntNo: string;
        subAcntNo: string;
    };
}

interface PortfolioApiConfig {
    baseUrl: string;
    timeout?: number;
}

interface PortfolioRequestParams {
    user: string;
    session: string;
    acntNo: string;
    subAcntNo: string;
    rqId: string;
}

interface ApiResponse {
    success: boolean;
    data?: any;
    error?: string;
    status?: number;
}

/**
 * Portfolio API class for handling portfolio-related operations
 * Fixed typo in class name and improved structure
 */
export default class PortfolioApi {
    private baseUrl: string;
    private apiHelper: ApiHelper;
    private readonly defaultTimeout: number = 30000;

    // Constants
    private static readonly DEFAULT_GROUP = "CORE";
    private static readonly DEFAULT_CHANNEL = "WTS";
    private static readonly DEFAULT_COMMAND = "getPositions";
    private static readonly SERVLET_ENDPOINT = "/CoreServlet.pt";
    private static readonly DEFAULT_HEADERS = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    };

    constructor(config: PortfolioApiConfig) {
        this.baseUrl = config.baseUrl;

        const timeout = config.timeout || this.defaultTimeout;
        this.apiHelper = new ApiHelper({
            baseUrl: this.baseUrl,
            timeout: timeout
        });
    }

    /**
     * Get portfolio positions for a specific account
     * @param params - Portfolio request parameters
     * @returns Promise<ApiResponse> - API response with portfolio data
     */
    async getPortfolio(params: PortfolioRequestParams): Promise<ApiResponse> {
        try {
            const payload = this.buildPortfolioPayload(params);
            const response = await this.makePortfolioRequest(payload);

            return {
                success: true,
                data: response,
                status: 200
            };
        } catch (error) {
            console.error('Portfolio API request failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                status: 500
            };
        }
    }

    /**
     * Get portfolio positions with retry mechanism
     * @param params - Portfolio request parameters
     * @param retryCount - Number of retry attempts (default: 3)
     * @returns Promise<ApiResponse> - API response with portfolio data
     */
    async getPortfolioWithRetry(
        params: PortfolioRequestParams,
        retryCount: number = 3
    ): Promise<ApiResponse> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= retryCount; attempt++) {
            try {
                const result = await this.getPortfolio(params);

                if (result.success) {
                    return result;
                }

                lastError = new Error(result.error || 'API request failed');

                if (attempt < retryCount) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    console.log(`Portfolio API attempt ${attempt} failed, retrying in ${delay}ms...`);
                    await this.delay(delay);
                }
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');

                if (attempt < retryCount) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`Portfolio API attempt ${attempt} failed, retrying in ${delay}ms...`);
                    await this.delay(delay);
                }
            }
        }

        return {
            success: false,
            error: lastError?.message || 'All retry attempts failed',
            status: 500
        };
    }

    /**
     * Build portfolio payload with proper structure and validation
     * @param params - Portfolio request parameters
     * @returns PortfolioPayload - Formatted payload for API request
     */
    private buildPortfolioPayload(params: PortfolioRequestParams): PortfolioPayload {
        // Validate required parameters
        this.validateParameters(params);

        return {
            group: PortfolioApi.DEFAULT_GROUP,
            user: params.user,
            session: params.session,
            cmd: PortfolioApi.DEFAULT_COMMAND,
            rqId: params.rqId,
            channel: PortfolioApi.DEFAULT_CHANNEL,
            data: {
                acntNo: params.acntNo,
                subAcntNo: params.subAcntNo,
            },
        };
    }

    /**
     * Validate request parameters
     * @param params - Parameters to validate
     * @throws Error if validation fails
     */
    private validateParameters(params: PortfolioRequestParams): void {
        const requiredFields: (keyof PortfolioRequestParams)[] = [
            'user', 'session', 'acntNo', 'subAcntNo', 'rqId'
        ];

        for (const field of requiredFields) {
            if (!params[field] || params[field].trim() === '') {
                throw new Error(`Required parameter '${field}' is missing or empty`);
            }
        }

        // Additional validation
        if (params.rqId.length < 1) {
            throw new Error('Request ID must not be empty');
        }

        if (params.acntNo.length < 1) {
            throw new Error('Account number must not be empty');
        }
    }

    /**
     * Make the actual API request
     * @param payload - Request payload
     * @returns Promise<any> - API response
     */
    private async makePortfolioRequest(payload: PortfolioPayload): Promise<any> {
        try {
            const response = await this.apiHelper.post(
                PortfolioApi.SERVLET_ENDPOINT,
                JSON.stringify(payload),
                {
                    headers: PortfolioApi.DEFAULT_HEADERS,
                }
            );

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw new Error(`Portfolio API request failed: ${error}`);
        }
    }

    /**
     * Utility method for delay
     * @param ms - Delay in milliseconds
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get API helper instance for advanced usage
     * @returns ApiHelper instance
     */
    public getApiHelper(): ApiHelper {
        return this.apiHelper;
    }

    /**
     * Update base URL
     * @param newBaseUrl - New base URL
     */
    public updateBaseUrl(newBaseUrl: string): void {
        this.baseUrl = newBaseUrl;
        this.apiHelper = new ApiHelper({
            baseUrl: this.baseUrl,
            timeout: this.defaultTimeout
        });
    }

    /**
     * Get current configuration
     * @returns Current API configuration
     */
    public getConfig(): PortfolioApiConfig {
        return {
            baseUrl: this.baseUrl,
            timeout: this.defaultTimeout
        };
    }

    /**
     * Test API connectivity
     * @returns Promise<boolean> - Connection test result
     */
    async testConnection(): Promise<boolean> {
        try {
            // Use a minimal test payload
            const testParams: PortfolioRequestParams = {
                user: 'test',
                session: 'test',
                acntNo: 'test',
                subAcntNo: 'test',
                rqId: 'connectivity-test'
            };

            const result = await this.getPortfolio(testParams);
            return result.success;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    /**
     * Create a new instance with different configuration
     * @param config - New configuration
     * @returns New PortfolioApi instance
     */
    static createInstance(config: PortfolioApiConfig): PortfolioApi {
        return new PortfolioApi(config);
    }
}
