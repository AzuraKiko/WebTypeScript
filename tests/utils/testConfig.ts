import dotenv from 'dotenv';
import { expect } from '@playwright/test';
dotenv.config({ path: '.env' });

/**
 * Environment Configuration Utility
 * Centralizes environment variable handling across all tests
 */
export const getEnvironment = () => {
    let env = process.env.NODE_ENV?.toUpperCase() || 'PROD';
    if (env === 'PRODUCTION') env = 'PROD';
    return env;
};

export const ENV = getEnvironment();

/**
 * Test Configuration Constants
 * Centralized configuration for all test files
 */
export const TEST_CONFIG = {
    WEB_LOGIN_URL: process.env[`${ENV}_WEB_LOGIN_URL`] as string,
    TEST_USER: process.env[`${ENV}_TEST_USER`] as string,
    TEST_PASS: process.env[`${ENV}_TEST_PASS`] as string,
    TEST_PASS_ENCRYPT: process.env[`${ENV}_TEST_PASS_ENCRYPT`] as string,
    ENV,
} as const;

/**
 * Common Error Messages
 * Centralized error message constants for consistent testing
 */
export const ERROR_MESSAGES = {
    // Login Error Messages
    EMPTY_FIELD: 'Trường không được để trống',
    INVALID_CUSTOMER: 'Error: Không có thông tin khách hàng',
    WRONG_PASSWORD_1: 'Error: Quý Khách đã nhập sai thông tin đăng nhập 1 LẦN. Quý Khách lưu ý, tài khoản sẽ bị tạm khóa nếu Quý Khách nhập sai liên tiếp 05 LẦN.',
    WRONG_PASSWORD_2: 'Error: Quý Khách đã nhập sai thông tin đăng nhập 2 LẦN. Quý Khách lưu ý, tài khoản sẽ bị tạm khóa nếu Quý Khách nhập sai liên tiếp 05 LẦN.',
    WRONG_PASSWORD_3: 'Error: Quý Khách đã nhập sai thông tin đăng nhập 3 LẦN. Quý Khách lưu ý, tài khoản sẽ bị tạm khóa nếu Quý Khách nhập sai liên tiếp 05 LẦN.',
    WRONG_PASSWORD_4: 'Error: Quý Khách đã nhập sai thông tin đăng nhập 4 LẦN. Quý Khách lưu ý, tài khoản sẽ bị tạm khóa nếu Quý Khách nhập sai liên tiếp 05 LẦN.',
    ACCOUNT_LOCKED: 'Error: Tài khoản của Quý Khách bị tạm khóa do nhập sai thông tin đăng nhập liên tiếp 05 lần. Quý Khách vui lòng sử dụng tính năng Quên mật khẩu ở màn hình đăng nhập hoặc liên hệ Phòng Dịch vụ Khách hàng của Pinetree (024 6282 3535) để được hỗ trợ.',

    // API Error Messages
    NO_CUSTOMER_INFO: "Không có thông tin khách hàng",
    NOT_LOGGED_IN: "Quý khách chưa đăng nhập.",
    SESSION_INCORRECT: (username: string) => `Servlet.exception.SessionException: Session ${username}is not correct.`,
    INVALID_OTP: "OTP không đúng",

    // Order Error Messages
    ORDER_QUANTITY_EXCEEDED: "order available sell quantity has been exceeded.",
    ORDER_PRICE_LIMIT: "Order price is greater than upper limit.",
} as const;

/**
 * Test Data Constants
 * Common test data used across multiple test files
 */
export const TEST_DATA = {
    INVALID_CREDENTIALS: {
        INVALID_USERNAME: 'test',
        INVALID_PASSWORD: 'abc',
    },

    STOCK_CODES: ['MBG', 'TTH', 'ITQ', 'HDA', 'NSH', 'VHE', 'CET', 'KSD'],

    ORDER_SYMBOLS: {
        VALID: "CEO",
        INVALID: "CEO1",
        FUTURES: "CFPT2501"
    },

    ORDER_TYPES: {
        BUY: "1",
        SELL: "2",
        NORMAL: "01"
    },
} as const;

/**
 * Test Performance Constants
 */
export const PERFORMANCE = {
    DEFAULT_DELAY: 100,
    TIMEOUT: 10000,
    WAIT_TIMEOUT: 3000,
} as const;

/**
 * Utility Functions
 */

/**
 * Creates a delay for test execution
 * @param ms - milliseconds to delay
 */
export const delay = (ms: number = PERFORMANCE.DEFAULT_DELAY): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a random stock code from the predefined list
 */
export const getRandomStockCode = (): string =>
    TEST_DATA.STOCK_CODES[Math.floor(Math.random() * TEST_DATA.STOCK_CODES.length)];

/**
 * Validates that required environment variables are set
 */
export const validateTestConfig = (): void => {
    const requiredVars = ['WEB_LOGIN_URL', 'TEST_USER', 'TEST_PASS'];
    const missingVars = requiredVars.filter(varName => !TEST_CONFIG[varName as keyof typeof TEST_CONFIG]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

/**
 * Common assertion helpers
 */
export const assertionHelpers = {
    expectSuccessfulResponse: (response: any) => {
        expect(response).toBeDefined();
        expect(response).toHaveProperty("data");
        expect(response.rc).toBe(1);
    },

    expectFailedResponse: (response: any, expectedMessage?: string) => {
        expect(response).toBeDefined();
        expect(response).toHaveProperty("data");
        expect(response.rc).toBe(-1);

        if (expectedMessage && response.data) {
            expect((response.data as any).message).toBe(expectedMessage);
        }
    },

    expectFailedResponseWithCode: (response: any, expectedMessage?: string) => {
        expect(response).toBeDefined();
        expect(response.rc).toBe("-1");

        if (expectedMessage) {
            expect(response.data.message).toBe(expectedMessage);
        }
    },
};

// Auto-validate configuration on import
validateTestConfig(); 