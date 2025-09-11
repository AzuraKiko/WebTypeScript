import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import AssetApi from "../../page/api/AssetApi";
import PositionsApi from "../../page/api/PositionsApi";
import LoginApi from "../../page/api/LoginApi";
import { getENVConfigs, ENVConfig } from "../utils/testConfig";
import { ApiAssetUtils } from "../../helpers/apiAssetUtils";
import { saveENVResults } from "../utils/testConfig";

// Get all user configurations
const userConfigs = getENVConfigs();
console.log("userConfigs", userConfigs);

// Common function to process asset data for any test scenario
async function processAssetData(
    assetApi: AssetApi,
    positionsApi: PositionsApi,
    loginResponse: any,
    baseParams: any
) {
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
        ...ApiAssetUtils.formatAssetData(data),
        ...ApiAssetUtils.calculatePercentages(data),
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
        ApiAssetUtils.processMultipleAccounts(assetApi, baseParams, allAccounts, data.realAsst),
        ApiAssetUtils.processMultiplePositions(positionsApi, baseParams, allPositionAccounts)
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

    // Calculate total account sum based on available sub-accounts
    const calculateTotalAccountValue = (result: any, loginResponse: any): number => {
        const baseAccounts = [
            ApiAssetUtils.safeNumber(result.normalAccount),
            ApiAssetUtils.safeNumber(result.marginAccount)
        ];

        const optionalAccounts = [];
        if (loginResponse.subAcntDerivative) {
            optionalAccounts.push(ApiAssetUtils.safeNumber(result.derivativeAccount));
        }
        if (loginResponse.subAcntFolio) {
            optionalAccounts.push(ApiAssetUtils.safeNumber(result.folioAccount));
        }

        return baseAccounts.concat(optionalAccounts).reduce((sum, value) => sum + value, 0);
    };

    const totalAccountValue = calculateTotalAccountValue(data, loginResponse);
    const expectedNAV = ApiAssetUtils.safeNumber(data.nav);
    expect(totalAccountValue).toEqual(expectedNAV);

    const sumAsset = ApiAssetUtils.safeNumber(data.cash) - ApiAssetUtils.safeNumber(data.cashDiv) +
        (ApiAssetUtils.safeNumber(data.stockValue) - ApiAssetUtils.safeNumber(data.righStockValue)) +
        (ApiAssetUtils.safeNumber(data.cashDiv) + ApiAssetUtils.safeNumber(data.righStockValue)) +
        ApiAssetUtils.safeNumber(data.pineBndValue);
    const expectedTotalAsset = ApiAssetUtils.safeNumber(data.totAsst);
    expect(sumAsset).toEqual(expectedTotalAsset);

    const sumDebt = ApiAssetUtils.safeNumber(data.fee) +
        (ApiAssetUtils.safeNumber(data.mgDebt) + ApiAssetUtils.safeNumber(data.exptDisbm));
    const expectedTotalDebt = ApiAssetUtils.safeNumber(data.debt);
    expect(sumDebt).toEqual(expectedTotalDebt);

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

    return result;
}

