import ApiHelper from "../helpers/ApiHelper";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

let env = process.env.NODE_ENV?.toUpperCase() || "PROD";
if (env === "PRODUCTION") env = "PROD";
const WS_BASE_URL = process.env[`${env}_WEB_LOGIN_URL`];

const Env = {
    WS_BASE_URL: WS_BASE_URL,
    K6_DURATION: "10s",
    K6_VUS: 1,
};

// Interfaces for type safety
interface LoginPayload {
    user: string;
    pass: string;
    fcmToken: string;
}

interface LoginResponse {
    error?: string;
    data?: {
        session: string;
        cif: string;
        custInfo?: {
            normal?: Array<{
                acntNo: string;
                subAcntNo: string;
            }>;
        };
    };
}

interface AuthPayload {
    group: string;
    cmd: string;
    channel: string;
    user: string;
    session: string;
    data: {
        trdType: string;
        authType: string;
        positionNo: string;
    };
}

interface GetTokenPayload {
    group: string;
    user: string;
    session: string;
    cmd: string;
    rqId: string;
    channel: string;
    data: {
        cif: string;
        type: string;
        value: string;
    };
}

interface NewOrderPayload {
    group: string;
    user: string;
    session: string;
    cmd: string;
    rqId: string;
    channel: string;
    type: string;
    token: string;
    data: {
        acntNo: string;
        subAcntNo: string;
        symbol: string;
        ordrQty: string;
        ordrUntprc: string;
        ordrTrdTp: string;
        buySelTp: string;
        oddOrdrYn: string;
        signStr: string;
    };
}

interface OrderParams {
    symbol: string;
    ordrQty: string;
    ordrUntprc: string;
    ordrTrdTp: string;
    buySelTp: string;
    oddOrdrYn: string;
    privateKey: string;
}

export default class CommonApi {
    private apiHelper: ApiHelper;
    private baseUrl: string;

    constructor(apiHelper: ApiHelper) {
        this.apiHelper = apiHelper;
        this.baseUrl = Env.WS_BASE_URL || '';
    }

    /**
     * Generate SHA-256 hash
     */
    private sha256Hash(text: string): Buffer {
        return crypto.createHash("sha256").update(text).digest();
    }

    /**
     * Convert buffer to base64 string
     */
    private base64Stringify(buffer: Buffer): string {
        return buffer.toString("base64");
    }

    /**
     * Generate signature string for order
     */
    private generateSignStr(
        acntNo: string,      // Số tài khoản
        subAcntNo: string,   // Số tài khoản phụ
        symbol: string,      // Mã chứng khoán/symbol
        ordrQty: string,     // Số lượng đặt lệnh
        ordrUntprc: string,  // Giá đặt lệnh
        ordrTrdTp: string,   // Loại giao dịch
        buySelTp: string,    // Loại mua/bán
        oddOrdrYn: string,   // Có phải lệnh lẻ không
        uuid: string,        // ID duy nhất
        privateKey: string   // Khóa bí mật
    ): string {
        // Nối tất cả tham số thành một chuỗi
        const text = acntNo + subAcntNo + symbol + ordrQty + ordrUntprc + ordrTrdTp + buySelTp + oddOrdrYn + uuid + privateKey;

        // Tạo hash SHA-256
        const hash = this.sha256Hash(text);

        // Chuyển đổi sang Base64
        const signStr = this.base64Stringify(hash);

        return signStr;
    }

    /**
     * Login API
     */
    async loginApi(username: string, password: string, fcmToken?: string): Promise<LoginResponse> {
        const loginUrl = `${this.baseUrl}/loginAdv`;
        const loginPayload: LoginPayload = {
            user: username,
            pass: password,
            fcmToken: fcmToken || username,
        };

        const response = await this.apiHelper.post(loginUrl, loginPayload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response;
    }

    /**
     * Generate authentication
     */
    async generateAuth(user: string, session: string): Promise<any> {
        const authUrl = `${this.baseUrl}/CoreServlet.pt`;
        const authPayload: AuthPayload = {
            group: "CORE",
            cmd: "generateAUTH",
            channel: "WTS",
            user: user,
            session: session,
            data: {
                trdType: "1",
                authType: "2",
                positionNo: "3",
            },
        };

        const response = await this.apiHelper.post(authUrl, authPayload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response;
    }

    /**
     * Get token
     */
    async getToken(user: string, session: string, cif: string, rqId: string): Promise<any> {
        const authUrl = `${this.baseUrl}/CoreServlet.pt`;
        const getTokenPayload: GetTokenPayload = {
            group: "CORE",
            user: user,
            session: session,
            cmd: "getToken",
            rqId: rqId,
            channel: "WTS",
            data: {
                cif: cif,
                type: "3",
                value: "9uCh4qxBlFqap/+KiqoM68EqO8yYGpKa1c+BCgkOEa4=",
            },
        };

        const response = await this.apiHelper.post(authUrl, getTokenPayload, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                Accept: "*/*",
                "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
                Connection: "keep-alive",
            },
        });
        return response;
    }

