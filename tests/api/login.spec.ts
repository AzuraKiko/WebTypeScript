import { test, expect } from "@playwright/test";
import LoginApi from "../../page/LoginApi";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
import { getMatrixCodes } from "../../page/Matrix";
import OrderApi from "../../page/OrderApi";

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

let loginApi: LoginApi;
let orderApi: OrderApi;

test.beforeEach(async () => {
    loginApi = new LoginApi(Env.WS_BASE_URL as string);
    orderApi = new OrderApi(Env.WS_BASE_URL as string);
});

// Replace the crypto encryption with CryptoJS equivalent
const OTP: string = "563447";
let matrixAuth: string = "111";
let value: string = "9uCh4qxBlFqap/+KiqoM68EqO8yYGpKa1c+BCgkOEa4=";


test.describe("LoginApi Tests", () => {
    test.describe("loginApi method", () => {
        test("1. should successfully login with valid credentials", async () => {
            const response = await loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string);
            expect(response).toBeDefined();
            expect(response).toHaveProperty("data");
            expect(response.rc).toBe(1);
            if (response.data) {
                expect(response.data).toHaveProperty("session");
                expect(response.data).toHaveProperty("cif");
                expect(response.data.session).toBeDefined();
                expect(response.data.cif).toBeDefined();
            }
        });

        test("2. should successfully login without fcmToken", async () => {
            const response = await loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string);

            expect(response).toBeDefined();
            expect(response).toHaveProperty("data");
            expect(response.rc).toBe(1);
            if (response.data) {
                expect(response.data).toHaveProperty("session");
                expect(response.data).toHaveProperty("cif");
                expect(response.data.session.length).toBeGreaterThan(0);
                expect(response.data.cif.length).toBeGreaterThan(0);
            }
        });

        test("3. should handle login with empty username", async () => {

            const response = await loginApi.loginApi(
                "",
                Env.TEST_PASSWORD as string,
                Env.TEST_FCM_TOKEN as string
            );
            expect(response).toBeDefined();
            expect(response).toHaveProperty("data");
            expect(response.rc).toBe(-1);
            if (response.data && (response.rc === -1)) {
                expect((response.data as any).message).toBe("Không có thông tin khách hàng");
            }
        });

        test("4. should handle login with empty password", async () => {
            const response = await loginApi.loginApi(Env.TEST_USERNAME as string, "", Env.TEST_FCM_TOKEN as string);

            expect(response).toBeDefined();
            expect(response).toHaveProperty("data");
            expect(response.rc).toBe(-1);
            if (response.data && (response.rc === -1)) {
                expect((response.data as any).message).toBe("Quý Khách đã nhập sai thông tin đăng nhập 1 LẦN. Quý Khách lưu ý, tài khoản sẽ bị tạm khóa nếu Quý Khách nhập sai liên tiếp 05 LẦN.");
            }
        });

        test.describe("generateAuth method", () => {
            test("5. should successfully generate authentication", async () => {
                const loginResponse = await loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string);
                const response = await loginApi.generateAuth(Env.TEST_USERNAME as string, loginResponse.data?.session as string);

                expect(response).toBeDefined();
                expect(response.rc).toBe(1);
            });

            test("6. should handle generateAuth with empty user", async () => {
                const loginResponse = await loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string);
                const response = await loginApi.generateAuth("", loginResponse.data?.session as string);

                expect(response.rc).toBe("-1");
                expect(response.data.message).toBe("Servlet.exception.SessionException: Not logged in!");
            });

            test("7. should handle generateAuth with empty session", async () => {
                const response = await loginApi.generateAuth(Env.TEST_USERNAME as string, "");

                expect(response.rc).toBe("-1");
                expect(response.data.message).toBe(`Servlet.exception.SessionException: Session ${Env.TEST_USERNAME}is not correct.`);
            });

            test("8. should handle generateAuth with invalid session", async () => {
                const response = await loginApi.generateAuth(Env.TEST_USERNAME as string, "invalidsession");

                expect(response.rc).toBe("-1");
                expect(response.data.message).toBe(`Servlet.exception.SessionException: Session ${Env.TEST_USERNAME}is not correct.`);
            });
        });

        test.describe("getToken method", () => {
            test("9. should successfully get token", async () => {
                const loginResponse = await loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string);
                const authResponse = await loginApi.generateAuth(Env.TEST_USERNAME as string, loginResponse.data?.session as string);
                const matrixGen: string[] = Object.values(authResponse.data);
                console.log('matrixGen:', matrixGen);
                let matrixAuth = getMatrixCodes(matrixGen).join('');
                console.log('matrixAuth:', matrixAuth);
                value = orderApi.genMatrixAuth(matrixAuth);
                const response = await loginApi.getToken(Env.TEST_USERNAME as string, loginResponse.data?.session as string, loginResponse.data?.cif as string, uuidv4(), value, "Matrix");
                expect(response).toBeDefined();
                expect(response.rc).toBe(1);
                expect(response.data.token).not.toBe("Invalid OTP");
            });
        });

        test.describe("Integration Tests", () => {
            test("10. should complete full login flow: login -> generateAuth -> getToken", async () => {
                // Step 1: Login
                const loginResponse = await loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string);

                expect(loginResponse).toBeDefined();
                expect(loginResponse).toHaveProperty("data");
                if (loginResponse.data) {
                    expect(loginResponse.data).toHaveProperty("session");
                    expect(loginResponse.data).toHaveProperty("cif");

                    const session: string = loginResponse.data.session;
                    const cif: string = loginResponse.data.cif;
                    // Step 2: Generate Auth
                    const authResponse = await loginApi.generateAuth(Env.TEST_USERNAME as string, session);
                    expect(authResponse).toBeDefined();
                    expect(authResponse.rc).toBe(1);
                    let matrixGen: string[] = Object.values(authResponse.data);
                    let matrixAuth = getMatrixCodes(matrixGen).join('');
                    let value = orderApi.genMatrixAuth(matrixAuth);

                    // Step 3: Get Token
                    const tokenResponse = await loginApi.getToken(Env.TEST_USERNAME as string, session, cif, uuidv4(), value, "Matrix");
                    expect(tokenResponse).toBeDefined();
                    expect(tokenResponse.rc).toBe(1);
                    expect(tokenResponse.data.token).not.toBe("Invalid OTP");
                }
            });
        });

        test("11. should handle session expiration scenario", async () => {
            // First login to get valid session
            const loginResponse = await loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string);
            if (loginResponse.data) {
                const session: string = loginResponse.data.session;
                const cif: string = loginResponse.data.cif;
                await loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string);
                const authResponse = await loginApi.generateAuth(Env.TEST_USERNAME as string, session);
                expect(authResponse).toBeDefined();
                expect(authResponse.rc).toBe("-1");
                expect(authResponse.data.message).toBe(`Servlet.exception.SessionException: Session ${Env.TEST_USERNAME}is not correct.`);
            }
        });

        test("12. should handle concurrent requests", async () => {
            // Test multiple concurrent login requests
            const promises = [
                loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string),
                loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string),
                loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string)
            ];

            const responses = await Promise.all(promises);

            expect(responses).toHaveLength(3);
            responses.forEach(response => {
                expect(response).toBeDefined();
                expect(response).toHaveProperty("data");
            });
        });
    });

    test.describe("Performance Tests", () => {
        test("13. should handle rapid successive requests", async () => {
            const startTime = Date.now();

            for (let i = 0; i < 5; i++) {
                try {
                    await loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string);
                } catch (error) {
                    console.log(error);
                }
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete within reasonable time (adjust as needed)
            expect(duration).toBeLessThan(30 * 1000); // 30 seconds
        });
    });
})
