import ApiHelper from "../../helpers/ApiHelper";

interface AssetPayload {
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

export default class AssetApi {
    private baseUrl: string;
    private apiHelper: ApiHelper;

    constructor(baseUrl: string, timeout?: number) {
        this.baseUrl = baseUrl;
        if (timeout) {
            this.apiHelper = new ApiHelper({ baseUrl: this.baseUrl, timeout: timeout });
        } else {
            this.apiHelper = new ApiHelper({ baseUrl: this.baseUrl });
        }
    }

    /**
     * Get total asset all
     */
    async getTotalAssetAll(
        user: string,
        session: string,
        acntNo: string,
        subAcntNo: string,
        rqId: string,
    ): Promise<any> {
        const assetApiHelper = new ApiHelper({ baseUrl: this.baseUrl });

        const assetPayload: AssetPayload = {
            group: "CORE",
            user: user,
            session: session,
            cmd: "getTotalAssetAll",
            rqId: rqId,
            channel: "WTS",
            data: {
                acntNo,
                subAcntNo,
            },
        };

        const response = await assetApiHelper.post(
            '/CoreServlet.pt',
            JSON.stringify(assetPayload),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                },
            }
        );

        return response;
    }
}