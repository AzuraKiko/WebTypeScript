import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import AssetApi from "../../page/api/AssetApi";
import LoginApi from "../../page/api/LoginApi";
import { TEST_CONFIG } from "../utils/testConfig";
import { loggerSimple, logTable, logSimple } from "../../helpers/logger";

test.describe("AssetApi Tests", () => {
    test.describe.configure({ mode: "serial" });
    let loginApi: LoginApi;
    let assetApi: AssetApi;
    let loginResponse: any;

    assetApi = new AssetApi({ baseUrl: TEST_CONFIG.WEB_LOGIN_URL });
    loginApi = new LoginApi(TEST_CONFIG.WEB_LOGIN_URL);

    test.beforeAll(async () => {
        try {
            loginResponse = await loginApi.loginSuccess("Matrix");
            console.log("Login session established");
        } catch (error) {
            console.error("Failed to establish login session:", error);
        }
    });

    test.describe("getTotalAssetAll method", () => {
        test("1. should successfully get total asset all", async () => {
            const response = await assetApi.getTotalAssetAll({
                user: TEST_CONFIG.TEST_USER,
                session: loginResponse.session,
                acntNo: loginResponse.acntNo,
                subAcntNo: loginResponse.subAcntNo,
                rqId: uuidv4(),
            });
            expect(response).toBeDefined();
            expect(response.status).toBe(200);
            const result: any = {};
            result.tongTaiSan = response.data.data.totAsst;
            result.tienDuocRut = response.data.data.wdrawAvail;
            result.balance = response.data.data.balance;
            result.wdrawAvail = response.data.data.wdrawAvail;


        });
    });
});
