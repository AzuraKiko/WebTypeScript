// web/helpers/testUtils.ts
// chức năng login, delay

import { Page, expect } from '@playwright/test';

export async function login(page: Page, username: string, password: string) {
  await page.goto('https://pinex.vn/auth/login');
  await page.fill('#new-input-username', username);
  await page.fill('#new-input-password', password);
  await page.click('#loginBtn');
  await page.waitForURL('/dashboard');
}

export async function wait(seconds: number) {
  return new Promise((res) => setTimeout(res, seconds * 1000));
}
