import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";
import AssetApi from "../../page/api/AssetApi";
import PositionsApi from "../../page/api/Positions";
import LoginApi from "../../page/api/LoginApi";
import { TEST_CONFIG } from "../utils/testConfig";
import { ApiTestUtils } from "../../helpers/apiTestUtils";

// Helper function to save data to JSON file
function saveToJsonFile(data: any, filename: string) {
    try {
        const resultsDir = path.join(__dirname, "../../testAsset-results");
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        const filePath = path.join(resultsDir, filename);
        const jsonData = {
            timestamp: new Date().toISOString(),
            data: data
        };

        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
        console.log(`Results saved to: ${filePath}`);
    } catch (error) {
        console.error("Error saving to JSON file:", error);
    }
}

test.describe("AssetApi Tests", () => {
    test.describe.configure({ mode: "serial" });
    let loginApi: LoginApi;
    let assetApi: AssetApi;
    let positionsApi: PositionsApi;
    let loginResponse: any;

    assetApi = new AssetApi({ baseUrl: TEST_CONFIG.WEB_LOGIN_URL });
    positionsApi = new PositionsApi({ baseUrl: TEST_CONFIG.WEB_LOGIN_URL });
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
            const baseParams = {
                user: TEST_CONFIG.TEST_USER,
                session: loginResponse.session,
                acntNo: loginResponse.acntNo,
            };

            // Get main asset data
            const response = await assetApi.getTotalAssetAll({
                ...baseParams,
                subAcntNo: "null",
                rqId: uuidv4(),
            });

            expect(response).toBeDefined();
            expect(response.status).toBe(200);

            const data = response.data.data;
            const result: any = {
                ...ApiTestUtils.formatAssetData(data),
                ...ApiTestUtils.calculatePercentages(data),
            };

            // Prepare account lists for parallel processing
            const baseAccounts = [loginResponse.subAcntNormal, loginResponse.subAcntMargin];
            const optionalAccounts = [];

            if (loginResponse.subAcntDerivative) {
                optionalAccounts.push(loginResponse.subAcntDerivative);
            }
            if (loginResponse.subAcntFolio) {
                optionalAccounts.push(loginResponse.subAcntFolio);
            }

            const allAccounts = [...baseAccounts, ...optionalAccounts];
            const allPositionAccounts = ["", ...allAccounts];

            // Process all accounts and positions in parallel
            const [accountResults, positionResults] = await Promise.all([
                ApiTestUtils.processMultipleAccounts(assetApi, baseParams, allAccounts, data.realAsst),
                ApiTestUtils.processMultiplePositions(positionsApi, baseParams, allPositionAccounts)
            ]);

            // Assign account results
            result.normalAccount = accountResults[0].account;
            result.percentNormalAccount = accountResults[0].percent;
            result.marginAccount = accountResults[1].account;
            result.percentMarginAccount = accountResults[1].percent;

            let accountIndex = 2;
            if (loginResponse.subAcntDerivative) {
                result.derivativeAccount = accountResults[accountIndex].account;
                result.percentDerivativeAccount = accountResults[accountIndex].percent;
                accountIndex++;
            } else {
                console.log("No derivative account");
            }

            if (loginResponse.subAcntFolio) {
                result.folioAccount = accountResults[accountIndex].account;
                result.percentFolioAccount = accountResults[accountIndex].percent;
            } else {
                console.log("No folio account");
            }

            // Assign position results
            result.gainLoss = positionResults[0].gainLoss;
            result.percentGainLoss = positionResults[0].percentGainLoss;
            result.gainLossNormal = positionResults[1].gainLoss;
            result.percentGainLossNormal = positionResults[1].percentGainLoss;
            result.gainLossMargin = positionResults[2].gainLoss;
            result.percentGainLossMargin = positionResults[2].percentGainLoss;

            let positionIndex = 3;
            if (loginResponse.subAcntDerivative) {
                result.gainLossDerivative = positionResults[positionIndex].gainLoss;
                result.percentGainLossDerivative = positionResults[positionIndex].percentGainLoss;
                positionIndex++;
            } else {
                console.log("No derivative account");
            }

            if (loginResponse.subAcntFolio) {
                result.gainLossFolio = positionResults[positionIndex].gainLoss;
                result.percentGainLossFolio = positionResults[positionIndex].percentGainLoss;
            } else {
                console.log("No folio account");
            }

            // Build and log card data
            const cardData = ApiTestUtils.buildCardData(result);
            ApiTestUtils.logCardData(cardData);

            // Save results to JSON file
            saveToJsonFile(cardData, "total_asset_all_results.json");
        });

        test("2. get info Normal account", async () => {
            const baseParams = {
                user: TEST_CONFIG.TEST_USER,
                session: loginResponse.session,
                acntNo: loginResponse.acntNo,
            };

            const response = await assetApi.getTotalAssetAll({
                ...baseParams,
                subAcntNo: loginResponse.subAcntNormal,
                rqId: uuidv4(),
            });

            expect(response).toBeDefined();
            expect(response.status).toBe(200);

            const data = response.data.data;
            const result: any = ApiTestUtils.normalAccountData(data);
            const positionResults = await ApiTestUtils.processPositionData(positionsApi, baseParams, loginResponse.subAcntNormal);

            result.gainLossNormal = positionResults.gainLoss;
            result.percentGainLossNormal = positionResults.percentGainLoss;

            console.log("--------------------------------");
            console.log(result);

            const holdStockResults = await ApiTestUtils.getHoldStockData(positionsApi, baseParams, loginResponse.subAcntNormal);
            result.holdStock = holdStockResults;

            // Save results to JSON file
            saveToJsonFile(result, "normal_account_results.json");

        });

        test("3. get info Margin account", async () => {
            const baseParams = {
                user: TEST_CONFIG.TEST_USER,
                session: loginResponse.session,
                acntNo: loginResponse.acntNo,
            };

            const response = await assetApi.getTotalAssetAll({
                ...baseParams,
                subAcntNo: loginResponse.subAcntMargin,
                rqId: uuidv4(),
            });

            expect(response).toBeDefined();
            expect(response.status).toBe(200);

            const data = response.data.data;
            const result: any = ApiTestUtils.marginAccountData(data);

            const positionResults = await ApiTestUtils.processPositionData(positionsApi, baseParams, loginResponse.subAcntMargin);
            result.gainLossMargin = positionResults.gainLoss;
            result.percentGainLossMargin = positionResults.percentGainLoss;

            console.log("--------------------------------");
            console.log(result);

            const holdStockResults = await ApiTestUtils.getHoldStockData(positionsApi, baseParams, loginResponse.subAcntMargin);
            result.holdStock = holdStockResults;

            // Save results to JSON file
            saveToJsonFile(result, "margin_account_results.json");

        });
    });
});
