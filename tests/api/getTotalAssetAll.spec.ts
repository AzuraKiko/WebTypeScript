import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import AssetApi from "../../page/api/AssetApi";
import LoginApi from "../../page/api/LoginApi";
import { TEST_CONFIG } from "../utils/testConfig";
import { NumberValidator } from "../../helpers/validationUtils";

// Helper function to format percentage with 2 decimal places (standard rounding)
function formatPercentage(value: number): string {
    return value.toFixed(2);
}

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
                subAcntNo: "null",
                rqId: uuidv4(),
            });
            expect(response).toBeDefined();
            expect(response.status).toBe(200);
            const result: any = {};
            // Format money values with comma separators
            result.totalAsset = NumberValidator.formatNumberWithCommas(response.data.data.totAsst);
            result.widthdrawable = NumberValidator.formatNumberWithCommas(response.data.data.wdrawAvail);
            result.nav = NumberValidator.formatNumberWithCommas(response.data.data.realAsst);
            result.cash = NumberValidator.formatNumberWithCommas(response.data.data.cash);
            result.stock = NumberValidator.formatNumberWithCommas(response.data.data.stockValue);
            result.dividend = NumberValidator.formatNumberWithCommas(response.data.data.cashDiv);
            result.PineB = NumberValidator.formatNumberWithCommas(response.data.data.pineBndValue);

            // Calculate and format percentages with 2 decimal places
            result.percentCash = formatPercentage((response.data.data.cash / response.data.data.totAsst) * 100);
            result.percentStock = formatPercentage((response.data.data.stockValue / response.data.data.totAsst) * 100);
            result.percentDividend = formatPercentage((response.data.data.cashDiv / response.data.data.totAsst) * 100);
            result.percentPineB = formatPercentage((response.data.data.pineBndValue / response.data.data.totAsst) * 100);

            // Format debt and fee values with comma separators
            result.debt = NumberValidator.formatNumberWithCommas(response.data.data.debt);
            result.fee = NumberValidator.formatNumberWithCommas(response.data.data.fee);
            result.marginDebt = NumberValidator.formatNumberWithCommas(response.data.data.mgDebt);

            // Calculate and format fee and margin debt percentages with 2 decimal places
            result.percentFee = formatPercentage((response.data.data.fee / response.data.data.totAsst) * 100);
            result.percentMarginDebt = formatPercentage((response.data.data.mgDebt / response.data.data.totAsst) * 100);

            const responseNormalAccount = await assetApi.getTotalAssetAll({
                user: TEST_CONFIG.TEST_USER,
                session: loginResponse.session,
                acntNo: loginResponse.acntNo,
                subAcntNo: loginResponse.subAcntNormal,
                rqId: uuidv4(),
            });

            // Format account values with comma separators
            result.normalAccount = NumberValidator.formatNumberWithCommas(responseNormalAccount.data.data.realAsst);
            result.percentNormalAccount = formatPercentage((responseNormalAccount.data.data.realAsst / response.data.data.realAsst) * 100);

            const responseMarginAccount = await assetApi.getTotalAssetAll({
                user: TEST_CONFIG.TEST_USER,
                session: loginResponse.session,
                acntNo: loginResponse.acntNo,
                subAcntNo: loginResponse.subAcntMargin,
                rqId: uuidv4(),
            });

            result.marginAccount = NumberValidator.formatNumberWithCommas(responseMarginAccount.data.data.realAsst);
            result.percentMarginAccount = formatPercentage((responseMarginAccount.data.data.realAsst / response.data.data.realAsst) * 100);

            if (loginResponse.subAcntDerivative) {

                const responseDerivativeAccount = await assetApi.getTotalAssetAll({
                    user: TEST_CONFIG.TEST_USER,
                    session: loginResponse.session,
                    acntNo: loginResponse.acntNo,
                    subAcntNo: loginResponse.subAcntDerivative,
                    rqId: uuidv4(),
                });

                result.derivativeAccount = NumberValidator.formatNumberWithCommas(responseDerivativeAccount.data.data.realAsst);
                result.percentDerivativeAccount = formatPercentage((responseDerivativeAccount.data.data.realAsst / response.data.data.realAsst) * 100);
            }
            else {
                console.log("No derivative account");
            }

            if (loginResponse.subAcntFolio) {
                const responseFolioAccount = await assetApi.getTotalAssetAll({
                    user: TEST_CONFIG.TEST_USER,
                    session: loginResponse.session,
                    acntNo: loginResponse.acntNo,
                    subAcntNo: loginResponse.subAcntFolio,
                    rqId: uuidv4(),
                });

                result.folioAccount = NumberValidator.formatNumberWithCommas(responseFolioAccount.data.data.realAsst);
                result.percentFolioAccount = formatPercentage((responseFolioAccount.data.data.realAsst / response.data.data.realAsst) * 100);
            }
            else {
                console.log("No folio account");
            }

            console.log(result);
        });
    });
});
