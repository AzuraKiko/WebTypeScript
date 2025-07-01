// web/helpers/testUtils.ts
// chức năng login, delay

import { Page, expect, BrowserContext } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enhanced login function with proper error handling and state isolation
 */
export async function login(page: Page, username: string, password: string): Promise<void> {
  await page.goto('https://pinex.vn/auth/login');
  await page.fill('#new-input-username', username);
  await page.fill('#new-input-password', password);
  await page.click('#loginBtn');
  await page.waitForURL('/dashboard');
}

/**
 * Enhanced wait function with better promise handling
 */
export async function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Random delay to prevent timing conflicts in parallel tests
 */
export function getRandomDelay(min: number = 100, max: number = 300): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Async random delay
 */
export async function randomDelay(min: number = 100, max: number = 300): Promise<void> {
  const delay = getRandomDelay(min, max);
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Generate unique test identifier for isolation
 */
export function generateTestId(): string {
  return uuidv4().substring(0, 8);
}

/**
 * Clean browser context for state isolation
 */
export async function cleanBrowserContext(context: BrowserContext): Promise<void> {
  try {
    await context.clearCookies();
    await context.clearPermissions();
    // Clear local/session storage if needed
    const pages = context.pages();
    for (const page of pages) {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
  } catch (error) {
    // Ignore cleanup errors but log them for debugging
    console.log('Browser context cleanup error (ignored):', error);
  }
}

/**
 * Safe page close with error handling
 */
export async function safePageClose(page: Page): Promise<void> {
  try {
    if (!page.isClosed()) {
      await page.close();
    }
  } catch (error) {
    console.log('Page close error (ignored):', error);
  }
}

/**
 * Retry mechanism for flaky operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        await wait(delayMs / 1000);
      }
    }
  }

  throw lastError!;
}

/**
 * State isolation wrapper for test functions
 */
export async function withStateIsolation<T>(
  context: BrowserContext,
  testOperation: () => Promise<T>
): Promise<T> {
  // Clean state before test
  await cleanBrowserContext(context);

  try {
    // Execute test with random delay to avoid timing conflicts
    await randomDelay();
    return await testOperation();
  } finally {
    // Clean state after test (best effort)
    await cleanBrowserContext(context);
  }
}

/**
 * Assertion helpers for consistent testing
 */
export const assertions = {
  expectSuccessfulApiResponse: (response: any) => {
    expect(response).toBeDefined();
    expect(response).toHaveProperty("data");
    expect(response.rc).toBe(1);
  },

  expectFailedApiResponse: (response: any, expectedMessage?: string) => {
    expect(response).toBeDefined();
    expect(response).toHaveProperty("data");
    expect(String(response.rc)).toBe("-1");

    if (expectedMessage && response.data) {
      expect((response.data as any).message).toBe(expectedMessage);
    }
  },

  expectSuccessfulLoginData: (data: any) => {
    expect(data).toHaveProperty("session");
    expect(data).toHaveProperty("cif");
    expect(data.session).toBeDefined();
    expect(data.cif).toBeDefined();
    expect(data.session.length).toBeGreaterThan(0);
    expect(data.cif.length).toBeGreaterThan(0);
  }
};

/**
 * Test execution modes
 */
export const TestModes = {
  PARALLEL: 'parallel',
  SERIAL: 'serial',
  DEFAULT: 'default'
} as const;

/**
 * Performance monitoring for tests
 */
export class TestPerformanceMonitor {
  private startTime: number;
  private testName: string;

  constructor(testName: string) {
    this.testName = testName;
    this.startTime = Date.now();
  }

  end(): number {
    const duration = Date.now() - this.startTime;
    console.log(`Test "${this.testName}" completed in ${duration}ms`);
    return duration;
  }

  check(operation: string): void {
    const elapsed = Date.now() - this.startTime;
    console.log(`Test "${this.testName}" - ${operation} at ${elapsed}ms`);
  }
}
