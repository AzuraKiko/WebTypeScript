import { BaseApi, BaseApiConfig, BaseRequestParams, ApiResponse } from "./BaseApi";

interface BondListPayload {
    data: {
        invtAmt?: string;
        proInvtYN?: string;
        term?: string;
        langTp: string;
        issrCode?: string;
        rateSort?: string;
        prodTp: string;
    };
    group: string;
    cmd: string;
    rqId: string;
    channel: string;
}

export default class BondListApi extends BaseApi {
    // Asset-specific constants
    private static readonly DEFAULT_COMMAND = "getBondProductList";

    constructor(config: BaseApiConfig) {
        super(config);
    }

    /**
     * Make API call with custom payload structure for bond list
     * @param payload - Custom bond list payload
     * @returns Promise<any> - API response
     */
    private async makeBondListApiCall(payload: BondListPayload): Promise<any> {
        try {
            const response = await this.apiHelper.post(
                BaseApi.SERVLET_ENDPOINT,
                JSON.stringify(payload),
                {
                    headers: BaseApi.DEFAULT_HEADERS,
                }
            );
            return response;
        } catch (error) {
            console.error('BondList API request failed:', error);
            throw new Error(`BondList API request failed: ${error}`);
        }
    }

    /**
     * Get bond product list
     * @param params - Bond product list request parameters
     * @returns Promise<ApiResponse> - API response with bond product list data
     */
    async getBondProductList(params: BaseRequestParams, additionalData: Record<string, any> = {}): Promise<ApiResponse> {
        this.validateParameters(params);

        const payload: BondListPayload = {
            data: {
                invtAmt: "",
                proInvtYN: "", // TP cho nhà đầu tư chuyên nghiệp
                term: "", // Thời hạn
                langTp: "vi",
                issrCode: "", // Tổ chức phát hành
                rateSort: additionalData.rateSort || "", // Sắp xếp theo tỷ lệ ( 1 - desc, 2 - asc)
                prodTp: additionalData.prodTp || "1" // loại trái phiếu
            },
            group: BaseApi.DEFAULT_GROUP,
            cmd: BondListApi.DEFAULT_COMMAND,
            rqId: params.rqId,
            channel: BaseApi.DEFAULT_CHANNEL
        };

        try {
            const response = await this.makeBondListApiCall(payload);
            return {
                success: true,
                data: response,
                status: 200
            };
        } catch (error) {
            console.error('BondList API request failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Create a new instance with different configuration
     * @param config - New configuration
     * @returns New BondListApi instance
     */
    static createInstance(config: BaseApiConfig): BondListApi {
        return new BondListApi(config);
    }
}
