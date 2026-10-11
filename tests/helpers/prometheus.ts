// Prometheus targets-page helper shared by the alloy and monitoring specs
// (port of the cypress validatePromTargetNew / validatePromTargetBody helpers).

import { expect, type Page } from '@playwright/test';

export const variableUpMatch = /\d+\s\/\s\d+\sup/;

export async function validatePromTarget(
  page: Page,
  monitorText: string,
  match: string | RegExp = variableUpMatch
): Promise<void> {
  await page.locator('input[placeholder*="Select scrape pool"]').click({ force: true });
  await page.locator(`div[value="${monitorText}"]`).click({ force: true });
  await expect(page.getByText(monitorText).first()).toBeVisible();
  await expect(page.getByText(match).first()).toBeVisible();
}
