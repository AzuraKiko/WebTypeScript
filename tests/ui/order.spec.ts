import { test, expect } from '@playwright/test';
import LoginPage from '../../page/LoginPage';
import OrderPage from '../../page/OrderPage';

test('test', async ({ page }) => {
  let loginPage = new LoginPage(page);
  let orderPage = new OrderPage(page);

  await loginPage.loginSuccess();
  await orderPage.openOrder();
  await orderPage.enterMatrix();

  // === ĐẶT LỆNH ===
  // Danh sách mã cổ phiếu
  const stockCodes = ['MBG', 'TTH', 'ITQ', 'HDA', 'NSH', 'VHE', 'CET', 'KSD'];
  // Random 1 mã bất kỳ
  const randomCode = stockCodes[Math.floor(Math.random() * stockCodes.length)];
  // Điền vào ô input "Mã CK"
  await page.getByPlaceholder('Mã CK', { exact: true }).fill(randomCode);
  // await page.getByPlaceholder('Mã CK', { exact: true }).fill('CEO');
  // await page.getByText('11.7').dblclick();
  const count = await page.locator('span.cursor-pointer.f').count();
  console.log('Số phần tử có class cursor-pointer f:', count);
  const target = page.locator('span.cursor-pointer.f');
  await expect(target).toHaveCount(1); // Đảm bảo có đúng 1 phần tử
  await target.scrollIntoViewIfNeeded(); // Kéo vào view
  await expect(target).toBeVisible(); // Chắc chắn thấy được
  await target.dblclick(); // Rồi mới dblclick
  await page.getByPlaceholder('KL x1').fill('1');
  await page.getByRole('button', { name: 'Đặt lệnh' }).click();
  await page.getByRole('button', { name: 'Xác nhận' }).click();

  const messageError = await page.locator('#root div').filter({ hasText: 'Đặt lệnh không thành côngError: Hệ thống sẽ nhận lệnh cho ngày giao dịch tiếp' }).nth(2);
  if (await messageError.isVisible()) {
    const text = await messageError.textContent(); // hoặc .innerText()
    console.log('Message error:', text);
  } else {
    // === HUỶ LỆNH ===
    await page.getByText('Sổ lệnh').click();
    await page.locator('td:nth-child(14) > div > span:nth-child(2) > .icon').first().click();
    await page.getByRole('button', { name: 'Xác nhận' }).click();
  }
});