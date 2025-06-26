import { test, expect } from "@playwright/test";
import LoginPage from "../../page/LoginPage";
import { attachScreenshot } from '../../helpers/reporterHelper';
import LogoutPage from "../../page/LogoutPage";
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

let env = process.env.NODE_ENV?.toUpperCase() || 'PROD';
if (env === 'PRODUCTION') env = 'PROD';
const WEB_LOGIN_URL = process.env[`${env}_WEB_LOGIN_URL`];
const TEST_USER = process.env[`${env}_TEST_USER`];
const TEST_PASS = process.env[`${env}_TEST_PASS`];

test("Login Functionality", async ({ page }) => {
  let loginPage = new LoginPage(page);
  let logoutPage = new LogoutPage(page, loginPage);
  await loginPage.gotoWeb(WEB_LOGIN_URL as string)

  // TC_01: should login successfully with valid account
  await loginPage.gotoWeb(WEB_LOGIN_URL as string)
  await loginPage.login(TEST_USER as string, TEST_PASS as string);
  expect(await loginPage.verifyLoginSuccess(TEST_USER as string)).toBeTruthy();
  await attachScreenshot(page, 'After Login');
  await logoutPage.logout();

  // TC_02: should show error message with empty username and password
  await loginPage.clickOpenLogin();
  await loginPage.enterUsernameAndPassword('', '');
  expect(await loginPage.verifyValidateUsernameError('Trường không được để trống')).toBeTruthy();
  expect(await loginPage.verifyValidatePasswordError('Trường không được để trống')).toBeTruthy();

  // TC_03: should show error message with invalid username
  await loginPage.enterUsernameAndPassword('test', TEST_PASS as string);
  expect(await loginPage.loginWithInvalidUsername('Error: Không có thông tin khách hàng')).toBeTruthy();

  // TC_04: should show error message with wrong password many times
  await loginPage.enterUsernameAndPassword(TEST_USER as string, 'abc');
  expect(await loginPage.loginWithInvalidPassword('Error: Quý Khách đã nhập sai thông tin đăng nhập 1 LẦN. Quý Khách lưu ý, tài khoản sẽ bị tạm khóa nếu Quý Khách nhập sai liên tiếp 05 LẦN.')).toBeTruthy();

  await loginPage.enterUsernameAndPassword(TEST_USER as string, 'abc');
  expect(await loginPage.loginWithInvalidPassword('Error: Quý Khách đã nhập sai thông tin đăng nhập 2 LẦN. Quý Khách lưu ý, tài khoản sẽ bị tạm khóa nếu Quý Khách nhập sai liên tiếp 05 LẦN.')).toBeTruthy();

  await loginPage.enterUsernameAndPassword(TEST_USER as string, 'abc');
  expect(await loginPage.loginWithInvalidPassword('Error: Quý Khách đã nhập sai thông tin đăng nhập 3 LẦN. Quý Khách lưu ý, tài khoản sẽ bị tạm khóa nếu Quý Khách nhập sai liên tiếp 05 LẦN.')).toBeTruthy();

  // await loginPage.enterUsernameAndPassword(TEST_USER as string, 'abc');
  // expect(await loginPage.loginWithInvalidPassword('Error: Quý Khách đã nhập sai thông tin đăng nhập 4 LẦN. Quý Khách lưu ý, tài khoản sẽ bị tạm khóa nếu Quý Khách nhập sai liên tiếp 05 LẦN.')).toBeTruthy();

  // await loginPage.enterUsernameAndPassword(TEST_USER as string, 'abc');
  // expect(await loginPage.loginWithInvalidPassword('Error: Tài khoản của Quý Khách bị tạm khóa do nhập sai thông tin đăng nhập liên tiếp 05 lần. Quý Khách vui lòng sử dụng tính năng Quên mật khẩu ở màn hình đăng nhập hoặc liên hệ Phòng Dịch vụ Khách hàng của Pinetree (024 6282 3535) để được hỗ trợ.')).toBeTruthy();
  await page.close();
  console.log('test done');
});

