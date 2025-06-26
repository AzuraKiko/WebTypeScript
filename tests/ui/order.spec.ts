import { test, expect } from '@playwright/test';
 

const matrix = {
  A: ['0', '0', '2', 'X', 'S', 'N', '6'],
  B: ['S', 'I', '0', 'G', '4', 'G', '5'],
  C: ['0', 'V', 'R', 'U', 'W', 'U', '4'],
  D: ['2', '9', 'P', 'M', 'L', '0', 'X'],
  E: ['0', 'U', '7', 'X', '0', 'S', '1'],
  F: ['M', '9', '1', '5', 'G', '5', '6'],
  G: ['C', '9', 'V', 'X', 'K', '8', 'K']
};

 
function getMatrixCode(coord: string) {
  const row = coord[0] as keyof typeof matrix;
  const col = parseInt(coord[1]) - 1;
  return matrix[row][col];
}
 
test('test', async ({ page }) => {
  
  await page.goto('https://trade.pinetree.vn/#/home/bang-gia/vn30');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.getByPlaceholder('Tên đăng nhập').fill('thunvt');
  await page.getByPlaceholder('Mật khẩu').fill('Thethu#4');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.waitForTimeout(5000);
  // Bỏ chọn nếu có hộp thoại 2FA
  // Click bỏ popup
  const dialogSpan = page.locator('span.btn-icon.btn--light > span.icon.iClose');
  if (await dialogSpan.isVisible()) {
      await dialogSpan.click();
  }
  await page.getByText('Đặt lệnh').click();
 
  // === LẤY TỌA ĐỘ OTP MATRIX ===
  await page.waitForTimeout(5000);
  const coords = await page.locator('p.fw-500').allTextContents();
  const coord1 = coords[0];
  const coord2 = coords[1];
  const coord3 = coords[2];
 
  // === LẤY GIÁ TRỊ THEO BẢNG MA TRẬN ===
  const val1 = getMatrixCode(coord1.trim());
  const val2 = getMatrixCode(coord2.trim());
  const val3 = getMatrixCode(coord3.trim());
 
  // === ĐIỀN MÃ VÀO 3 INPUT ===
  await page.locator('input[name="inputEl1"]').fill(val1);
  await page.locator('input[name="inputEl2"]').fill(val2);
  await page.locator('input[name="inputEl3"]').fill(val3);
  await page.getByRole('button', { name: 'Xác nhận' }).click();
 
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
  }else{
    // === HUỶ LỆNH ===
  await page.getByText('Sổ lệnh').click();
  await page.locator('td:nth-child(14) > div > span:nth-child(2) > .icon').first().click();
  await page.getByRole('button', { name: 'Xác nhận' }).click();
  }
});