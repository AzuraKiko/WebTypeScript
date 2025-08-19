import { test, expect } from '@playwright/test';
import fs from 'fs';
import { ENV } from '../utils/testConfig';
import LoginPage from '../../page/ui/LoginPage';
import OrderPage from '../../page/ui/OrderPage';
import OrderBook from '../../page/ui/OrderBook';
import SubaccPage from '../../page/ui/SubaccPage';


type CapturedCall = {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string | null;
    timestamp: string;
};
const OUTPUT_FILE = `oms_postman_collection_body_${ENV}.json`;

const functionTest: string[] = ['getAllOrderList', 'PurchasePower', 'NewOrder', 'CancelOrder', 'EditOrder'];

const DEV_API_CORE = ['http://10.8.80.104:8888/', 'http://10.8.80.164:8888/']
const UAT_API_CORE = ['http://10.8.90.16:8888/', 'http://10.8.90.164:8888/']
// const DEV_API_CORE = ['http://10.8.80.164:8888/']
// const UAT_API_CORE = ['http://10.8.90.164:8888/']

const PROD_API_CORE = ['https://trade.pinetree.vn/', 'https://trade.pinetree.vn/']

const API_DOMAINS = ENV === 'DEV' ? DEV_API_CORE : ENV === 'UAT' ? UAT_API_CORE : PROD_API_CORE;

// Normalize configured domains to origins (scheme + host + optional port)
const CONFIGURED_ORIGINS: string[] = API_DOMAINS.map((domain) => {
    try {
        return new URL(domain).origin;
    } catch {
        // If missing protocol, default to http for origin parsing
        return new URL(`http://${domain}`).origin;
    }
});

test('OMS - capture API calls to domain during trading flow', async ({ page }) => {
    const apiCalls: CapturedCall[] = [];

    function matchConfiguredDomain(url: string): boolean {
        try {
            const origin = new URL(url).origin;
            return CONFIGURED_ORIGINS.some((configuredOrigin) => origin === configuredOrigin);
        } catch {
            // Fallback: string includes check if URL parsing fails for some scheme
            return CONFIGURED_ORIGINS.some((configuredOrigin) => url.includes(configuredOrigin));
        }
    }

    function containsFunctionTest(body: string | null): boolean {
        if (!body) return false;
        return functionTest.some(func => body.includes(func));
    }

    page.on('request', (request) => {
        const url = request.url();
        const body = request.postData();

        if (matchConfiguredDomain(url) && containsFunctionTest(body)) {
            apiCalls.push({
                url,
                method: request.method(),
                headers: request.headers(),
                body: body,
                timestamp: new Date().toISOString()
            });
        }
    });

    let loginPage: LoginPage;
    let orderBook: OrderBook;
    let orderPage: OrderPage;
    let subaccPage: SubaccPage;

    loginPage = new LoginPage(page);
    orderPage = new OrderPage(page);
    orderBook = new OrderBook(page);
    subaccPage = new SubaccPage(page);

    await loginPage.loginSuccess();

    await orderPage.navigateToOrder();

    // Place order buy with normal account
    await orderPage.placeBuyOrder({ stockCode: 'ACB', quantity: 1 });
    await orderPage.verifyMessage('Đặt lệnh thành công', 'Số hiệu lệnh');
    await page.waitForTimeout(3000);

    // Place order sell with normal account
    await orderPage.placeSellOrderFromPorfolio({ quantity: 1 });
    await orderPage.verifyMessage('Đặt lệnh thành công', 'Số hiệu lệnh');
    await page.waitForTimeout(3000);

    // Place order buy with margin account
    await subaccPage.selectMarginSubacc();
    await orderPage.placeBuyOrder({ stockCode: 'MBB', quantity: 1 });
    await orderPage.verifyMessage('Đặt lệnh thành công', 'Số hiệu lệnh');
    await page.waitForTimeout(3000);

    // // Place order sell with margin account
    // await subaccPage.selectMarginSubacc();
    // await orderPage.placeSellOrderFromPorfolio({ quantity: 1 });
    // await orderPage.verifyMessage('Đặt lệnh thành công', 'Số hiệu lệnh');
    // await page.waitForTimeout(3000);

    // // Modify order with normal account
    // await orderBook.openOrderBook();
    // await orderBook.filterByAccount('Normal');
    // await orderBook.filterByStatus('Pending');
    // await orderBook.modifyOrderByStockCode('ACB', undefined, '2');
    // await orderPage.verifyMessage('Chỉnh sửa lệnh thành công', 'Số hiệu lệnh');
    // await page.waitForTimeout(3000);

    // // Modify order with margin account
    // await orderBook.openOrderBook();
    // await orderBook.filterByAccount('Margin');
    // await orderBook.filterByOrderType('Buy');
    // await orderBook.filterByStatus('Pending');
    // await orderBook.modifyOrderByStockCode('MBB', undefined, '2');
    // await orderPage.verifyMessage('Chỉnh sửa lệnh thành công', 'Số hiệu lệnh');
    // await page.waitForTimeout(3000);



    const postmanCollection = {
        info: {
            name: `OMS Captured API - ${API_DOMAINS.join(', ')}`,
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: apiCalls.map((call) => ({
            name: `${call.method} ${call.url}`,
            request: {
                method: call.method,
                header: Object.entries(call.headers).map(([key, value]) => ({ key, value })),
                body: call.body ? { mode: 'raw', raw: call.body } : undefined,
                url: call.url
            }
        }))
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(postmanCollection, null, 2), 'utf-8');
    console.log(`Đã lưu Postman Collection vào "${OUTPUT_FILE}"`);

    fs.writeFileSync('api_calls_body.json', JSON.stringify(apiCalls, null, 2), 'utf-8');
});