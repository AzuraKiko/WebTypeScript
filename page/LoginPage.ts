import { Page, Locator } from '@playwright/test';
import BasePage from './BasePage';

class LoginPage extends BasePage {
    openLogin: Locator;
    usernameInput: Locator;
    passwordInput: Locator;
    loginButton: Locator;
    forgotPasswordLink: Locator;
    openAccountLink: Locator;
    verifyUser: Locator;
    invalidLogin: Locator;
    usernameError: Locator;
    passwordError: Locator;
    closeBanner: Locator;

    constructor(page: Page) {
        super(page);
        this.openLogin = page.locator('.header-btn.btn-login');
        this.usernameInput = page.locator('[name="username"]');
        this.passwordInput = page.locator('[name="password"]');
        this.loginButton = page.locator('.btn.btn-submit');
        this.forgotPasswordLink = page.locator('.btn.btn-forgot-password');
        this.openAccountLink = page.locator('.btn.btn--primary2.mt-3');
        this.verifyUser = page.locator('.header-btn .icon.iAccount + span');
        this.invalidLogin = page.locator('.d.mt-2 ul li');
        this.usernameError = page.locator('.order-text:has(input[name="password"]) + .d.mt-2');
        this.passwordError = page.locator('.order-text:has(input[name="password"]) + .d.mt-2');
        this.closeBanner = page.locator('.btn-icon.btn--light > span');
    }

    async gotoWeb(baseURL: string) {
        await this.page.goto(baseURL);
    }

    async clickOpenLogin() {
        await this.openLogin.click();
    }

    async enterUsername(username: string) {
        await this.usernameInput.fill(username);
    }

    async enterPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async clickLoginButton() {
        await this.loginButton.click();
    }

    async clickCloseBanner() {
        await this.page.waitForTimeout(3000);
        if (await this.closeBanner.isVisible()) {
            await this.closeBanner.click();
        }
    }

    async login(username: string, password: string) {
        await this.clickOpenLogin();
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
        await this.waitForPageLoad();
        await this.clickCloseBanner();
    }

    async enterUsernameAndPassword(username: string, password: string) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }

    async verifyLoginSuccess(username: string) {
        await this.verifyUser.waitFor({ state: 'visible', timeout: 3000 });
        const text = await this.verifyUser.textContent();
        return text?.trim() === username;
    }

    async verifyValidateUsernameError(expectedError: string) {
        await this.usernameError.waitFor({ state: 'visible', timeout: 3000 });
        const errorText = await this.usernameError.textContent();
        return errorText?.trim() === expectedError;
    }

    async verifyValidatePasswordError(expectedError: string) {
        await this.passwordError.waitFor({ state: 'visible', timeout: 3000 });
        const errorText = await this.passwordError.textContent();
        return errorText?.trim() === expectedError;
    }

    async loginWithInvalidUsername(expectedError: string) {
        await this.invalidLogin.waitFor({ state: 'visible', timeout: 3000 });
        const errorText = await this.invalidLogin.textContent();
        return errorText?.trim() === expectedError;
    }

    async loginWithInvalidPassword(expectedError: string) {
        await this.invalidLogin.waitFor({ state: 'visible', timeout: 3000 });
        const errorText = await this.invalidLogin.textContent();
        return errorText?.trim() === expectedError;
    }

    async forgotPassword() {
        await this.forgotPasswordLink.click();
    }

    async openAccount() {
        await this.openAccountLink.click();
    }
}

export default LoginPage;
