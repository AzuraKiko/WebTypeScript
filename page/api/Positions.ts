import apiHelper from "../../helpers/ApiHelper";
import { WaitUtils } from "../../helpers/uiUtils";

// Interface definitions for better type safety
interface PositionsPayload {
    group: string;
    user: string;
    session: string;
    cmd: string;
    rqId: string;
    channel: string;
    data: {
        acntNo: string;
        subAcntNo: string | null;
    };
}

interface AssetApiConfig {
    baseUrl: string;
    timeout?: number;
}

interface AssetRequestParams {
    user: string;
    session: string;
    acntNo: string;
    subAcntNo: string | null;
    rqId: string;
}

interface ApiResponse {
    success: boolean;
    data?: any;
    error?: string;
    status?: number;
}

export default class AssetApi {
    private baseUrl: string;
    private apiHelper: apiHelper;
    private waitUtils: WaitUtils;
    private readonly defaultTimeout: number = 30000;

    // Constants
    private static readonly DEFAULT_GROUP = "CORE";
    private static readonly DEFAULT_CHANNEL = "WTS";
    private static readonly DEFAULT_COMMAND = "getTotalAssetAll";
    private static readonly SERVLET_ENDPOINT = "/CoreServlet.pt";
    private static readonly DEFAULT_HEADERS = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    };

    constructor(config: AssetApiConfig) {
        this.baseUrl = config.baseUrl;
        this.waitUtils = new WaitUtils();

        const timeout = config.timeout || this.defaultTimeout;
        this.apiHelper = new apiHelper({
            baseUrl: this.baseUrl,
            timeout: timeout
        });
    }

    /**
     * Get portfolio positions for a specific account
     * @param params - Portfolio request parameters
     * @returns Promise<ApiResponse> - API response with portfolio data
     */
    async getTotalAssetAll(params: AssetRequestParams): Promise<ApiResponse> {
        try {
            const payload = this.buildAssetPayload(params);
            const response = await this.makeAssetRequest(payload);

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
     * Build portfolio payload with proper structure and validation
     * @param params - Portfolio request parameters
     * @returns PortfolioPayload - Formatted payload for API request
     */
    private buildAssetPayload(params: AssetRequestParams): AssetPayload {
        // Validate required parameters
        this.validateParameters(params);

        return {
            group: AssetApi.DEFAULT_GROUP,
            user: params.user,
            session: params.session,
            cmd: AssetApi.DEFAULT_COMMAND,
            rqId: params.rqId,
            channel: AssetApi.DEFAULT_CHANNEL,
            data: {
                acntNo: params.acntNo,
                subAcntNo: params.subAcntNo || null,
            },
        };
    }

    /**
     * Validate request parameters
     * @param params - Parameters to validate
     * @throws Error if validation fails
     */
    private validateParameters(params: AssetRequestParams): void {
        const requiredFields: (keyof AssetRequestParams)[] = [
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
    private async makeAssetRequest(payload: AssetPayload): Promise<any> {
        try {
            const response = await this.apiHelper.post(
                AssetApi.SERVLET_ENDPOINT,
                JSON.stringify(payload),
                {
                    headers: AssetApi.DEFAULT_HEADERS,
                }
            );

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw new Error(`Portfolio API request failed: ${error}`);
        }
    }

    /**
     * Create a new instance with different configuration
     * @param config - New configuration
     * @returns New PortfolioApi instance
     */
    static createInstance(config: AssetApiConfig): AssetApi {
        return new AssetApi(config);
    }
}
