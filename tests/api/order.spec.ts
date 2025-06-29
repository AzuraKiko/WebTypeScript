import { test, expect } from "@playwright/test";
import LoginApi from "../../page/LoginApi";
import OrderApi from "../../page/OrderApi";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

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

// Replace the crypto encryption with CryptoJS equivalent
const encryptionKey: string = "9uCh4qxBlFqap/+KiqoM68EqO8yYGpKa1c+BCgkOEa4=";
const OTP: string = "563447";
const value: string = CryptoJS.AES.encrypt(OTP, encryptionKey).toString();

test.describe("OrderApi Tests", () => {
    let loginApi: LoginApi;
    let orderApi: OrderApi;
    let session: string;
    let cif: string;
    let token: string;
    let acntNo: string;
    let subAcntNo: string;
    let privateKey: string;

    test.beforeAll(async () => {
        privateKey = "a06ab782-118c-4819-a3c5-7b958ba85f7e";
        loginApi = new LoginApi(Env.WS_BASE_URL as string);
        orderApi = new OrderApi(Env.WS_BASE_URL as string);

        // Login and get session, cif, and token for order tests
        const loginResponse = await loginApi.loginApi(
            Env.TEST_USERNAME as string,
            Env.TEST_PASSWORD as string,
            Env.TEST_FCM_TOKEN as string
        );

        if (loginResponse.data) {
            session = loginResponse.data.session;
            cif = loginResponse.data.cif;

            // Get account information
            if (loginResponse.data.custInfo?.normal && loginResponse.data.custInfo.normal.length > 0) {
                const account: any = loginResponse.data.custInfo.normal.find((it: any) => it.subAcntNo.includes("M"));
                acntNo = account?.acntNo;
                subAcntNo = account?.subAcntNo;
            }

            // Generate auth and get token
            // const authResponse = await loginApi.generateAuth(Env.TEST_USERNAME as string, session);
            // if (authResponse.rc === 1) {
            const tokenResponse = await loginApi.getToken(
                Env.TEST_USERNAME as string,
                session,
                cif,
                uuidv4(),
                OTP
            );
            if (tokenResponse.rc === 1 && tokenResponse.data?.token) {
                token = tokenResponse.data.token;
            }
            // }
        }
    });

    test.describe("getListAllStock method", () => {
        test("1. should successfully get list of all stocks", async () => {
            const response = await orderApi.getListAllStock();

            expect(response).toBeDefined();
            expect(Array.isArray(response)).toBe(true);

            if (response.length > 0) {
                response.forEach((stock: any) => {
                    expect(stock).toHaveProperty("stock_code");
                    expect(stock).toHaveProperty("name_vn");
                });
            }
        });
    });

    test.describe("placeNewOrder method", () => {
        test("2. should successfully place a buy order", async () => {
            if (!session || !token || !acntNo || !subAcntNo) {
                test.skip();
                return;
            }

            const orderParams = {
                symbol: "CFPT2501",
                ordrQty: "100",
                ordrUntprc: "10",
                ordrTrdTp: "01", // Normal order
                buySelTp: "1", // Buy
                oddOrdrYn: "N", // Not odd lot
                privateKey: privateKey
            };

            const rqId: string = uuidv4();
            const response = await orderApi.placeNewOrder(
                Env.TEST_USERNAME as string,
                session,
                acntNo,
                subAcntNo,
                orderParams,
                rqId,
                token
            );

            expect(response).toBeDefined();
            expect(response.rc).toBe(1);
            expect(response.data.ordrNo).toBeDefined();
        });

        test("3. should successfully place a sell order", async () => {
            if (!session || !token || !acntNo || !subAcntNo) {
                test.skip();
                return;
            }
            const orderParams = {
                symbol: "CFPT2501",
                ordrQty: "100",
                ordrUntprc: "10",
                ordrTrdTp: "01", // Normal order
                buySelTp: "2", // Sell
                oddOrdrYn: "N", // Not odd lot
                privateKey: privateKey
            };

            const rqId: string = uuidv4();
            const response = await orderApi.placeNewOrder(
                Env.TEST_USERNAME as string,
                session,
                acntNo,
                subAcntNo,
                orderParams,
                rqId,
                token
            );

            expect(response).toBeDefined();
            expect(response.rc).toBe(1);
            expect(response.data.ordrNo).toBeDefined();
        });

        test("4. should handle order with invalid symbol", async () => {
            if (!session || !token || !acntNo || !subAcntNo) {
                test.skip();
                return;
            }

            const orderParams = {
                symbol: "CFPT25018",
                ordrQty: "100",
                ordrUntprc: "10",
                ordrTrdTp: "01", // Normal order
                buySelTp: "1", // Buy
                oddOrdrYn: "N", // Not odd lot
                privateKey: privateKey
            };

            const rqId: string = uuidv4();

            try {
                await orderApi.placeNewOrder(
                    Env.TEST_USERNAME as string,
                    session,
                    acntNo,
                    subAcntNo,
                    orderParams,
                    rqId,
                    token
                );
                expect(true).toBe(false);
            } catch (error) {
                expect(error).toBeDefined();
            }
        });

        test("6. should handle order with invalid quantity", async () => {
            if (!session || !token || !acntNo || !subAcntNo) {
                test.skip();
                return;
            }

            const orderParams = {
                symbol: "CEO",
                ordrQty: "10", // Quantity > Holding hoặc vượt sức mua
                ordrUntprc: "16500",
                ordrTrdTp: "01",
                buySelTp: "2",
                oddOrdrYn: "Y",
                privateKey: privateKey
            };

            const rqId: string = uuidv4();

            try {
                await orderApi.placeNewOrder(
                    Env.TEST_USERNAME as string,
                    session,
                    acntNo,
                    subAcntNo,
                    orderParams,
                    rqId,
                    token
                );
                expect(true).toBe(false);
            } catch (error) {
                expect(error).toBeDefined();
            }
        });

        test("7. should handle order with invalid price", async () => {
            if (!session || !token || !acntNo || !subAcntNo) {
                test.skip();
                return;
            }

            const orderParams = {
                symbol: "CFPT2501",
                ordrQty: "100",
                ordrUntprc: "1000", // Nằm ngoài trần sàn
                ordrTrdTp: "01",
                buySelTp: "1",
                oddOrdrYn: "N",
                privateKey: privateKey
            };

            const rqId = uuidv4();

            try {
                await orderApi.placeNewOrder(
                    Env.TEST_USERNAME as string,
                    session,
                    acntNo,
                    subAcntNo,
                    orderParams,
                    rqId,
                    token
                );
                expect(true).toBe(false);
            } catch (error) {
                expect(error).toBeDefined();
            }
        });

        test("8. should handle order with invalid session", async () => {
            if (!token || !acntNo || !subAcntNo) {
                test.skip();
                return;
            }

            const orderParams = {
                symbol: "CFPT2501",
                ordrQty: "100",
                ordrUntprc: "10",
                ordrTrdTp: "01",
                buySelTp: "1",
                oddOrdrYn: "N",
                privateKey: privateKey
            };

            const rqId = uuidv4();

            try {
                await orderApi.placeNewOrder(
                    Env.TEST_USERNAME as string,
                    "76qjXSCN1xpJYYRpKaLmVMD8D3PxFQiy2NRKws2sCw9RukmzVDyeJUN9tupNxHAS",
                    acntNo,
                    subAcntNo,
                    orderParams,
                    rqId,
                    token
                );
                expect(true).toBe(false);
            } catch (error) {
                expect(error).toBeDefined();
            }
        });

        test("9. should handle order with invalid token", async () => {
            if (!session || !acntNo || !subAcntNo) {
                test.skip();
                return;
            }

            const orderParams = {
                symbol: "CFPT2501",
                ordrQty: "100",
                ordrUntprc: "10",
                ordrTrdTp: "01",
                buySelTp: "1",
                oddOrdrYn: "N",
                privateKey: privateKey
            };

            const rqId = uuidv4();

            try {
                await orderApi.placeNewOrder(
                    Env.TEST_USERNAME as string,
                    session,
                    acntNo,
                    subAcntNo,
                    orderParams,
                    rqId,
                    "94c0f7f3eeded133d233c21902bd3a5bb282e11735093b62f5ed1cd36ac67b9b"
                );
                expect(true).toBe(false);
            } catch (error) {
                expect(error).toBeDefined();
            }
        });

        test("10. should handle order with odd lot", async () => {
            if (!session || !token || !acntNo || !subAcntNo) {
                test.skip();
                return;
            }

            const orderParams = {
                symbol: "CFPT2501",
                ordrQty: "15", // Odd lot quantity
                ordrUntprc: "10",
                ordrTrdTp: "01",
                buySelTp: "1",
                oddOrdrYn: "Y", // Odd lot
                privateKey: privateKey
            };

            const rqId = uuidv4();
            const response = await orderApi.placeNewOrder(
                Env.TEST_USERNAME as string,
                session,
                acntNo,
                subAcntNo,
                orderParams,
                rqId,
                token
            );

            expect(response).toBeDefined();
            expect(response.rc).toBe(1);
            expect(response.data.ordrNo).toBeDefined();
        });
    });

    test.describe("Integration Tests", () => {
        test("11. should complete full order flow: login -> get stocks -> place order", async () => {
            // Step 1: Get list of stocks
            const stocksResponse = await orderApi.getListAllStock();
            expect(stocksResponse).toBeDefined();
            expect(stocksResponse.rc).toBe(1);
            expect(Array.isArray(stocksResponse)).toBe(true);

            if (!session || !token || !acntNo || !subAcntNo) {
                test.skip();
                return;
            }

            // Step 2: Place order with first available stock
            if (stocksResponse.length > 0) {
                const orderStock = stocksResponse.find((it: any) => it.stock_code.includes("CFPT2501"));
                const orderParams = {
                    symbol: orderStock.stock_code,
                    ordrQty: "100",
                    ordrUntprc: "10",
                    ordrTrdTp: "01",
                    buySelTp: "1",
                    oddOrdrYn: "N",
                    privateKey: privateKey
                };

                const rqId = uuidv4();
                const orderResponse = await orderApi.placeNewOrder(
                    Env.TEST_USERNAME as string,
                    session,
                    acntNo,
                    subAcntNo,
                    orderParams,
                    rqId,
                    token
                );

                expect(orderResponse).toBeDefined();
                expect(orderResponse.rc).toBe(1);
                expect(orderResponse.data.ordrNo).toBeDefined();
            }
        });

        test("12. should handle concurrent order requests", async () => {
            if (!session || !token || !acntNo || !subAcntNo) {
                test.skip();
                return;
            }

            const orderParams = {
                symbol: "CFPT2501",
                ordrQty: "10",
                ordrUntprc: "10",
                ordrTrdTp: "01",
                buySelTp: "1",
                oddOrdrYn: "Y",
                privateKey: privateKey
            };

            const promises = [
                orderApi.placeNewOrder(
                    Env.TEST_USERNAME as string,
                    session,
                    acntNo,
                    subAcntNo,
                    orderParams,
                    uuidv4(),
                    token
                ),
                orderApi.placeNewOrder(
                    Env.TEST_USERNAME as string,
                    session,
                    acntNo,
                    subAcntNo,
                    orderParams,
                    uuidv4(),
                    token
                ),
                orderApi.placeNewOrder(
                    Env.TEST_USERNAME as string,
                    session,
                    acntNo,
                    subAcntNo,
                    orderParams,
                    uuidv4(),
                    token
                )
            ];

            const responses = await Promise.all(promises);
            expect(responses).toHaveLength(3);

            responses.forEach(response => {
                expect(response).toBeDefined();
                expect(response.rc).toBe(1);
                expect(response.data.ordrNo).toBeDefined();
            });
        });
    });
});
