import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests', //testDir: Đường dẫn đến thư mục chứa các file test. Trong trường hợp này, Playwright sẽ tìm và chạy các test trong thư mục ./tests
    timeout: 0, //Thời gian tối đa (tính bằng mili giây) cho mỗi test. 0 có nghĩa là không giới hạn thời gian.
    expect: {
        timeout: 5000 //Thời gian tối đa (tính bằng mili giây) cho mỗi assertion (kiểm tra) trong test. Ở đây là 5 giây (5000ms).
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        // baseURL: 'https://portal-tradeforgood-uat.equix.app', //URL cơ sở cho tất cả các test. Khi bạn sử dụng page.goto('/products'), nó sẽ điều hướng đến https://www.demoblaze.com/products.
        trace: 'on-first-retry', //Cấu hình khi nào Playwright nên thu thập trace (dấu vết) để debug. 'on-first-retry' có nghĩa là trace chỉ được thu thập khi test thất bại và được chạy lại lần đầu tiên. Trace bao gồm ảnh chụp màn hình, DOM, network requests, v.v.
        screenshot: 'only-on-failure',
        video: 'on', // Chỉ quay video khi fail và retry lần đầu
        // Các options khác:
        // 'on-first-retry', - Chỉ quay video khi fail và retry lần đầu
        // 'off' - Tắt hoàn toàn
        // 'on' - Luôn quay video
        // 'retain-on-failure' - Quay mọi test nhưng chỉ giữ lại nếu fail
    },
    projects: [
        {
            name: 'Chrome',
            use: {
                browserName: 'chromium',
                headless: false, //false nghĩa là trình duyệt sẽ hiển thị UI (có thể nhìn thấy), true sẽ chạy ẩn
                viewport: null, //null nghĩa là sử dụng kích thước cửa sổ trình duyệt mặc định thay vì kích thước cố định
                launchOptions: {
                    slowMo: 100, //Làm chậm tất cả các thao tác của Playwright (tính bằng mili giây) để dễ theo dõi. Ở đây là 100ms.
                    args: ['--start-maximized']
                }
            },
        },
        {
            name: 'Firefox',
            use: {
                browserName: 'firefox',
                headless: false,
                viewport: null,
                launchOptions: {
                    slowMo: 100,
                    args: ['--kiosk']
                }
            },
        },
        {
            name: 'Edge',
            use: {
                browserName: 'chromium',
                channel: 'msedge',
                headless: false,
                viewport: null,
                launchOptions: {
                    slowMo: 100,
                    args: ['--start-maximized']
                }
            },
        },
    ],
    // reporter: [
    //     ['list'], //Reporter mặc định hiển thị kết quả test dưới dạng danh sách trong terminal.
    //     ['allure-playwright', {
    //         detail: true,
    //         outputFolder: 'allure-results',
    //         suiteTitle: false
    //     }] //Reporter Allure tạo báo cáo chi tiết, tương tác và trực quan, cần cài đặt package allure-playwright và Allure CLI để sử dụng và xem báo cáo này.
    // ],
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html'
});
