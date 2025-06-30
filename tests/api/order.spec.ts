import { test, expect } from "@playwright/test";
import LoginApi from "../../page/LoginApi";
import OrderApi from "../../page/OrderApi";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';

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

test.describe("OrderApi Tests", () => {
    let loginApi: LoginApi = new LoginApi(Env.WS_BASE_URL as string);
    let orderApi: OrderApi = new OrderApi(Env.WS_BASE_URL as string);
    let privateKey: string = "a06ab782-118c-4819-a3c5-7b958ba85f7e";
    let session: string = "";
    let token: string = "";
    let acntNo: string = "";
    let subAcntNo: string = "";


    test.beforeAll(async () => {
        privateKey = "a06ab782-118c-4819-a3c5-7b958ba85f7e";
        const loginResponse = await loginApi.loginSuccess();
        session = loginResponse.session;
        token = loginResponse.token;
        acntNo = loginResponse.acntNo;
        subAcntNo = loginResponse.subAcntNo;
    });

    // test.describe("getListAllStock method", () => {
    //     test("1. should successfully get list of all stocks", async () => {
    //         const response = await orderApi.getListAllStock();

    //         expect(response).toBeDefined();
    //         expect(Array.isArray(response)).toBe(true);

    // if (response.length > 0) {
    //     response.forEach((stock: any) => {
    //         expect(stock).toHaveProperty("stock_code");
    //         expect(stock).toHaveProperty("name_vn");
    //     });
    // }
    //     });
    // });

    test.describe("placeNewOrder method", () => {
        test("2. should successfully place a buy order", async () => {
            if (!session || !token || !acntNo || !subAcntNo) {
                test.skip();
                return;
            }

            const orderParams = {
                symbol: "CEO",
                ordrQty: "100",
                ordrUntprc: "12500",
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

        // test("3. should successfully place a sell order", async () => {
        //     if (!session || !token || !acntNo || !subAcntNo) {
        //         test.skip();
        //         return;
        //     }
        //     const orderParams = {
        //         symbol: "CEO",
        //         ordrQty: "100",
        //         ordrUntprc: "12500",
        //         ordrTrdTp: "01", // Normal order
        //         buySelTp: "2", // Sell
        //         oddOrdrYn: "N", // Not odd lot
        //         privateKey: privateKey
        //     };

        //     const rqId: string = uuidv4();
        //     const response = await orderApi.placeNewOrder(
        //         Env.TEST_USERNAME as string,
        //         session,
        //         acntNo,
        //         subAcntNo,
        //         orderParams,
        //         rqId,
        //         token
        //     );

        //     expect(response).toBeDefined();
        //     expect(response.rc).toBe(1);
        //     expect(response.data.ordrNo).toBeDefined();
        // });

        // test("4. should handle order with invalid symbol", async () => {
        //     if (!session || !token || !acntNo || !subAcntNo) {
        //         test.skip();
        //         return;
        //     }

        //     const orderParams = {
        //         symbol: "CEO1",
        //         ordrQty: "100",
        //         ordrUntprc: "12500",
        //         ordrTrdTp: "01", // Normal order
        //         buySelTp: "1", // Buy
        //         oddOrdrYn: "N", // Not odd lot
        //         privateKey: privateKey
        //     };

        //     const rqId: string = uuidv4();

        //     try {
        //         await orderApi.placeNewOrder(
        //             Env.TEST_USERNAME as string,
        //             session,
        //             acntNo,
        //             subAcntNo,
        //             orderParams,
        //             rqId,
        //             token
        //         );
        //         expect(true).toBe(false);
        //     } catch (error) {
        //         expect(error).toBeDefined();
        //     }
        // });

        // test("6. should handle order with invalid quantity", async () => {
        //     if (!session || !token || !acntNo || !subAcntNo) {
        //         test.skip();
        //         return;
        //     }

        //     const orderParams = {
        //         symbol: "CEO",
        //         ordrQty: "500", // Quantity > Holding hoặc vượt sức mua
        //         ordrUntprc: "12500",
        //         ordrTrdTp: "01",
        //         buySelTp: "2",
        //         oddOrdrYn: "N",
        //         privateKey: privateKey
        //     };

        //     const rqId: string = uuidv4();

        //     try {
        //         await orderApi.placeNewOrder(
        //             Env.TEST_USERNAME as string,
        //             session,
        //             acntNo,
        //             subAcntNo,
        //             orderParams,
        //             rqId,
        //             token
        //         );
        //         expect(true).toBe(false);
        //     } catch (error) {
        //         expect(error).toBeDefined();
        //     }
        // });

        // test("7. should handle order with invalid price", async () => {
        //     if (!session || !token || !acntNo || !subAcntNo) {
        //         test.skip();
        //         return;
        //     }

        //     const orderParams = {
        //         symbol: "CFPT2501",
        //         ordrQty: "100",
        //         ordrUntprc: "1200", // Nằm ngoài trần sàn
        //         ordrTrdTp: "01",
        //         buySelTp: "1",
        //         oddOrdrYn: "N",
        //         privateKey: privateKey
        //     };

        //     const rqId = uuidv4();

        //     try {
        //         await orderApi.placeNewOrder(
        //             Env.TEST_USERNAME as string,
        //             session,
        //             acntNo,
        //             subAcntNo,
        //             orderParams,
        //             rqId,
        //             token
        //         );
        //         expect(true).toBe(false);
        //     } catch (error) {
        //         expect(error).toBeDefined();
        //     }
        // });

        // test("8. should handle order with invalid session", async () => {
        //     if (!token || !acntNo || !subAcntNo) {
        //         test.skip();
        //         return;
        //     }

        //     const orderParams = {
        //         symbol: "CFPT2501",
        //         ordrQty: "100",
        //         ordrUntprc: "10",
        //         ordrTrdTp: "01",
        //         buySelTp: "1",
        //         oddOrdrYn: "N",
        //         privateKey: privateKey
        //     };

        //     const rqId = uuidv4();

        //     try {
        //         await orderApi.placeNewOrder(
        //             Env.TEST_USERNAME as string,
        //             "76qjXSCN1xpJYYRpKaLmVMD8D3PxFQiy2NRKws2sCw9RukmzVDyeJUN9tupNxHAS",
        //             acntNo,
        //             subAcntNo,
        //             orderParams,
        //             rqId,
        //             token
        //         );
        //         expect(true).toBe(false);
        //     } catch (error) {
        //         expect(error).toBeDefined();
        //     }
        // });

        // test("9. should handle order with invalid token", async () => {
        //     if (!session || !acntNo || !subAcntNo) {
        //         test.skip();
        //         return;
        //     }

        //     const orderParams = {
        //         symbol: "CFPT2501",
        //         ordrQty: "100",
        //         ordrUntprc: "10",
        //         ordrTrdTp: "01",
        //         buySelTp: "1",
        //         oddOrdrYn: "N",
        //         privateKey: privateKey
        //     };

        //     const rqId = uuidv4();

        //     try {
        //         await orderApi.placeNewOrder(
        //             Env.TEST_USERNAME as string,
        //             session,
        //             acntNo,
        //             subAcntNo,
        //             orderParams,
        //             rqId,
        //             "94c0f7f3eeded133d233c21902bd3a5bb282e11735093b62f5ed1cd36ac67b9b"
        //         );
        //         expect(true).toBe(false);
        //     } catch (error) {
        //         expect(error).toBeDefined();
        //     }
        // });

        // test("10. should handle order with odd lot", async () => {
        //     if (!session || !token || !acntNo || !subAcntNo) {
        //         test.skip();
        //         return;
        //     }

        //     const orderParams = {
        //         symbol: "CFPT2501",
        //         ordrQty: "15", // Odd lot quantity
        //         ordrUntprc: "10",
        //         ordrTrdTp: "01",
        //         buySelTp: "1",
        //         oddOrdrYn: "Y", // Odd lot
        //         privateKey: privateKey
        //     };

        //     const rqId = uuidv4();
        //     const response = await orderApi.placeNewOrder(
        //         Env.TEST_USERNAME as string,
        //         session,
        //         acntNo,
        //         subAcntNo,
        //         orderParams,
        //         rqId,
        //         token
        //     );

        //     expect(response).toBeDefined();
        //     expect(response.rc).toBe(1);
        //     expect(response.data.ordrNo).toBeDefined();
        // });
    });

    //     test.describe("Integration Tests", () => {
    //         test("11. should complete full order flow: login -> get stocks -> place order", async () => {
    //             // Step 1: Get list of stocks
    //             const stocksResponse = await orderApi.getListAllStock();
    //             expect(stocksResponse).toBeDefined();
    //             expect(stocksResponse.rc).toBe(1);
    //             expect(Array.isArray(stocksResponse)).toBe(true);

    //             if (!session || !token || !acntNo || !subAcntNo) {
    //                 test.skip();
    //                 return;
    //             }

    //             // Step 2: Place order with first available stock
    //             if (stocksResponse.length > 0) {
    //                 const orderStock = stocksResponse.find((it: any) => it.stock_code.includes("CFPT2501"));
    //                 const orderParams = {
    //                     symbol: orderStock.stock_code,
    //                     ordrQty: "100",
    //                     ordrUntprc: "10",
    //                     ordrTrdTp: "01",
    //                     buySelTp: "1",
    //                     oddOrdrYn: "N",
    //                     privateKey: privateKey
    //                 };

    //                 const rqId = uuidv4();
    //                 const orderResponse = await orderApi.placeNewOrder(
    //                     Env.TEST_USERNAME as string,
    //                     session,
    //                     acntNo,
    //                     subAcntNo,
    //                     orderParams,
    //                     rqId,
    //                     token
    //                 );

    //                 expect(orderResponse).toBeDefined();
    //                 expect(orderResponse.rc).toBe(1);
    //                 expect(orderResponse.data.ordrNo).toBeDefined();
    //             }
    //         });

    //         test("12. should handle concurrent order requests", async () => {
    //             if (!session || !token || !acntNo || !subAcntNo) {
    //                 test.skip();
    //                 return;
    //             }

    //             const orderParams = {
    //                 symbol: "CFPT2501",
    //                 ordrQty: "10",
    //                 ordrUntprc: "10",
    //                 ordrTrdTp: "01",
    //                 buySelTp: "1",
    //                 oddOrdrYn: "Y",
    //                 privateKey: privateKey
    //             };

    //             const promises = [
    //                 orderApi.placeNewOrder(
    //                     Env.TEST_USERNAME as string,
    //                     session,
    //                     acntNo,
    //                     subAcntNo,
    //                     orderParams,
    //                     uuidv4(),
    //                     token
    //                 ),
    //                 orderApi.placeNewOrder(
    //                     Env.TEST_USERNAME as string,
    //                     session,
    //                     acntNo,
    //                     subAcntNo,
    //                     orderParams,
    //                     uuidv4(),
    //                     token
    //                 ),
    //                 orderApi.placeNewOrder(
    //                     Env.TEST_USERNAME as string,
    //                     session,
    //                     acntNo,
    //                     subAcntNo,
    //                     orderParams,
    //                     uuidv4(),
    //                     token
    //                 )
    //             ];

    //             const responses = await Promise.all(promises);
    //             expect(responses).toHaveLength(3);

    //             responses.forEach(response => {
    //                 expect(response).toBeDefined();
    //                 expect(response.rc).toBe(1);
    //                 expect(response.data.ordrNo).toBeDefined();
    //             });
    //         });
    //     });
});
