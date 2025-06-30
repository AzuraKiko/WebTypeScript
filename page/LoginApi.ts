import ApiHelper from "../helpers/ApiHelper";
// Interfaces for type safety
interface LoginPayload {
    user: string;
    pass: string;
    fcmToken: string;
}

interface LoginResponse {
    rc: number;
    http: number;
    msg: string;
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

export default class LoginApi {
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
     * Login API
     */
    async loginApi(username: string, password: string, fcmToken?: string): Promise<LoginResponse> {
        const loginApiHelper = new ApiHelper({ baseUrl: this.baseUrl });
        const loginPayload: LoginPayload = {
            user: username,
            pass: password,
            fcmToken: fcmToken || username,
        };

        const response = await loginApiHelper.post('/loginAdv', loginPayload);
        return response;
    }

    /**
     * Generate authentication (chỉ phương thức Matrix mới call API này)
     */
    async generateAuth(user: string, session: string): Promise<any> {
        const authApiHelper = new ApiHelper({ baseUrl: this.baseUrl });
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

        const response = await authApiHelper.post('/CoreServlet.pt', authPayload);
        return response;
    }

    /**
     * Get token OTP
     */
    async getToken(user: string, session: string, cif: string, rqId: string, value: string, type: string): Promise<any> {
        const authApiHelper = new ApiHelper({ baseUrl: this.baseUrl });
        let typeValue = "5";
        if (type === "OTP") {
            typeValue = "5";
        } else if (type === "Matrix") {
            typeValue = "3";
        }
        const getTokenPayload: GetTokenPayload = {
            group: "CORE",
            user: user,
            session: session,
            cmd: "getToken",
            rqId: rqId,
            channel: "WTS",
            data: {
                cif: cif,
                type: typeValue,
                value: value,
            },
        };

        const response = await authApiHelper.post('/CoreServlet.pt', getTokenPayload);
        return response;
    }
}