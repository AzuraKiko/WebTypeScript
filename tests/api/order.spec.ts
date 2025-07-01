import { test, expect } from "@playwright/test";
import LoginApi from "../../page/LoginApi";
import OrderApi from "../../page/OrderApi";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: ".env" });

// Environment setup
const env = process.env.NODE_ENV?.toUpperCase() === "PRODUCTION" ? "PROD" : (process.env.NODE_ENV?.toUpperCase() || "PROD");
const WS_BASE_URL = process.env[`${env}_WEB_LOGIN_URL`];
const PROD_TEST_USER = process.env[`${env}_TEST_USER`];
const PROD_TEST_PASSWORD = process.env[`${env}_TEST_PASS_ENCRYPT`];
const PROD_PASSWORD = process.env[`${env}_TEST_PASS`];

const Env = {
    WS_BASE_URL,
    TEST_USERNAME: PROD_TEST_USER,
    TEST_PASSWORD: PROD_TEST_PASSWORD,
    TEST_FCM_TOKEN: PROD_TEST_USER,
    PASSWORD: PROD_PASSWORD,
} as const;

// Constants
const PRIVATE_KEY = "a06ab782-118c-4819-a3c5-7b958ba85f7e";
const DEFAULT_DELAY = 100;
const PERFORMANCE_TIMEOUT = 10000;

// Test data constants
const ORDER_SYMBOLS = {
    VALID: "CEO",
    INVALID: "CEO1",
    FUTURES: "CFPT2501"
} as const;

const ORDER_TYPES = {
    BUY: "1",
    SELL: "2",
    NORMAL: "01"
} as const;

// Shared session data
let sharedLoginData: {
    session: string;
    token: string;
    acntNo: string;
    subAcntNo: string;
} | null = null;

// Helper functions
const createFreshInstances = () => ({
    loginApi: new LoginApi(Env.WS_BASE_URL as string),
    orderApi: new OrderApi(Env.WS_BASE_URL as string)
});

const getLoginSession = async () => {
    if (!sharedLoginData) {
        const { loginApi } = createFreshInstances();
        const loginResponse = await loginApi.loginSuccess("Matrix");
        sharedLoginData = {
            session: loginResponse.session,
            token: loginResponse.token,
            acntNo: loginResponse.acntNo,
            subAcntNo: loginResponse.subAcntNo
        };
    }
    return sharedLoginData;
};

