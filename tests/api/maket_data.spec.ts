import { test, expect } from '@playwright/test';


test.describe('Market Category All API Tests', () => {
  
  const allCategoriesUrl = 'https://uat-gateway.pinetree.com.vn/market/public/category/all';

  test('should get all public categories', async ({ request }) => {
    // Make GET request to the categories endpoint
    const response = await request.get(allCategoriesUrl);

    // Verify response status is successful
    expect(response.status()).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers()['content-type']).toContain('application/json');

    // Parse response body
    const responseBody = await response.json();

    // Verify response body is not empty
    expect(responseBody).toBeDefined();

    // If the response is an array, verify it has content
    if (Array.isArray(responseBody)) {
      expect(responseBody.length).toBeGreaterThan(0);
    }

    // Log response for debugging (optional)
    console.log('API Response:', responseBody);
  });

  test('should handle API response time', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(allCategoriesUrl);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Verify response status
    expect(response.status()).toBe(200);

    // Verify response time is reasonable (less than 5 seconds)
    expect(responseTime).toBeLessThan(5000);

    console.log(`API response time: ${responseTime}ms`);
  });
});

test.describe('Market Category Stocks API Tests', () => {
  const stocksUrl = 'https://uat-gateway.pinetree.com.vn/market/public/category/stocks?categoryCode=SAN_XUAT&sortBy=VOLUME&market=HOSE';

  test('should get stocks by category with specific parameters', async ({ request }) => {
    // Make GET request with query parameters
    const response = await request.get(stocksUrl);

    // Verify response status is successful
    expect(response.status()).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers()['content-type']).toContain('application/json');

    // Parse response body
    const responseBody = await response.json();

    // Verify response body is not empty
    expect(responseBody).toBeDefined();

    // Verify response structure (assuming it returns an array of stocks)
    if (Array.isArray(responseBody)) {
      expect(responseBody.length).toBeGreaterThanOrEqual(0);
      // Nếu có stocks, kiểm tra một số trường cơ bản
      if (responseBody.length > 0) {
        const firstStock = responseBody[0];
        expect(firstStock).toHaveProperty('symbol');
        expect(firstStock).toHaveProperty('volume');
      }
    }
    console.log('Stocks API Response:', responseBody);
  });

  test('should handle stocks API response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(stocksUrl);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(10000); // 10 giây
    console.log(`Stocks API response time: ${responseTime}ms`);
  });
});

test.describe('Global Market API Tests', () => {
  const globalMarketUrl = 'https://uat-gateway.pinetree.com.vn/market/public/global-market';

  test('should get global market data', async ({ request }) => {
    // Make GET request to global market endpoint
    const response = await request.get(globalMarketUrl);

    // Verify response status is successful
    expect(response.status()).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers()['content-type']).toContain('application/json');

    // Parse response body
    const responseBody = await response.json();

    // Verify response body is not empty
    expect(responseBody).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof responseBody === 'object') {
      if (Array.isArray(responseBody)) {
        expect(responseBody.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(responseBody).length).toBeGreaterThan(0);
      }
    }
    console.log('Global Market API Response:', responseBody);
  });

  test('should handle global market API response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(globalMarketUrl);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // 5 giây
    console.log(`Global Market API response time: ${responseTime}ms`);
  });
});

test.describe('Market Category Heat Map API Tests', () => {
  const heatMapUrl = 'https://uat-gateway.pinetree.com.vn/market/public/category/heat-map';

  test('should get heat map data', async ({ request }) => {
    // Make GET request to heat map endpoint
    const response = await request.get(heatMapUrl);

    // Verify response status is successful
    expect(response.status()).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers()['content-type']).toContain('application/json');

    // Parse response body
    const responseBody = await response.json();

    // Verify response body is not empty
    expect(responseBody).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof responseBody === 'object') {
      if (Array.isArray(responseBody)) {
        expect(responseBody.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(responseBody).length).toBeGreaterThan(0);
      }
    }
    console.log('Heat Map API Response:', responseBody);
  });

  test('should handle heat map API response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(heatMapUrl);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // 5 giây
    console.log(`Heat Map API response time: ${responseTime}ms`);
  });
});

test.describe('Market Breadth Data API Tests', () => {
  const breadthUrl = 'https://uat-gateway.pinetree.com.vn/market/public/market/breadth/data?exchange=HOSE';

  test('should get market breadth data for HOSE', async ({ request }) => {
    // Make GET request to breadth data endpoint
    const response = await request.get(breadthUrl);

    // Verify response status is successful
    expect(response.status()).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers()['content-type']).toContain('application/json');

    // Parse response body
    const responseBody = await response.json();

    // Verify response body is not empty
    expect(responseBody).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof responseBody === 'object') {
      if (Array.isArray(responseBody)) {
        expect(responseBody.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(responseBody).length).toBeGreaterThan(0);
      }
    }
    console.log('Market Breadth API Response:', responseBody);
  });

  test('should handle market breadth API response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(breadthUrl);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // 5 giây
    console.log(`Market Breadth API response time: ${responseTime}ms`);
  });
});

test.describe('Market Index Liquidity Data API Tests', () => {
  const liquidityUrl = 'https://uat-gateway.pinetree.com.vn/market/public/index/liquidity/data?exchange=HOSE';

  test('should get index liquidity data for HOSE', async ({ request }) => {
    // Make GET request to liquidity data endpoint
    const response = await request.get(liquidityUrl);

    // Verify response status is successful
    expect(response.status()).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers()['content-type']).toContain('application/json');

    // Parse response body
    const responseBody = await response.json();

    // Verify response body is not empty
    expect(responseBody).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof responseBody === 'object') {
      if (Array.isArray(responseBody)) {
        expect(responseBody.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(responseBody).length).toBeGreaterThan(0);
      }
    }
    console.log('Index Liquidity API Response:', responseBody);
  });

  test('should handle index liquidity API response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(liquidityUrl);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // 5 giây
    console.log(`Index Liquidity API response time: ${responseTime}ms`);
  });
});

