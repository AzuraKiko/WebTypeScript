✅ npx playwright install
✅ npm i -D @playwright/test allure-playwright
✅ npm i -g allure-commandline
npx playwright test --reporter=html
npx playwright show-report
✅ npx playwright test --reporter=allure-playwright
✅ allure serve allure-results

✅ npx playwright test --project=Chrome
npx playwright test
Get-ChildItem -Recurse -Filter "playwright.config.js"

Di chuyển file cấu hình vào thư mục gốc
Move-Item -Path "E:\Playwright\config\playwright.config.js" -Destination "E:\Playwright\"

npx playwright test --project=Chrome

kiểm tra xem file cấu hình có tồn tại không
Test-Path "E:\Playwright\config\playwright.config.js"

# Tạo thư mục lib

New-Item -Path "E:\Playwright\lib" -ItemType Directory -Force

# Tạo file BaseTest.js

New-Item -Path "E:\Playwright\lib\BaseTest.js" -ItemType File -Force

{
"scripts": {
"test": "playwright test --config=config/playwright.config.js",
"test:chrome": "playwright test --config=config/playwright.config.js --project=Chrome",
"test:firefox": "playwright test --config=config/playwright.config.js --project=Firefox",
"test:edge": "playwright test --config=config/playwright.config.js --project=Edge"
}
}

npm run test:chrome

Kiểm tra cài đặt Playwright
npm list @playwright/test

Nếu không thấy @playwright/test, hãy cài đặt:
npm install -D @playwright/test
npx playwright install

1. Cài đặt allure-playwright
   npm install -D allure-playwright

2. Cài đặt Allure Command Line (nếu bạn muốn xem báo cáo)
   npm install -D allure-commandline
   npm list

npx playwright test --config=config/playwright.config.js --project=Chrome --debug

Get-Content "E:\Playwright\config\playwright.config.js"

![alt text](image.png)

7. Báo cáo với Allure

# Cài đặt Allure Playwright reporter

npm install -D allure-playwright

# Chạy test với Allure reporter

npx playwright test --reporter=allure-playwright

# Tạo báo cáo Allure

npx allure generate ./allure-results --clean

# Mở báo cáo Allure

npx allure open ./allure-report

Nếu bạn đang chạy tests trong môi trường CI/CD (như GitHub Actions, Jenkins, etc.), bạn có thể cấu hình để lưu báo cáo dưới dạng artifacts:

- name: Run Playwright tests
  run: npx playwright test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
  name: playwright-report
  path: playwright-report/
  retention-days: 30

npx playwright show-report my-report

npx playwright show-trace e:/Playwright/test-results/.playwright-artifacts-0/traces/trace-file-name.zip

npx allure serve allure-results

npx playwright test tests/login/Login.spec.js --config=config/playwright.config.js --project=Chrome

npm run test:login

npm run test:chrome tests/login/Login.spec.js

npm run test:prod:chrome tests/ui/login.spec.ts

npx playwright test --list

npm install --save-dev @types/dotenv
npm install uuid @types/uuid
npm install --save-dev cross-env
npm install qs @types/qs --save

npm install --silent
npx --yes playwright install --with-deps | cat
npm run test:dev:chrome --silent | cat
