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