    /**
     * Place new order
     */
    async placeNewOrder(
        user: string,
        session: string,
        acntNo: string,
        subAcntNo: string,
        orderParams: OrderParams,
        rqId: string,
        token: string
    ): Promise<any> {
        const authUrl = `${this.baseUrl}/CoreServlet.pt`;

        const signStr = this.generateSignStr(
            acntNo,
            subAcntNo,
            orderParams.symbol,
            orderParams.ordrQty,
            orderParams.ordrUntprc,
            orderParams.ordrTrdTp,
            orderParams.buySelTp,
            orderParams.oddOrdrYn,
            rqId,
            orderParams.privateKey
        );

        const newOrderPayload: NewOrderPayload = {
            group: "CORE",
            user: user,
            session: session,
            cmd: "NewOrder",
            rqId: rqId,
            channel: "WTS",
            type: "3",
            token: token,
            data: {
                acntNo,
                subAcntNo,
                symbol: orderParams.symbol,
                ordrQty: orderParams.ordrQty,
                ordrUntprc: orderParams.ordrUntprc,
                ordrTrdTp: orderParams.ordrTrdTp,
                buySelTp: orderParams.buySelTp,
                oddOrdrYn: orderParams.oddOrdrYn,
                signStr,
            },
        };

        const response = await this.apiHelper.post(authUrl, newOrderPayload, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
        });
        return response;
    }

    /**
     * Get list of all stocks
     */
    async getListAllStock(): Promise<any> {
        const response = await this.apiHelper.get(`${this.baseUrl}/getlistallstock`);
        return response;
    }

    /**
     * Complete trading flow - login, auth, get token, and place order
     */
    async completeTradingFlow(
        username: string,
        password: string,
        orderParams: OrderParams
    ): Promise<{
        loginSuccess: boolean;
        orderSuccess: boolean;
        loginData?: LoginResponse;
        orderResponse?: any;
        error?: string;
    }> {
        try {
            // Step 1: Login
            const loginData = await this.loginApi(username, password);

            if (loginData.error) {
                return {
                    loginSuccess: false,
                    orderSuccess: false,
                    error: `Login failed: ${loginData.error}`
                };
            }

            const session = loginData.data!.session;
            const cif = loginData.data!.cif;
            const user = username;
            const acntInfo = loginData.data!.custInfo?.normal?.find((a: any) =>
                a.subAcntNo.startsWith("N")
            );

            if (!acntInfo || !acntInfo.acntNo || !acntInfo.subAcntNo) {
                return {
                    loginSuccess: true,
                    orderSuccess: false,
                    loginData,
                    error: "Account information not found"
                };
            }

            const acntNo = acntInfo.acntNo;
            const subAcntNo = acntInfo.subAcntNo;

            const rqId = uuidv4();

            // Step 2: Generate Auth
            await this.generateAuth(user, session);

            // Step 3: Get Token
            await this.getToken(user, session, cif, rqId);

            // Step 4: Place Order
            const orderResponse = await this.placeNewOrder(
                user,
                session,
                acntNo,
                subAcntNo,
                orderParams,
                rqId,
                "9uCh4qxBlFqap/+KiqoM68EqO8yYGpKa1c+BCgkOEa4="
            );

            return {
                loginSuccess: true,
                orderSuccess: true,
                loginData,
                orderResponse
            };

        } catch (error) {
            return {
                loginSuccess: false,
                orderSuccess: false,
                error: `Trading flow failed: ${error}`
            };
        }
    }
}