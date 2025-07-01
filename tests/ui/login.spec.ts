import { test, expect } from "@playwright/test";
import LoginPage from "../../page/LoginPage";
import { attachScreenshot } from '../../helpers/reporterHelper';
import LogoutPage from "../../page/LogoutPage";
import { TEST_CONFIG, ERROR_MESSAGES, TEST_DATA } from '../utils/testConfig';

test.describe("Login Functionality Tests", () => {
  let loginPage: LoginPage;
  let logoutPage: LogoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    logoutPage = new LogoutPage(page, loginPage);
    await loginPage.gotoWeb(TEST_CONFIG.WEB_LOGIN_URL);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test("TC_01: Should login successfully with valid account", async ({ page }) => {
    await loginPage.login(TEST_CONFIG.TEST_USER, TEST_CONFIG.TEST_PASS);

    expect(await loginPage.verifyLoginSuccess(TEST_CONFIG.TEST_USER)).toBeTruthy();
    await attachScreenshot(page, 'After Login');

    await logoutPage.logout();
  });

  test("TC_02: Should show error message with empty username and password", async () => {
    await loginPage.clickOpenLogin();
    await loginPage.enterUsernameAndPassword('', '');

    expect(await loginPage.verifyValidateUsernameError(ERROR_MESSAGES.EMPTY_FIELD)).toBeTruthy();
    expect(await loginPage.verifyValidatePasswordError(ERROR_MESSAGES.EMPTY_FIELD)).toBeTruthy();
  });

  test("TC_03: Should show error message with invalid username", async () => {
    await loginPage.enterUsernameAndPassword(TEST_DATA.INVALID_CREDENTIALS.INVALID_USERNAME, TEST_CONFIG.TEST_PASS);

    expect(await loginPage.loginWithInvalidUsername(ERROR_MESSAGES.INVALID_CUSTOMER)).toBeTruthy();
  });

  test("TC_04: Should show error message with wrong password multiple times", async () => {
    const wrongPasswordAttempts = [
      ERROR_MESSAGES.WRONG_PASSWORD_1,
      ERROR_MESSAGES.WRONG_PASSWORD_2,
      ERROR_MESSAGES.WRONG_PASSWORD_3,
    ];

    for (let i = 0; i < wrongPasswordAttempts.length; i++) {
      await loginPage.enterUsernameAndPassword(TEST_CONFIG.TEST_USER, TEST_DATA.INVALID_CREDENTIALS.INVALID_PASSWORD);
      expect(await loginPage.loginWithInvalidPassword(wrongPasswordAttempts[i])).toBeTruthy();
    }
  });

  // Commented out dangerous tests that could lock the account
  /*
  test("TC_05: Should show error message for 4th wrong password attempt", async () => {
    // Note: This test is risky as it approaches account lockout
    await loginPage.enterUsernameAndPassword(TEST_CONFIG.TEST_USER, TEST_DATA.INVALID_CREDENTIALS.INVALID_PASSWORD);
    expect(await loginPage.loginWithInvalidPassword(ERROR_MESSAGES.WRONG_PASSWORD_4)).toBeTruthy();
  });

  test("TC_06: Should lock account after 5 wrong password attempts", async () => {
    // Note: This test will lock the account and should only be run in isolated test environment
    await loginPage.enterUsernameAndPassword(TEST_CONFIG.TEST_USER, TEST_DATA.INVALID_CREDENTIALS.INVALID_PASSWORD);
    expect(await loginPage.loginWithInvalidPassword(ERROR_MESSAGES.ACCOUNT_LOCKED)).toBeTruthy();
  });
  */
});

