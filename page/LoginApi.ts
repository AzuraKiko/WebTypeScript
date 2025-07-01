import ApiHelper from "../helpers/ApiHelper";
import OrderApi from "./OrderApi";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
import { getMatrixCodes } from "./Matrix";

dotenv.config({ path: ".env" });

let env = process.env.NODE_ENV?.toUpperCase() || "PROD";
if (env === "PRODUCTION") env = "PROD";
const WS_BASE_URL = process.env[`${env}_WEB_LOGIN_URL`];
const PROD_TEST_USER = process.env[`${env}_TEST_USER`];
const PROD_TEST_PASSWORD = process.env[`${env}_TEST_PASS_ENCRYPT`];
const PROD_PASSWORD = process.env[`${env}_TEST_PASS`];
const Env: any = {
    WS_BASE_URL: WS_BASE_URL,
    TEST_USERNAME: PROD_TEST_USER,
    TEST_PASSWORD: PROD_TEST_PASSWORD,
    TEST_FCM_TOKEN: PROD_TEST_USER,
    PASSWORD: PROD_PASSWORD,
};

// 01.LO, 02.ATO,03.ATC,04.MP,05.MTL,06.MOK,07.MAK, 08.PLO (Post Close), 09. Buy-in
const OTP: string = "563447";

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

    /**
    * Login success
    */
    async loginSuccess(typeAuth: string) {
        let orderApi: OrderApi = new OrderApi(Env.WS_BASE_URL);
        let session: string = "";
        let cif: string = "";
        let token: string = "";
        let acntNo: string = "";
        let subAcntNo: string = "";
        typeAuth = typeAuth;

        const loginResponse = await this.loginApi(
            Env.TEST_USERNAME as string,
            Env.TEST_PASSWORD as string,
            Env.TEST_FCM_TOKEN as string
        );
        if (loginResponse.data) {
            session = loginResponse.data.session;
            cif = loginResponse.data.cif;
            // Get account information
            if (loginResponse.data.custInfo?.normal && loginResponse.data.custInfo.normal.length > 0) {
                const account: any = loginResponse.data.custInfo.normal.find((it: any) => it.subAcntNo.includes("N"));
                acntNo = account?.acntNo;
                subAcntNo = account?.subAcntNo;
            }
        } else {
            throw new Error("Login failed, no data returned.");
        }

        let tokenResponse: any;
        // Generate auth and get token
        if (typeAuth === "OTP") {
            tokenResponse = await this.getToken(
                Env.TEST_USERNAME as string,
                session,
                cif,
                uuidv4(),
                OTP,
                typeAuth
            );
            if (tokenResponse.rc === 1 && tokenResponse.data?.token) {
                token = tokenResponse.data.token;
            }
        } else if (typeAuth === "Matrix") {
            const authResponse = await this.generateAuth(Env.TEST_USERNAME as string, session);
            console.log('authResponse:', authResponse.data);

            if (authResponse.rc === 1) {
                const matrixGen: string[] = Object.values(authResponse.data);
                console.log('matrixGen:', matrixGen);
                let matrixAuth: string = getMatrixCodes(matrixGen).join('');
                let value: string = "";
                if (env === "PROD") {
                    value = orderApi.genMatrixAuth(matrixAuth);
                } else if (env === "UAT") {
                    value = "9uCh4qxBlFqap/+KiqoM68EqO8yYGpKa1c+BCgkOEa4=";
                }
                tokenResponse = await this.getToken(
                    Env.TEST_USERNAME as string,
                    session,
                    cif,
                    uuidv4(),
                    value,
                    typeAuth
                );
                if (tokenResponse.rc === 1 && tokenResponse.data?.token) {
                    token = tokenResponse.data.token;
                }
            }
        }
        return { session, cif, token, acntNo, subAcntNo };
    }
}