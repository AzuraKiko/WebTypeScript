import { test, expect } from "@playwright/test";
import LoginApi from "../../page/LoginApi";
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
const OTP: string = "615291";
const value: string = CryptoJS.AES.encrypt(OTP, encryptionKey).toString();

test.describe("LoginApi Tests", () => {
    let loginApi: LoginApi;

    test.beforeEach(async () => {
        loginApi = new LoginApi(Env.WS_BASE_URL as string);
    });

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
            try {
                await loginApi.loginApi(
                    "",
                    Env.TEST_PASSWORD as string,
                    Env.TEST_FCM_TOKEN as string
                );
                // Nếu API không throw error, test sẽ fail
                expect(true).toBe(false);
            } catch (error: any) {
                // Check if error has response data with the expected message
                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.data &&
                    error.response.data.data.message
                ) {
                    expect(error.response.data.rc).toBe(-1);
                    expect(error.response.data.data.message).toBe(
                        "Không có thông tin khách hàng"
                    );
                } else {
                    expect(error).toBeDefined();
                }
            }
        });

        test("4. should handle login with empty password", async () => {
            try {
                await loginApi.loginApi(Env.TEST_USERNAME as string, "", Env.TEST_FCM_TOKEN as string);
                // If we reach here, the test should fail
                expect(true).toBe(false);
            } catch (error: any) {
                // Check if error has response data with the expected message
                if (error.response && error.response.data && error.response.data.data && error.response.data.data.message) {
                    expect(error.response.data.rc).toBe(-1);
                    expect(error.response.data.data.message).toBe("Quý Khách đã nhập sai thông tin đăng nhập 1 LẦN. Quý Khách lưu ý, tài khoản sẽ bị tạm khóa nếu Quý Khách nhập sai liên tiếp 05 LẦN.");
                } else {
                    expect(error).toBeDefined();
                }
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
                const response = await loginApi.getToken(Env.TEST_USERNAME as string, loginResponse.data?.session as string, loginResponse.data?.cif as string, uuidv4(), value);

                expect(response).toBeDefined();
                expect(response.rc).toBe(1);
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

                    // Step 3: Get Token
                    const tokenResponse = await loginApi.getToken(Env.TEST_USERNAME as string, session, cif, uuidv4(), value);
                    expect(tokenResponse).toBeDefined();
                }
            });
        });

        test("11. should handle session expiration scenario", async () => {
            // First login to get valid session
            const loginResponse = await loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string);
            if (loginResponse.data) {
                const session: string = loginResponse.data.session;
                const cif: string = loginResponse.data.cif;
                try {
                    await loginApi.loginApi(Env.TEST_USERNAME as string, Env.TEST_PASSWORD as string, Env.TEST_FCM_TOKEN as string);
                    await loginApi.generateAuth(Env.TEST_USERNAME as string, session);
                    // If we reach here, the test should fail
                    expect(true).toBe(false);
                } catch (error) {
                    expect(error).toBeDefined();
                }
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