const delay = (ms: number = DEFAULT_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

// Common order parameters factory
const createOrderParams = (overrides: Partial<any> = {}) => ({
    symbol: ORDER_SYMBOLS.VALID,
    ordrQty: "100",
    ordrUntprc: "12500",
    ordrTrdTp: ORDER_TYPES.NORMAL,
    buySelTp: ORDER_TYPES.BUY,
    oddOrdrYn: "N",
    privateKey: PRIVATE_KEY,
    ...overrides
});

// Helper function for placing orders with error handling
const placeOrderWithErrorHandling = async (orderParams: any, overrides: Partial<any> = {}) => {
    const { orderApi } = createFreshInstances();
    const loginData = await getLoginSession();
    const { session, token, acntNo, subAcntNo } = loginData;

    return orderApi.placeNewOrder(
        Env.TEST_USERNAME as string,
        overrides.session || session,
        acntNo,
        subAcntNo,
        orderParams,
        uuidv4(),
        overrides.token || token
    );
};

// Test helper for successful order expectations
const expectSuccessfulOrder = (response: any) => {
    expect(response).toBeDefined();
    expect(response.rc).toBe(1);
    expect(response.data.ordrNo).toBeDefined();
};

// Test helper for failed order expectations
const expectFailedOrder = (response: any, expectedMessage?: string) => {
    expect(response).toBeDefined();
    expect(response.rc).toBe(-1);
    if (expectedMessage) {
        expect(response.data.message).toBe(expectedMessage);
    }
};

test.describe("OrderApi Tests", () => {
    test.beforeAll(async () => {
        try {
            await getLoginSession();
            console.log("Shared login session established");
        } catch (error) {
            console.error("Failed to establish shared login session:", error);
        }
    });

    test.afterAll(async () => {
        sharedLoginData = null;
    });

    test.describe("getListAllStock method", () => {
        test("1. should successfully get list of all stocks", async () => {
            const { orderApi } = createFreshInstances();
            const response = await orderApi.getListAllStock();

            expect(response).toBeDefined();
            expect(Array.isArray(response)).toBe(true);
        });
    });

    test.describe("placeNewOrder method", () => {
        test("2. should successfully place a buy order", async () => {
            const orderParams = createOrderParams();
            const response = await placeOrderWithErrorHandling(orderParams);
            expectSuccessfulOrder(response);
        });

        test("3. should successfully place a sell order", async () => {
            await delay();
            const orderParams = createOrderParams({ buySelTp: ORDER_TYPES.SELL });
            const response = await placeOrderWithErrorHandling(orderParams);
            expectSuccessfulOrder(response);
        });

        test("4. should handle order with invalid symbol", async () => {
            await delay();
            const orderParams = createOrderParams({
                symbol: ORDER_SYMBOLS.INVALID,
                ordrQty: "1",
                ordrUntprc: "17500",
                oddOrdrYn: "Y"
            });

            const response = await placeOrderWithErrorHandling(orderParams);
            expect(response).toBeDefined();
            expect(response.data.message).toBe("Please check SYMBOL.");
        });

        test("5. should handle order with invalid quantity (quantity > holding)", async () => {
            await delay();
            const orderParams = createOrderParams({
                ordrQty: "1000",
                ordrUntprc: "17500",
                buySelTp: ORDER_TYPES.SELL
            });

            const response = await placeOrderWithErrorHandling(orderParams);
            expect(response).toBeDefined();
            expect(response.data.message).toBe("order available sell quantity has been exceeded.");
        });

        test("6. should handle order with invalid price", async () => {
            await delay();
            const orderParams = createOrderParams({
                symbol: ORDER_SYMBOLS.FUTURES,
                ordrUntprc: "2200"
            });

            const response = await placeOrderWithErrorHandling(orderParams);
            expectFailedOrder(response, "Order price is greater than upper limit.");
        });

        test("7. should handle order with invalid session", async () => {
            await delay();
            const orderParams = createOrderParams({
                symbol: ORDER_SYMBOLS.FUTURES,
                ordrUntprc: "500"
            });

            const response = await placeOrderWithErrorHandling(orderParams, {
                session: "76qjXSCN1xpJYYRpKaLmVMD8D3PxFQiy2NRKws2sCw9RukmzVDyeJUN9tupNxHAS"
            });

            expect(response).toBeDefined();
            expect(response.rc).toBe("-1");
            expect(response.data.message).toBe(`Servlet.exception.SessionException: Session ${Env.TEST_USERNAME}is not correct.`);
        });

        test("8. should handle order with invalid token", async () => {
            await delay();
            const orderParams = createOrderParams({
                symbol: ORDER_SYMBOLS.FUTURES,
                ordrUntprc: "500"
            });

            const response = await placeOrderWithErrorHandling(orderParams, {
                token: "94c0f7f3eeded133d233c21902bd3a5bb282e11735093b62f5ed1cd36ac67b9b"
            });

            expectFailedOrder(response, "Not match Certification value as 2FA.");
        });

        test("10. should handle order with odd lot", async () => {
            await delay();
            const orderParams = createOrderParams({
                symbol: ORDER_SYMBOLS.FUTURES,
                ordrQty: "15",
                ordrUntprc: "10",
                oddOrdrYn: "Y"
            });

            const response = await placeOrderWithErrorHandling(orderParams);
            expectSuccessfulOrder(response);
        });
    });

    test.describe("Integration Tests", () => {
        test("11. should complete full order flow: login -> get stocks -> place order", async () => {
            const { orderApi } = createFreshInstances();

            // Get list of stocks
            const stocksResponse = await orderApi.getListAllStock();
            expect(stocksResponse).toBeDefined();
            expect(Array.isArray(stocksResponse)).toBe(true);

            if (stocksResponse.length > 0) {
                const orderStock = stocksResponse.find((stock: any) =>
                    stock.stock_code?.includes(ORDER_SYMBOLS.FUTURES)
                );

                const orderParams = createOrderParams({
                    symbol: orderStock?.stock_code || ORDER_SYMBOLS.FUTURES,
                    ordrUntprc: "10"
                });

                const response = await placeOrderWithErrorHandling(orderParams);
                expectSuccessfulOrder(response);
            }
        });

        test("12. should handle concurrent order requests", async () => {
            const loginData = await getLoginSession();
            const { session, token, acntNo, subAcntNo } = loginData;

            const orderParams = createOrderParams({
                symbol: ORDER_SYMBOLS.FUTURES,
                ordrQty: "10",
                ordrUntprc: "10",
                oddOrdrYn: "Y"
            });

            const createConcurrentOrder = (delayMs: number = 0) => {
                return delay(delayMs).then(() => {
                    const { orderApi } = createFreshInstances();
                    return orderApi.placeNewOrder(
                        Env.TEST_USERNAME as string,
                        session,
                        acntNo,
                        subAcntNo,
                        orderParams,
                        uuidv4(),
                        token
                    );
                });
            };

            const responses = await Promise.all([
                createConcurrentOrder(0),
                createConcurrentOrder(50),
                createConcurrentOrder(100)
            ]);

            expect(responses).toHaveLength(3);
            responses.forEach(expectSuccessfulOrder);
        });
    });

    test.describe("Performance Tests", () => {
        test("13. should handle rapid successive order requests", async () => {
            const loginData = await getLoginSession();
            const { session, token, acntNo, subAcntNo } = loginData;
            const { orderApi } = createFreshInstances();

            const orderParams = createOrderParams({
                symbol: ORDER_SYMBOLS.FUTURES,
                ordrQty: "5",
                ordrUntprc: "10",
                oddOrdrYn: "Y"
            });

            const startTime = Date.now();
            const orderPromises: Promise<any>[] = [];

            // Create 5 concurrent order requests for better performance
            for (let i = 0; i < 5; i++) {
                const orderPromise = orderApi.placeNewOrder(
                    Env.TEST_USERNAME as string,
                    session,
                    acntNo,
                    subAcntNo,
                    orderParams,
                    uuidv4(),
                    token
                ).catch(error => {
                    console.log(`Order ${i + 1} failed:`, error);
                    return null;
                });

                orderPromises.push(orderPromise);
            }

            const responses = await Promise.all(orderPromises);
            const successfulResponses = responses.filter(response => response?.rc === 1);

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(PERFORMANCE_TIMEOUT);
            expect(successfulResponses.length).toBeGreaterThan(0);
        });
    });
});