test.describe('Market Stock Influence API Tests', () => {
  const influenceUrl = 'https://uat-gateway.pinetree.com.vn/market/public/stock/influence?exchange=HOSE';

  test('should get stock influence data for HOSE', async ({ request }) => {
    // Make GET request to stock influence endpoint
    const response = await request.get(influenceUrl);

    // Verify response status is successful
    expect(response.status()).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers()['content-type']).toContain('application/json');

    // Parse response body
    const responseBody = await response.json();

    // Verify response body is not empty
    expect(responseBody).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof responseBody === 'object') {
      if (Array.isArray(responseBody)) {
        expect(responseBody.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(responseBody).length).toBeGreaterThan(0);
      }
    }
    console.log('Stock Influence API Response:', responseBody);
  });

  test('should handle stock influence API response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(influenceUrl);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // 5 giây
    console.log(`Stock Influence API response time: ${responseTime}ms`);
  });
});

test.describe('Market Index Foreign Data API Tests', () => {
  const foreignUrl = 'https://uat-gateway.pinetree.com.vn/market/public/index/foreign/data?exchange=HOSE&numberOfSessions=1';

  test('should get index foreign data for HOSE', async ({ request }) => {
    // Make GET request to foreign data endpoint
    const response = await request.get(foreignUrl);

    // Verify response status is successful
    expect(response.status()).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers()['content-type']).toContain('application/json');

    // Parse response body
    const responseBody = await response.json();

    // Verify response body is not empty
    expect(responseBody).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof responseBody === 'object') {
      if (Array.isArray(responseBody)) {
        expect(responseBody.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(responseBody).length).toBeGreaterThan(0);
      }
    }
    console.log('Index Foreign API Response:', responseBody);
  });

  test('should handle index foreign API response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(foreignUrl);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // 5 giây
    console.log(`Index Foreign API response time: ${responseTime}ms`);
  });
});

test.describe('Market Stock Top API Tests', () => {
  const topStockUrl = 'https://uat-gateway.pinetree.com.vn/market/public/stock/top?type=TOP_VOLUME&exchange=HOSE&tradingValue=5000000&limit=1';

  test('should get top stock by volume for HOSE', async ({ request }) => {
    // Make GET request to top stock endpoint
    const response = await request.get(topStockUrl);

    // Verify response status is successful
    expect(response.status()).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers()['content-type']).toContain('application/json');

    // Parse response body
    const responseBody = await response.json();

    // Verify response body is not empty
    expect(responseBody).toBeDefined();

    // Nếu là array, kiểm tra có ít nhất 0 phần tử (vì limit=1)
    if (Array.isArray(responseBody)) {
      expect(responseBody.length).toBeGreaterThanOrEqual(0);
      // Nếu có phần tử, kiểm tra một số trường cơ bản
      if (responseBody.length > 0) {
        const first = responseBody[0];
        expect(first).toHaveProperty('symbol');
        expect(first).toHaveProperty('volume');
      }
    }
    console.log('Top Stock API Response:', responseBody);
  });

  test('should handle top stock API response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(topStockUrl);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // 5 giây
    const body = await response.json();
    const stock = body.data[0];
  
    expect(stock.stockCode).toBe('SHB');
    expect(stock.name).toContain('Sài Gòn - Hà Nội');
    expect(stock.stockExchange).toBe('HOSE');
    expect(stock.stockType).toBe('COMPANY');
    expect(typeof stock.value).toBe('number');
    expect(stock.value).toBeGreaterThan(0);
  
    expect(stock.lastPrice).toBeCloseTo(13.05, 2); // kiểm tra gần đúng 2 chữ số
    expect(stock.changePc).toBe('-1.14');
    expect(stock.changePriceValue).toBeLessThan(0);
    console.log(`Top Stock API response time: ${responseTime}ms`);
  });
});

test.describe('Market Stock Influence (Limit) API Tests', () => {
  const influenceLimitUrl = 'https://uat-gateway.pinetree.com.vn/market/public/stock/influence?exchange=HOSE&limit=1';

  test('should get stock influence data for HOSE with limit=1', async ({ request }) => {
    // Make GET request to stock influence endpoint with limit
    const response = await request.get(influenceLimitUrl);

    // Verify response status is successful
    expect(response.status()).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers()['content-type']).toContain('application/json');

    // Parse response body
    const responseBody = await response.json();

    // Verify response body is not empty
    expect(responseBody).toBeDefined();

    // Nếu là array, kiểm tra có ít nhất 0 phần tử (vì limit=1)
    if (Array.isArray(responseBody)) {
      expect(responseBody.length).toBeGreaterThanOrEqual(0);
      // Nếu có phần tử, kiểm tra một số trường cơ bản
      if (responseBody.length > 0) {
        const first = responseBody[0];
        expect(first).toHaveProperty('symbol');
        expect(first).toHaveProperty('influence');
      }
    }
    console.log('Stock Influence (Limit) API Response:', responseBody);
  });

  test('should handle stock influence (limit) API response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(influenceLimitUrl);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // 5 giây
    console.log(`Stock Influence (Limit) API response time: ${responseTime}ms`);
  });
});
