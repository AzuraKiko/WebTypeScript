// web/helpers/assertions.ts
// chức năng expectTitleContains, expectUrlMatches

import { Page, expect } from '@playwright/test';

export async function expectTitleContains(page: Page, titlePart: string) {
  const title = await page.title();
  expect(title).toContain(titlePart);
}

export async function expectUrlMatches(page: Page, regex: RegExp) {
  const url = page.url();
  expect(url).toMatch(regex);
}
