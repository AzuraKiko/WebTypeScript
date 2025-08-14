# Test Optimization Guide - State Isolation for Parallel Execution

## 🎯 Vấn đề đã được giải quyết

Trước khi tối ưu, test suite có các vấn đề sau khi chạy song song (parallel):

1. **Global variables bị đè**: Biến `testCounter` trong `login.spec.ts` được share giữa các test
2. **Session conflicts**: Nhiều test cùng login với cùng user gây conflict session
3. **API instance sharing**: Các test có thể share state qua API helper instances
4. **Timing conflicts**: Tests chạy cùng lúc gây race conditions

## ✅ Các cải tiến đã thực hiện

### 1. **Loại bỏ Global Variables**

**Trước:**

```typescript
let testCounter = 0;
const getTestDelay = () => ++testCounter * 100;
```

**Sau:**

```typescript
const getRandomDelay = () => Math.floor(Math.random() * 200) + 100;
```

### 2. **Instance Isolation**

**Trước:**

```typescript
// Global instances có thể share state
const loginApi = new LoginApi(baseUrl);
```

**Sau:**

```typescript
// Tạo fresh instances cho mỗi test
const createFreshInstances = () => ({
  loginApi: new LoginApi(testConfig.WS_BASE_URL as string),
  orderApi: new OrderApi(testConfig.WS_BASE_URL as string),
});
```

### 3. **Configuration Instance-based**

**LoginApi.ts** - Chuyển từ global config sang instance-based:

```typescript
export default class LoginApi {
  private config: EnvironmentConfig; // Instance-based configuration

  constructor(baseUrl: string, timeout?: number) {
    // Initialize instance-based environment configuration
    const env =
      process.env.NODE_ENV?.toUpperCase() === "PRODUCTION"
        ? "PROD"
        : process.env.NODE_ENV?.toUpperCase() || "PROD";
    this.config = {
      WS_BASE_URL: process.env[`${env}_WEB_LOGIN_URL`] || baseUrl,
      // ... other config
    };
  }
}
```

### 4. **Browser Context Isolation**

**UI Tests:**

```typescript
test.beforeEach(async ({ page, context }) => {
  // Ensure clean context for each test
  await context.clearCookies();
  await context.clearPermissions();
});

test.afterEach(async ({ page, context }) => {
  // Clean up after each test
  try {
    await context.clearCookies();
    await page.close();
  } catch (error) {
    console.log("Cleanup error (ignored):", error);
  }
});
```

### 5. **Controlled Parallelism**

**Playwright Config:**

```typescript
// Giới hạn workers để tránh overwhelm server
workers: process.env.CI ? 1 : 2,
timeout: 60000, // Timeout cụ thể thay vì unlimited
```

**Test Configuration:**

```typescript
// API tests - parallel với isolation
test.describe.configure({ mode: "parallel" });

// Dangerous tests - serial để tránh account lockout
test.describe.serial("Integration Tests", () => {
  // Tests that could conflict with each other
});
```

### 6. **Enhanced Test Utils**

Tạo utilities mới trong `helpers/testUtils.ts`:

- `randomDelay()`: Random delay để tránh timing conflicts
- `cleanBrowserContext()`: Clean state cho browser isolation
- `withStateIsolation()`: Wrapper function cho state isolation
- `retryOperation()`: Retry mechanism cho flaky operations
- `TestPerformanceMonitor`: Monitor performance của tests

## 🚀 Kết quả đạt được

### ✅ State Isolation

- Mỗi test có instance riêng của API classes
- Không còn global variables shared
- Browser context được clean giữa các tests

### ✅ Parallel Execution Safety

- Tests có thể chạy song song mà không bị đè state
- Reduced race conditions thông qua random delays
- Controlled workers để tránh overwhelm server

### ✅ Improved Reliability

- Better error handling và cleanup
- Retry mechanisms cho flaky operations
- Proper timeouts để tránh hanging tests

### ✅ Better Organization

- Serial execution cho dangerous tests (account lockout)
- Parallel execution cho safe tests
- Clear separation of concerns

## 📋 Sử dụng

### Chạy tests song song an toàn:

```bash
npx playwright test --parallel
```

### Sử dụng state isolation utilities:

```typescript
import {
  withStateIsolation,
  randomDelay,
  assertions,
} from "../helpers/testUtils";

test("example with isolation", async ({ context }) => {
  await withStateIsolation(context, async () => {
    // Your test code here
    await randomDelay(); // Prevent timing conflicts

    const response = await apiCall();
    assertions.expectSuccessfulApiResponse(response);
  });
});
```

### Monitor performance:

```typescript
import { TestPerformanceMonitor } from "../helpers/testUtils";

test("performance test", async () => {
  const monitor = new TestPerformanceMonitor("login-test");

  monitor.check("Starting login");
  await performLogin();

  monitor.check("Login completed");
  const duration = monitor.end();

  expect(duration).toBeLessThan(5000);
});
```

## 📊 Best Practices

1. **Luôn sử dụng fresh instances** cho API calls
2. **Clean browser context** giữa các tests
3. **Sử dụng random delays** để tránh timing conflicts
4. **Group dangerous tests** với serial execution
5. **Monitor performance** để detect regression
6. **Proper error handling** và cleanup
7. **Limit workers** để tránh overwhelm server/account lockout

## 🔧 Configuration

Các setting quan trọng trong `playwright.config.ts`:

```typescript
{
    workers: 2,              // Giới hạn workers
    timeout: 60000,          // Test timeout
    fullyParallel: true,     // Enable parallel
    retries: 1,              // Retry failed tests
}
```

cmd
NewOrder
EditOrder
CancelOrder
getAllOrderList
PurchasePower
GetPreOrder
