import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";
import AssetApi from "../../page/api/AssetApi";
import PositionsApi from "../../page/api/PositionsAPI";
import LoginApi from "../../page/api/LoginApi";
import { TEST_CONFIG, getENVConfigs, ENVConfig } from "../utils/testConfig";
import { ApiTestUtils } from "../../helpers/apiTestUtils";

// Enhanced helper function to save data to JSON file with user-specific naming
function saveToJsonFile(data: any, filename: string, userConfig?: ENVConfig) {
    try {
        const resultsDir = path.join(__dirname, "../../testAsset-results");
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        // Create user-specific filename if user config is provided
        const userPrefix = userConfig ? `${userConfig.user}_` : "";
        const userFilename = userPrefix + filename;

        const filePath = path.join(resultsDir, userFilename);
        const jsonData = {
            timestamp: new Date().toISOString(),
            user: userConfig ? {
                name: userConfig.name || userConfig.user,
                url: userConfig.url
            } : null,
            data: data
        };

        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
        console.log(`Results saved to: ${filePath}`);
    } catch (error) {
        console.error("Error saving to JSON file:", error);
    }
}

// Get all user configurations
const userConfigs = getENVConfigs();

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
        saveToJsonFile(cardData, "total_asset_all_results.json", userConfig);

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
        const normalResult: any = ApiTestUtils.normalAccountData(normalData);
        const normalPositionResults = await ApiTestUtils.processPositionData(positionsApi, baseParams, loginResponse.subAcntNormal);

        normalResult.gainLossNormal = normalPositionResults.gainLoss;
        normalResult.percentGainLossNormal = normalPositionResults.percentGainLoss;

        const normalHoldStockResults = await ApiTestUtils.getHoldStockData(positionsApi, baseParams, loginResponse.subAcntNormal);
        normalResult.holdStock = normalHoldStockResults;

        saveToJsonFile(normalResult, "normal_account_results.json", userConfig);

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
        const marginResult: any = ApiTestUtils.marginAccountData(marginData);

        const marginPositionResults = await ApiTestUtils.processPositionData(positionsApi, baseParams, loginResponse.subAcntMargin);
        marginResult.gainLossMargin = marginPositionResults.gainLoss;
        marginResult.percentGainLossMargin = marginPositionResults.percentGainLoss;

        const marginHoldStockResults = await ApiTestUtils.getHoldStockData(positionsApi, baseParams, loginResponse.subAcntMargin);
        marginResult.holdStock = marginHoldStockResults;

        saveToJsonFile(marginResult, "margin_account_results.json", userConfig);

        console.log(`=== Tests completed successfully for user: ${userConfig.user} ===\n`);

    } catch (error) {
        console.error(`Error testing user ${userConfig.user}:`, error);
        // Save error information
        const errorResult = {
            user: userConfig.user,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
        saveToJsonFile(errorResult, "error_results.json", userConfig);
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
        test.describe(`User: ${userConfig.user} (${userConfig.name || 'default'})`, () => {
            test("should successfully get total asset all with multiple accounts", async () => {
                await runAssetTestsForUser(userConfig);
            });
        });
    }

    // Fallback test for single user configuration (backward compatibility)
    if (userConfigs.length === 0) {
        test.describe("Fallback Single User Tests", () => {
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

            test("should successfully get total asset all (single user)", async () => {
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

                // Save results to JSON file (no user config for fallback)
                saveToJsonFile(cardData, "total_asset_all.json");
            });
        });
    }

    // Summary test to validate all multi-user results
    if (userConfigs.length > 0) {
        test("should validate multi-user test results summary", async () => {
            console.log("\n=== Multi-User Test Results Summary ===");

            const summaryResults = {
                totalUsers: userConfigs.length,
                successfulUsers: 0,
                failedUsers: 0,
                userResults: [] as any[]
            };

            for (const userConfig of userConfigs) {
                const userName = userConfig.user;
                const resultsDir = path.join(__dirname, "../../testAsset-results");

                // Check if user-specific result files exist
                const totalAssetFile = path.join(resultsDir, `${userName}_total_asset_all.json`);
                const normalAccountFile = path.join(resultsDir, `${userName}_normal_account.json`);
                const marginAccountFile = path.join(resultsDir, `${userName}_margin_account.json`);
                const errorFile = path.join(resultsDir, `${userName}_error.json`);

                const userResult = {
                    user: userName,
                    name: userConfig.name || 'default',
                    hasTotalAssetResults: fs.existsSync(totalAssetFile),
                    hasNormalAccountResults: fs.existsSync(normalAccountFile),
                    hasMarginAccountResults: fs.existsSync(marginAccountFile),
                    hasErrors: fs.existsSync(errorFile),
                    status: 'unknown' as 'success' | 'partial' | 'failed'
                };

                // Determine status based on file existence
                if (userResult.hasErrors) {
                    userResult.status = 'failed';
                    summaryResults.failedUsers++;
                } else if (userResult.hasTotalAssetResults && userResult.hasNormalAccountResults && userResult.hasMarginAccountResults) {
                    userResult.status = 'success';
                    summaryResults.successfulUsers++;
                } else if (userResult.hasTotalAssetResults || userResult.hasNormalAccountResults || userResult.hasMarginAccountResults) {
                    userResult.status = 'partial';
                    summaryResults.successfulUsers++; // Count as successful if at least some results exist
                } else {
                    summaryResults.failedUsers++;
                }

                summaryResults.userResults.push(userResult);

                console.log(`User ${userName}: ${userResult.status.toUpperCase()}`);
                console.log(`  - Total Asset Results: ${userResult.hasTotalAssetResults ? '✓' : '✗'}`);
                console.log(`  - Normal Account Results: ${userResult.hasNormalAccountResults ? '✓' : '✗'}`);
                console.log(`  - Margin Account Results: ${userResult.hasMarginAccountResults ? '✓' : '✗'}`);
                if (userResult.hasErrors) {
                    console.log(`  - Errors: ${userResult.hasErrors ? '⚠' : '✓'}`);
                }
                console.log("");
            }

            console.log("Summary:");
            console.log(`- Total Users: ${summaryResults.totalUsers}`);
            console.log(`- Successful: ${summaryResults.successfulUsers}`);
            console.log(`- Failed: ${summaryResults.failedUsers}`);
            console.log(`- Success Rate: ${((summaryResults.successfulUsers / summaryResults.totalUsers) * 100).toFixed(1)}%`);

            // Save summary results
            saveToJsonFile(summaryResults, "multi_user_test_summary.json");

            // Assertions
            expect(summaryResults.totalUsers).toBeGreaterThan(0);
            expect(summaryResults.successfulUsers).toBeGreaterThanOrEqual(0);
            expect(summaryResults.successfulUsers + summaryResults.failedUsers).toBe(summaryResults.totalUsers);

            // At least some users should have successful results
            expect(summaryResults.successfulUsers).toBeGreaterThanOrEqual(1);
        });
    }
});
