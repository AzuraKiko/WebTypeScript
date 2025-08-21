import { test, expect } from '@playwright/test';
import fs from 'fs';
import { ENV } from '../utils/testConfig';
import LoginPage from '../../page/ui/LoginPage';
import OrderPage from '../../page/ui/OrderPage';
import OrderBook from '../../page/ui/OrderBook';
import SubaccPage from '../../page/ui/SubaccPage';
import { WaitUtils } from '../../helpers/uiUtils';


type CapturedCall = {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string | null;
    timestamp: string;
};
const OUTPUT_FILE = `oms_postman_collection_url_${ENV}.json`;
// const DEV_API_CORE = ['http://10.8.80.104:8888/', 'http://10.8.80.164:8888/']
// const UAT_API_CORE = ['http://10.8.90.16:8888/', 'http://10.8.90.164:8888/']
const DEV_API_CORE = ['http://10.8.80.164:8888/']
const UAT_API_CORE = ['http://10.8.90.164:8888/']

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

    page.on('request', (request) => {
        const url = request.url();
        if (matchConfiguredDomain(url)) {
            apiCalls.push({
                url,
                method: request.method(),
                headers: request.headers(),
                body: request.postData(),
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
    await orderPage.placeBuyOrder({ stockCode: 'CACB2502', quantity: 1 });
    await orderPage.verifyMessageOrder(['Đặt lệnh thành công', 'Thông báo'], ['Số hiệu lệnh', 'thành công']);
    await page.waitForTimeout(3000);
    const newPrice: number = Number(await orderPage.priceFloor.textContent()) + 0.1;
    await orderPage.openOrderInDayTab();
    await orderBook.modifyOrder(0, newPrice, undefined);
    await orderPage.closeAllToastMessages(orderPage.toastMessage);
    await orderBook.cancelOrder(0);
    await orderPage.closeAllToastMessages(orderPage.toastMessage);
    await WaitUtils.waitForAllElements(orderPage.toastMessage, { state: 'hidden', timeout: 30000 });

    // Place order sell with normal account
    await orderPage.placeSellOrderFromPorfolio({ quantity: 1 });
    await orderPage.verifyMessageOrder(['Đặt lệnh thành công', 'Thông báo'], ['Số hiệu lệnh', 'thành công']);
    await page.waitForTimeout(3000);
    await orderPage.openOrderInDayTab();
    await orderBook.cancelOrder(0);
    await orderPage.closeAllToastMessages(orderPage.toastMessage);
    await WaitUtils.waitForAllElements(orderPage.toastMessage, { state: 'hidden', timeout: 30000 });

    // // Place order buy with margin account
    await subaccPage.selectMarginSubacc();
    await orderPage.placeBuyOrder({ stockCode: 'CACB2502', quantity: 1 });
    await orderPage.verifyMessageOrder(['Đặt lệnh thành công', 'Thông báo'], ['Số hiệu lệnh', 'thành công']);
    await page.waitForTimeout(3000);
    await orderPage.openOrderInDayTab();
    await orderBook.modifyOrder(0, undefined, 2);
    await orderPage.closeAllToastMessages(orderPage.toastMessage);
    await orderBook.cancelOrder(0);
    await orderPage.closeAllToastMessages(orderPage.toastMessage);
    await WaitUtils.waitForElement(orderPage.toastMessage, { state: 'hidden', timeout: 30000 });

    // // Place order sell with margin account
    // await subaccPage.selectMarginSubacc();
    // await orderPage.placeSellOrderFromPorfolio({ quantity: 1 });
    // await orderPage.verifyMessage('Đặt lệnh thành công', 'Số hiệu lệnh');
    // await page.waitForTimeout(3000);
    // await orderBook.cancelOrder(0);




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

    fs.writeFileSync('api_calls_url.json', JSON.stringify(apiCalls, null, 2), 'utf-8');
});