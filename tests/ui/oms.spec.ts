import { test, expect } from '@playwright/test';
import fs from 'fs';
import { ENV, TEST_CONFIG, getRandomStockCode } from '../utils/testConfig';
import MatrixPage from "../../page/ui/MatrixPage";
import LoginPage from '../../page/ui/LoginPage';
import OrderPage from '../../page/ui/OrderPage';


type CapturedCall = {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string | null;
    timestamp: string;
};
const OUTPUT_FILE = `oms_postman_collection_${ENV}.json`;
const DEV_API_CORE = ['http://10.8.80.104:8888/', 'http://10.8.80.164:8888/']
const UAT_API_CORE = ['http://10.8.90.16:8888/', 'http://10.8.90.164:8888/']

// const PROD_API_CORE = ['http://10.8.90.16:8888/', 'http://10.8.90.164:8888/']

const API_DOMAINS = ENV === 'DEV' ? DEV_API_CORE : UAT_API_CORE;

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
    let matrixPage: MatrixPage;
    let orderPage: OrderPage;

    loginPage = new LoginPage(page);
    matrixPage = new MatrixPage(page);
    orderPage = new OrderPage(page);

    await loginPage.loginSuccess();

    await orderPage.navigateToOrder();

    // const stockCode = getRandomStockCode();
    // await orderPage.placeBuyOrder(stockCode, '1');


    // const target = page.locator('span.cursor-pointer.f');
    // await expect(target).toHaveCount(1);
    // await target.scrollIntoViewIfNeeded();
    // await expect(target).toBeVisible();
    // await target.dblclick();

    // await page.getByPlaceholder('KL x1').fill('1');
    // await page.getByRole('button', { name: 'Đặt lệnh' }).click();
    // await page.getByRole('button', { name: 'Xác nhận' }).click();



    await page.waitForTimeout(3000);

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

    fs.writeFileSync('api_calls.json', JSON.stringify(apiCalls, null, 2), 'utf-8');
});