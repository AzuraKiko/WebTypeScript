import { test, expect } from "@playwright/test";
import LoginApi from "../../page/LoginApi";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
import { getMatrixCodes } from "../../page/Matrix";
import OrderApi from "../../page/OrderApi";

dotenv.config({ path: ".env" });

// Environment Configuration
const env = process.env.NODE_ENV?.toUpperCase() === "PRODUCTION" ? "PROD" : process.env.NODE_ENV?.toUpperCase() || "PROD";
const WS_BASE_URL = process.env[`${env}_WEB_LOGIN_URL`];
const TEST_USER = process.env[`${env}_TEST_USER`];
const TEST_PASSWORD_ENCRYPT = process.env[`${env}_TEST_PASS_ENCRYPT`];
const TEST_PASSWORD = process.env[`${env}_TEST_PASS`];

const testConfig = {
    WS_BASE_URL,
    TEST_USERNAME: TEST_USER,
    TEST_PASSWORD: TEST_PASSWORD_ENCRYPT,
    TEST_FCM_TOKEN: TEST_USER,
    PASSWORD: TEST_PASSWORD,
    ENV: env
} as const;

// Test Data Constants
const ERROR_MESSAGES = {
    NO_CUSTOMER_INFO: "Không có thông tin khách hàng",
    WRONG_LOGIN_INFO: "Quý Khách đã nhập sai thông tin đăng nhập 1 LẦN. Quý Khách lưu ý, tài khoản sẽ bị tạm khóa nếu Quý Khách nhập sai liên tiếp 05 LẦN.",
    NOT_LOGGED_IN: "Servlet.exception.SessionException: Not logged in!",
    SESSION_INCORRECT: (username: string) => `Servlet.exception.SessionException: Session ${username}is not correct.`,
    INVALID_OTP: "Invalid OTP"
} as const;

// Helper Functions
const createFreshInstances = () => ({
    loginApi: new LoginApi(testConfig.WS_BASE_URL as string),
    orderApi: new OrderApi(testConfig.WS_BASE_URL as string)
});

let testCounter = 0;
const getTestDelay = () => ++testCounter * 100;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Common Assertion Helpers
const expectSuccessfulResponse = (response: any) => {
    expect(response).toBeDefined();
    expect(response).toHaveProperty("data");
    expect(response.rc).toBe(1);
};

const expectSuccessfulLoginData = (data: any) => {
    expect(data).toHaveProperty("session");
    expect(data).toHaveProperty("cif");
    expect(data.session).toBeDefined();
    expect(data.cif).toBeDefined();
    expect(data.session.length).toBeGreaterThan(0);
    expect(data.cif.length).toBeGreaterThan(0);
};

const expectFailedResponse = (response: any, expectedMessage?: string) => {
    expect(response).toBeDefined();
    expect(response).toHaveProperty("data");
    expect(response.rc).toBe(-1);

    if (expectedMessage && response.data) {
        expect((response.data as any).message).toBe(expectedMessage);
    }
};

const expectFailedResponseWithCode = (response: any, expectedMessage?: string) => {
    expect(response).toBeDefined();
    expect(response.rc).toBe("-1");

    if (expectedMessage) {
        expect(response.data.message).toBe(expectedMessage);
    }
};

// Reusable Test Flows
const performLogin = async (username?: string, password?: string, fcmToken?: string) => {
    const { loginApi } = createFreshInstances();
    await delay(getTestDelay());

    return loginApi.loginApi(
        username ?? testConfig.TEST_USERNAME as string,
        password ?? testConfig.TEST_PASSWORD as string,
        fcmToken
    );
};

const performLoginWithAuth = async () => {
    const { loginApi } = createFreshInstances();
    await delay(getTestDelay());

    const loginResponse = await loginApi.loginApi(
        testConfig.TEST_USERNAME as string,
        testConfig.TEST_PASSWORD as string,
        testConfig.TEST_FCM_TOKEN as string
    );

    expectSuccessfulResponse(loginResponse);
    expect(loginResponse.data?.session).toBeDefined();

    const authResponse = await loginApi.generateAuth(
        testConfig.TEST_USERNAME as string,
        loginResponse.data?.session as string
    );

    return { loginResponse, authResponse, loginApi };
};

const performFullTokenFlow = async () => {
    const { loginResponse, authResponse, loginApi } = await performLoginWithAuth();
    const { orderApi } = createFreshInstances();

    expect(authResponse.rc).toBe(1);

    const matrixGen: string[] = Object.values(authResponse.data);
    const matrixAuth = getMatrixCodes(matrixGen).join('');

    const value = testConfig.ENV === "PROD"
        ? orderApi.genMatrixAuth(matrixAuth)
        : "9uCh4qxBlFqap/+KiqoM68EqO8yYGpKa1c+BCgkOEa4=";

    const tokenResponse = await loginApi.getToken(
        testConfig.TEST_USERNAME as string,
        loginResponse.data?.session as string,
        loginResponse.data?.cif as string,
        uuidv4(),
        value,
        "Matrix"
    );

    return { loginResponse, authResponse, tokenResponse };
};

