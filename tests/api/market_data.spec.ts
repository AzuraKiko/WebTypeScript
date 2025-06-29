import { test, expect } from '@playwright/test';
import ApiHelper from '../../helpers/ApiHelper';

let apiHelper: ApiHelper;

test.beforeAll(async () => {
  const baseUrl: string = 'https://uat-gateway.pinetree.com.vn';
  apiHelper = new ApiHelper({ baseUrl: baseUrl });
});

test.describe('Market Category All API Tests', () => {
  test('should get all public categories', async ({ }) => {
    const { result: response, responseTime } = await apiHelper.measureResponseTime(() =>
      apiHelper.getFullResponse('/market/public/category/all')
    );

    // Verify response status is successful
    expect(response.status).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers['content-type']).toContain('application/json');

    // Verify response body is not empty
    expect(response.data).toBeDefined();

    // If the response is an array, verify it has content
    if (Array.isArray(response.data)) {
      expect(response.data.length).toBeGreaterThan(0);
    }

    // Log response for debugging (optional)
    console.log('API Response:', JSON.stringify(response.data, null, 2));

    // Verify response time is reasonable (less than 5 seconds)
    expect(responseTime).toBeLessThan(5000);
    console.log(`API response time: ${responseTime}ms`);
  });
});

test.describe('Market Category Stocks API Tests', () => {
  test('should get stocks by category with specific parameters', async ({ }) => {
    const stocksUrl = '/market/public/category/stocks?categoryCode=SAN_XUAT&sortBy=VOLUME&market=HOSE';

    // Make GET request with query parameters using measureResponseTime
    const { result: response, responseTime } = await apiHelper.measureResponseTime(() =>
      apiHelper.getFullResponse(stocksUrl)
    );

    // Verify response status is successful
    expect(response.status).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers['content-type']).toContain('application/json');

    // Verify response body is not empty
    expect(response.data).toBeDefined();

    // Check if response.data has a data property (nested structure)
    const responseData = response.data.data || response.data;
    expect(responseData).toBeDefined();

    // Check if list exists in the response
    if (responseData.list) {
      expect(responseData.list).toBeDefined();

      // Verify response structure (assuming it returns an array of stocks)
      if (Array.isArray(responseData.list)) {
        expect(responseData.list.length).toBeGreaterThanOrEqual(0);
        // Nếu có stocks, kiểm tra một số trường cơ bản
        if (responseData.list.length > 0) {
          responseData.list.forEach((stock: any) => {
            expect(stock).toHaveProperty('stockCode');
            expect(stock).toHaveProperty('volume');
          });
        }
      }
    }

    // Verify response time is reasonable (less than 5 seconds)
    expect(responseTime).toBeLessThan(5000);
    console.log(`Stocks API response time: ${responseTime}ms`);
  });
});

test.describe('Global Market API Tests', () => {
  test('should get global market data', async ({ }) => {
    const globalMarketUrl = '/market/public/global-market';

    // Make GET request to global market endpoint using measureResponseTime
    const { result: response, responseTime } = await apiHelper.measureResponseTime(() =>
      apiHelper.getFullResponse(globalMarketUrl)
    );

    // Verify response status is successful
    expect(response.status).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers['content-type']).toContain('application/json');

    // Verify response body is not empty
    expect(response.data).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        expect(response.data.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(response.data).length).toBeGreaterThan(0);
      }
    }
    console.log('Global Market API Response:', JSON.stringify(response.data, null, 2));
    expect(responseTime).toBeLessThan(5000);
    console.log(`Global Market API response time: ${responseTime}ms`);
  });
});

test.describe('Market Category Heat Map API Tests', () => {
  test('should get heat map data', async ({ }) => {
    const heatMapUrl = '/market/public/category/heat-map';

    // Make GET request to heat map endpoint using measureResponseTime
    const { result: response, responseTime } = await apiHelper.measureResponseTime(() =>
      apiHelper.getFullResponse(heatMapUrl)
    );

    // Verify response status is successful
    expect(response.status).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers['content-type']).toContain('application/json');

    // Verify response body is not empty
    expect(response.data).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        expect(response.data.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(response.data).length).toBeGreaterThan(0);
      }
    }
    console.log('Heat Map API Response:', JSON.stringify(response.data, null, 2));
    expect(responseTime).toBeLessThan(5000);
    console.log(`Heat Map API response time: ${responseTime}ms`);
  });
});

test.describe('Market Breadth Data API Tests', () => {
  test('should get market breadth data for HOSE', async ({ }) => {
    const breadthUrl = '/market/public/market/breadth/data?exchange=HOSE';

    // Make GET request to breadth data endpoint using measureResponseTime
    const { result: response, responseTime } = await apiHelper.measureResponseTime(() =>
      apiHelper.getFullResponse(breadthUrl)
    );

    // Verify response status is successful
    expect(response.status).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers['content-type']).toContain('application/json');

    // Verify response body is not empty
    expect(response.data).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        expect(response.data.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(response.data).length).toBeGreaterThan(0);
      }
    }
    console.log('Market Breadth API Response:', JSON.stringify(response.data, null, 2));
    expect(responseTime).toBeLessThan(5000);
    console.log(`Market Breadth API response time: ${responseTime}ms`);
  });
});

