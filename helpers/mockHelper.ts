// mock api

import { Page, Route } from '@playwright/test';

export async function mockApi(page: Page, url: string, mockData: any) {
  await page.route(url, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockData),
    });
  });
}

// Common Mock Data Functions

/**
 * Generate mock user profile data
 */
export function mockUserProfile(overrides: Partial<any> = {}) {
  return {
    id: Math.floor(Math.random() * 10000),
    username: `user_${Math.random().toString(36).substring(2, 11)}`,
    email: `test.user${Math.floor(Math.random() * 1000)}@example.com`,
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    role: 'trader',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: true
    },
    ...overrides
  };
}

/**
 * Generate mock login response data
 */
export function mockLoginResponse(overrides: Partial<any> = {}) {
  return {
    success: true,
    token: `jwt_${Math.random().toString(36).substring(2, 42)}`,
    refreshToken: `refresh_${Math.random().toString(36).substring(2, 42)}`,
    expiresIn: 3600,
    user: mockUserProfile(),
    permissions: ['trade', 'view_portfolio', 'view_orders'],
    ...overrides
  };
}

/**
 * Generate mock order data
 */
export function mockOrderData(overrides: Partial<any> = {}) {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA'];
  const orderTypes = ['market', 'limit', 'stop', 'stop_limit'];
  const sides = ['buy', 'sell'];
  const statuses = ['pending', 'filled', 'cancelled', 'partially_filled'];

  return {
    id: `order_${Math.random().toString(36).substring(2, 12)}`,
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    side: sides[Math.floor(Math.random() * sides.length)],
    orderType: orderTypes[Math.floor(Math.random() * orderTypes.length)],
    quantity: Math.floor(Math.random() * 1000) + 1,
    price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    filledQuantity: 0,
    remainingQuantity: 0,
    ...overrides
  };
}

/**
 * Generate multiple mock orders
 */
export function mockOrdersList(count: number = 5, overrides: Partial<any> = {}) {
  return Array.from({ length: count }, () => mockOrderData(overrides));
}

/**
 * Generate mock portfolio position data
 */
export function mockPortfolioPosition(overrides: Partial<any> = {}) {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA'];

  return {
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    quantity: Math.floor(Math.random() * 1000) + 1,
    averagePrice: parseFloat((Math.random() * 300 + 10).toFixed(2)),
    currentPrice: parseFloat((Math.random() * 350 + 10).toFixed(2)),
    marketValue: 0, // calculated field
    unrealizedPnL: 0, // calculated field
    unrealizedPnLPercent: 0, // calculated field
    ...overrides
  };
}

/**
 * Generate mock portfolio data
 */
export function mockPortfolioData(overrides: Partial<any> = {}) {
  const positions = Array.from({ length: 5 }, () => mockPortfolioPosition());
  const totalValue = positions.reduce((sum, pos) => sum + (pos.quantity * pos.currentPrice), 0);

  return {
    accountId: `acc_${Math.random().toString(36).substring(2, 12)}`,
    totalValue: parseFloat(totalValue.toFixed(2)),
    availableCash: parseFloat((Math.random() * 10000).toFixed(2)),
    totalPnL: parseFloat((Math.random() * 2000 - 1000).toFixed(2)),
    totalPnLPercent: parseFloat((Math.random() * 20 - 10).toFixed(2)),
    positions,
    ...overrides
  };
}

/**
 * Generate mock market data
 */
export function mockMarketData(symbol: string = 'AAPL', overrides: Partial<any> = {}) {
  const basePrice = 150 + Math.random() * 200;
  const change = (Math.random() - 0.5) * 10;

  return {
    symbol,
    price: parseFloat(basePrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000),
    high: parseFloat((basePrice + Math.random() * 10).toFixed(2)),
    low: parseFloat((basePrice - Math.random() * 10).toFixed(2)),
    open: parseFloat((basePrice + (Math.random() - 0.5) * 5).toFixed(2)),
    timestamp: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Generate mock asset data
 */
export function mockAssetData(overrides: Partial<any> = {}) {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA'];
  const names = ['Apple Inc.', 'Alphabet Inc.', 'Microsoft Corporation', 'Tesla Inc.', 'Amazon.com Inc.', 'Meta Platforms Inc.', 'NVIDIA Corporation'];
  const index = Math.floor(Math.random() * symbols.length);

  return {
    symbol: symbols[index],
    name: names[index],
    type: 'stock',
    exchange: 'NASDAQ',
    currency: 'USD',
    tradeable: true,
    active: true,
    ...overrides
  };
}

/**
 * Generate mock error response
 */
export function mockErrorResponse(code: number = 400, message: string = 'Bad Request', overrides: Partial<any> = {}) {
  return {
    error: true,
    code,
    message,
    timestamp: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Generate mock API response wrapper
 */
export function mockApiResponse(data: any, success: boolean = true, overrides: Partial<any> = {}) {
  return {
    success,
    data,
    timestamp: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Generate random string of specified length
 */
export function randomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Generate random number between min and max
 */
export function randomNumber(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random date between two dates
 */
export function randomDate(start: Date = new Date(2023, 0, 1), end: Date = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate mock trade history data
 */
export function mockTradeHistory(count: number = 10, overrides: Partial<any> = {}) {
  return Array.from({ length: count }, () => ({
    id: `trade_${randomString(10)}`,
    orderId: `order_${randomString(10)}`,
    symbol: mockAssetData().symbol,
    side: Math.random() > 0.5 ? 'buy' : 'sell',
    quantity: randomNumber(1, 1000),
    price: parseFloat((Math.random() * 300 + 10).toFixed(2)),
    commission: parseFloat((Math.random() * 5).toFixed(2)),
    timestamp: randomDate().toISOString(),
    ...overrides
  }));
}