test.describe("LoginApi Tests", () => {
    test.describe("loginApi method", () => {
        test("1. should successfully login with valid credentials", async () => {
            const response = await performLogin(
                testConfig.TEST_USERNAME as string,
                testConfig.TEST_PASSWORD as string,
                testConfig.TEST_FCM_TOKEN as string
            );

            expectSuccessfulResponse(response);
            if (response.data) {
                expectSuccessfulLoginData(response.data);
            }
        });

        test("2. should successfully login without fcmToken", async () => {
            const response = await performLogin();

            expectSuccessfulResponse(response);
            if (response.data) {
                expectSuccessfulLoginData(response.data);
            }
        });

        test("3. should handle login with empty username", async () => {
            const response = await performLogin("", testConfig.TEST_PASSWORD as string, testConfig.TEST_FCM_TOKEN as string);
            expectFailedResponse(response, ERROR_MESSAGES.NO_CUSTOMER_INFO);
        });

        test("4. should handle login with empty password", async () => {
            const response = await performLogin(testConfig.TEST_USERNAME as string, "", testConfig.TEST_FCM_TOKEN as string);
            expectFailedResponse(response, ERROR_MESSAGES.WRONG_LOGIN_INFO);
        });
    });

    test.describe("generateAuth method", () => {
        test("5. should successfully generate authentication", async () => {
            const { authResponse } = await performLoginWithAuth();

            expect(authResponse).toBeDefined();
            expect(authResponse.rc).toBe(1);
            expect(authResponse.data).not.toHaveProperty("message");
        });

        test("6. should handle generateAuth with empty user", async () => {
            const { loginResponse } = await performLoginWithAuth();
            const { loginApi } = createFreshInstances();

            const response = await loginApi.generateAuth("", loginResponse.data?.session as string);
            expectFailedResponseWithCode(response, ERROR_MESSAGES.NOT_LOGGED_IN);
        });

        test("7. should handle generateAuth with empty session", async () => {
            const { loginApi } = createFreshInstances();
            await delay(getTestDelay());

            const response = await loginApi.generateAuth(testConfig.TEST_USERNAME as string, "");
            expectFailedResponseWithCode(response, ERROR_MESSAGES.SESSION_INCORRECT(testConfig.TEST_USERNAME as string));
        });

        test("8. should handle generateAuth with invalid session", async () => {
            const { loginApi } = createFreshInstances();
            await delay(getTestDelay());

            const response = await loginApi.generateAuth(testConfig.TEST_USERNAME as string, "invalidsession");
            expectFailedResponseWithCode(response, ERROR_MESSAGES.SESSION_INCORRECT(testConfig.TEST_USERNAME as string));
        });
    });

    test.describe("getToken method", () => {
        test("9. should successfully get token", async () => {
            const { tokenResponse } = await performFullTokenFlow();

            expectSuccessfulResponse(tokenResponse);
            expect(tokenResponse.data).not.toHaveProperty("message");
            expect(tokenResponse.data.token).not.toBe(ERROR_MESSAGES.INVALID_OTP);
        });
    });

    test.describe("Integration Tests", () => {
        test("10. should complete full login flow: login -> generateAuth -> getToken", async () => {
            const { loginResponse, authResponse, tokenResponse } = await performFullTokenFlow();

            // Validate each step
            expectSuccessfulResponse(loginResponse);
            if (loginResponse.data) {
                expectSuccessfulLoginData(loginResponse.data);
            }

            expect(authResponse).toBeDefined();
            expect(authResponse.rc).toBe(1);
            expect(authResponse.data).not.toHaveProperty("message");

            expectSuccessfulResponse(tokenResponse);
            expect(tokenResponse.data.token).not.toBe(ERROR_MESSAGES.INVALID_OTP);
            expect(tokenResponse.data).not.toHaveProperty("message");
        });

        test("11. should handle session expiration scenario", async () => {
            const { loginApi } = createFreshInstances();
            await delay(getTestDelay());

            // First login to get valid session
            const firstLogin = await loginApi.loginApi(
                testConfig.TEST_USERNAME as string,
                testConfig.TEST_PASSWORD as string,
                testConfig.TEST_FCM_TOKEN as string
            );

            if (firstLogin.data) {
                const oldSession = firstLogin.data.session;

                // Second login to invalidate previous session
                await loginApi.loginApi(
                    testConfig.TEST_USERNAME as string,
                    testConfig.TEST_PASSWORD as string,
                    testConfig.TEST_FCM_TOKEN as string
                );

                // Try to use old session
                const authResponse = await loginApi.generateAuth(testConfig.TEST_USERNAME as string, oldSession);
                expectFailedResponseWithCode(authResponse, ERROR_MESSAGES.SESSION_INCORRECT(testConfig.TEST_USERNAME as string));
            }
        });

        test("12. should handle concurrent requests", async () => {
            await delay(getTestDelay());

            const createConcurrentRequest = (delayMs: number = 0) =>
                delay(delayMs).then(() => performLogin());

            // Test multiple concurrent login requests with staggered timing
            const promises = [
                createConcurrentRequest(),
                createConcurrentRequest(50),
                createConcurrentRequest(100)
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
            const requests = [];
            const REQUEST_COUNT = 5;
            const DELAY_BETWEEN_REQUESTS = 200;

            // Create all requests with staggered delays
            for (let i = 0; i < REQUEST_COUNT; i++) {
                const requestPromise = delay(i * DELAY_BETWEEN_REQUESTS)
                    .then(() => performLogin())
                    .catch(error => {
                        console.log(`Request ${i + 1} failed:`, error);
                        return null;
                    });
                requests.push(requestPromise);
            }

            await Promise.all(requests);

            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(30 * 1000); // 30 seconds
        });
    });
});