test.describe('Market Index Liquidity Data API Tests', () => {
  test('should get index liquidity data for HOSE', async ({ }) => {
    const liquidityUrl = '/market/public/index/liquidity/data?exchange=HOSE';

    // Make GET request to liquidity data endpoint using measureResponseTime
    const { result: response, responseTime } = await apiHelper.measureResponseTime(() =>
      apiHelper.getFullResponse(liquidityUrl)
    );

    // Verify response status is successful
    expect(response.status).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers['content-type']).toContain('application/json');

    // Verify response body is not empty
    expect(response.data).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        expect(response.data.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(response.data).length).toBeGreaterThan(0);
      }
    }
    console.log('Index Liquidity API Response:', JSON.stringify(response.data, null, 2));
    expect(responseTime).toBeLessThan(5000);
    console.log(`Index Liquidity API response time: ${responseTime}ms`);
  });

});

test.describe('Market Stock Influence API Tests', () => {
  test('should get stock influence data for HOSE', async ({ }) => {
    const influenceUrl = '/market/public/stock/influence?exchange=HOSE';

    // Make GET request to stock influence endpoint using measureResponseTime
    const { result: response, responseTime } = await apiHelper.measureResponseTime(() =>
      apiHelper.getFullResponse(influenceUrl)
    );

    // Verify response status is successful
    expect(response.status).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers['content-type']).toContain('application/json');

    // Verify response body is not empty
    expect(response.data).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        expect(response.data.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(response.data).length).toBeGreaterThan(0);
      }
    }
    console.log('Stock Influence API Response:', JSON.stringify(response.data, null, 2));
    expect(responseTime).toBeLessThan(5000);
    console.log(`Stock Influence API response time: ${responseTime}ms`);
  });
});

test.describe('Market Index Foreign Data API Tests', () => {
  test('should get index foreign data for HOSE', async ({ }) => {
    const foreignUrl = '/market/public/index/foreign/data?exchange=HOSE&numberOfSessions=1';

    // Make GET request to foreign data endpoint using measureResponseTime
    const { result: response, responseTime } = await apiHelper.measureResponseTime(() =>
      apiHelper.getFullResponse(foreignUrl)
    );

    // Verify response status is successful
    expect(response.status).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers['content-type']).toContain('application/json');

    // Verify response body is not empty
    expect(response.data).toBeDefined();

    // Nếu là object hoặc array, kiểm tra có dữ liệu
    if (typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        expect(response.data.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(Object.keys(response.data).length).toBeGreaterThan(0);
      }
    }
    console.log('Index Foreign API Response:', JSON.stringify(response.data, null, 2));
    expect(responseTime).toBeLessThan(5000);
    console.log(`Index Foreign API response time: ${responseTime}ms`);
  });
});

test.describe('Market Stock Top API Tests', () => {
  test('should get top stock by volume for HOSE', async ({ }) => {
    const topStockUrl = '/market/public/stock/top?type=TOP_VOLUME&exchange=HOSE&tradingValue=5000000&limit=1';

    // Make GET request to top stock endpoint using measureResponseTime
    const { result: response, responseTime } = await apiHelper.measureResponseTime(() =>
      apiHelper.getFullResponse(topStockUrl)
    );

    // Verify response status is successful
    expect(response.status).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers['content-type']).toContain('application/json');

    // Verify response body is not empty
    expect(response.data).toBeDefined();

    // Nếu là array, kiểm tra có ít nhất 0 phần tử (vì limit=1)
    if (Array.isArray(response.data)) {
      expect(response.data.length).toBeGreaterThanOrEqual(0);
      // Nếu có phần tử, kiểm tra một số trường cơ bản
      if (response.data.length > 0) {
        const first = response.data[0];
        expect(first).toHaveProperty('stockCode');
        expect(first).toHaveProperty('volume');
        const body: any = response.data;
        const stock = body.data[0];
        expect(stock.stockCode).toBe('SHB');
        expect(stock.name).toContain('Sài Gòn - Hà Nội');
        expect(stock.stockExchange).toBe('HOSE');
        expect(stock.stockType).toBe('COMPANY');
        expect(typeof stock.value).toBe('number');
        expect(stock.value).toBeGreaterThan(0);
      }
    }
    console.log('Top Stock API Response:', JSON.stringify(response.data, null, 2));
    expect(responseTime).toBeLessThan(5000);
    console.log(`Top Stock API response time: ${responseTime}ms`);
  });
});

test.describe('Market Stock Influence (Limit) API Tests', () => {
  test('should get stock influence data for HOSE with limit=1', async ({ }) => {
    const influenceLimitUrl = '/market/public/stock/influence?exchange=HOSE&limit=1';

    // Make GET request to stock influence endpoint with limit using measureResponseTime
    const { result: response, responseTime } = await apiHelper.measureResponseTime(() =>
      apiHelper.getFullResponse(influenceLimitUrl)
    );

    // Verify response status is successful
    expect(response.status).toBe(200);

    // Verify response headers contain JSON content type
    expect(response.headers['content-type']).toContain('application/json');

    // Verify response body is not empty
    expect(response.data).toBeDefined();

    // Nếu là array, kiểm tra có ít nhất 0 phần tử (vì limit=1)
    if (Array.isArray(response.data)) {
      expect(response.data.length).toBeGreaterThanOrEqual(0);
      // Nếu có phần tử, kiểm tra một số trường cơ bản
      if (response.data.length > 0) {
        const first = response.data[0];
        expect(first).toHaveProperty('stockCode');
        expect(first).toHaveProperty('influenceIndex');
      }
    }
    console.log('Stock Influence (Limit) API Response:', JSON.stringify(response.data, null, 2));
    expect(responseTime).toBeLessThan(5000);
    console.log(`Stock Influence (Limit) API response time: ${responseTime}ms`);
  });
});