// Helper function to run tests for a specific user
async function runAssetTestsForUser(userConfig: ENVConfig) {
    console.log(`\n=== Starting tests for user: ${userConfig.user} ===`);

    // Create API instances for this user
    const assetApi = new AssetApi({ baseUrl: userConfig.url });
    const positionsApi = new PositionsApi({ baseUrl: userConfig.url });
    const loginApi = new LoginApi(userConfig.url);

    let loginResponse: any;

    try {
        // Login for this user
        loginResponse = await loginApi.loginSuccess("Matrix");
        console.log(`Login successful for user: ${userConfig.user}`);

        const baseParams = {
            user: userConfig.user,
            session: loginResponse.session,
            acntNo: loginResponse.acntNo,
        };

        // Test 1: Get total asset all
        console.log("Running total asset test...");
        const result = await processAssetData(assetApi, positionsApi, loginResponse, baseParams);

        // Build and log card data
        const cardData = ApiAssetUtils.buildOverviewData(result);
        ApiAssetUtils.logOverviewData(cardData);

        // Save results to JSON file
        saveENVResults(userConfig, cardData, "total_asset_all");

        // Test 2: Normal account details
        console.log("Running normal account test...");
        const normalResponse = await assetApi.getTotalAssetAll({
            ...baseParams,
            subAcntNo: loginResponse.subAcntNormal,
            rqId: uuidv4(),
        });

        expect(normalResponse).toBeDefined();
        expect(normalResponse.status).toBe(200);

        const normalData = normalResponse.data.data;
        const normalResult: any = ApiAssetUtils.normalAccountData(normalData);
        const normalPositionResults = await ApiAssetUtils.processPositionData(positionsApi, baseParams, loginResponse.subAcntNormal);

        // Fix: Use raw numeric values from API response instead of formatted strings
        const sumNormalAsset = (ApiAssetUtils.safeNumber(normalData.cash) - ApiAssetUtils.safeNumber(normalData.cashDiv)) +
            (ApiAssetUtils.safeNumber(normalData.stockValue) - ApiAssetUtils.safeNumber(normalData.righStockValue)) +
            ApiAssetUtils.safeNumber(normalData.pineBndValue);
        const expectedTotalNormalAsset = ApiAssetUtils.safeNumber(normalData.totAsst);
        expect(sumNormalAsset).toEqual(expectedTotalNormalAsset);

        const sumCash = ApiAssetUtils.safeNumber(normalData.cash) +
            ApiAssetUtils.safeNumber(normalData.advanceAvail) +
            ApiAssetUtils.safeNumber(normalData.cashDiv) -
            ApiAssetUtils.safeNumber(normalData.buyT0) +
            ApiAssetUtils.safeNumber(normalData.ipCash) -
            ApiAssetUtils.safeNumber(normalData.drvtOdFee);
        const expectedTotalCash = ApiAssetUtils.safeNumber(normalData.cash) - ApiAssetUtils.safeNumber(normalData.cashDiv);
        expect(sumCash).toEqual(expectedTotalCash);

        const sumStock = ApiAssetUtils.safeNumber(normalData.tavlStockValue) +
            ApiAssetUtils.safeNumber(normalData.ptavlStockValue) +
            ApiAssetUtils.safeNumber(normalData.tartStockValue) +
            ApiAssetUtils.safeNumber(normalData.ptartStockValue) +
            ApiAssetUtils.safeNumber(normalData.righStockValue) +
            ApiAssetUtils.safeNumber(normalData.rcvStockValue);
        const expectedTotalStock = ApiAssetUtils.safeNumber(normalData.stockValue) - ApiAssetUtils.safeNumber(normalData.righStockValue);
        expect(sumStock).toEqual(expectedTotalStock);

        const expectedTotalPineB = ApiAssetUtils.safeNumber(normalData.pineBndValue);
        expect(expectedTotalPineB).toBeGreaterThanOrEqual(0); // Basic validation

        const sumDebt = ApiAssetUtils.safeNumber(normalData.smsFee) + ApiAssetUtils.safeNumber(normalData.depoFee);
        const expectedTotalDebt = ApiAssetUtils.safeNumber(normalData.debt);
        expect(sumDebt).toEqual(expectedTotalDebt);

        normalResult.gainLossNormal = normalPositionResults.gainLoss;
        normalResult.percentGainLossNormal = normalPositionResults.percentGainLoss;

        const normalHoldStockResults = await ApiAssetUtils.getHoldStockData(positionsApi, baseParams, loginResponse.subAcntNormal);
        normalResult.holdStock = normalHoldStockResults;

        // Build and log card data
        const cardDataNormal = ApiAssetUtils.buildNormalAccountData(normalResult);
        ApiAssetUtils.logNormalAccountData(cardDataNormal);

        // Save results to JSON file
        saveENVResults(userConfig, cardData, "normal_account");

        // Test 3: Margin account details
        console.log("Running margin account test...");
        const marginResponse = await assetApi.getTotalAssetAll({
            ...baseParams,
            subAcntNo: loginResponse.subAcntMargin,
            rqId: uuidv4(),
        });

        expect(marginResponse).toBeDefined();
        expect(marginResponse.status).toBe(200);

        const marginData = marginResponse.data.data;
        const marginResult: any = ApiAssetUtils.marginAccountData(marginData);

        const marginPositionResults = await ApiAssetUtils.processPositionData(positionsApi, baseParams, loginResponse.subAcntMargin);
        marginResult.gainLossMargin = marginPositionResults.gainLoss;
        marginResult.percentGainLossMargin = marginPositionResults.percentGainLoss;

        const marginHoldStockResults = await ApiAssetUtils.getHoldStockData(positionsApi, baseParams, loginResponse.subAcntMargin);
        marginResult.holdStock = marginHoldStockResults;

        // Build and log card data
        const cardDataMargin = ApiAssetUtils.buildMarginAccountData(marginResult);
        ApiAssetUtils.logMarginAccountData(cardDataMargin);

        // Save results to JSON file
        saveENVResults(userConfig, cardDataMargin, "margin_account");

        console.log(`=== Tests completed successfully for user: ${userConfig.user} ===\n`);

    } catch (error) {
        console.error(`Error testing user ${userConfig.user}:`, error);
        // Save error information
        const errorResult = {
            user: userConfig.user,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
        saveENVResults(userConfig, errorResult, "error");
        throw error;
    }
}

// Validate that we have user configurations
if (userConfigs.length === 0) {
    console.warn("No user configurations found. Please set up UAT_CONFIGS environment variable.");
}

test.describe("AssetApi Tests - Multi User Support", () => {
    test.describe.configure({ mode: "serial" });

    // Generate dynamic tests for each user configuration
    for (const userConfig of userConfigs) {
        test.describe(`User: ${userConfig.user}`, () => {
            test("should successfully get total asset all with multiple accounts", async () => {
                await runAssetTestsForUser(userConfig);
            });
        });
    }
});
