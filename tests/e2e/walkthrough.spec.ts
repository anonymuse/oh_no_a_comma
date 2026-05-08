import { expect, test } from '@playwright/test';

async function goToScene(page: import('@playwright/test').Page, sceneNumber: number) {
  await page.goto('/');
  await page.getByTestId(`scene-tab-${sceneNumber}`).click();
}

test('before scene shows duplicate and inconsistent raw labels', async ({ page }) => {
  await goToScene(page, 3);

  const before = page.getByTestId('public-ui-before');
  await expect(before.getByText('New York , NY')).toBeVisible();
  await expect(before.getByText('New York, NY', { exact: true })).toBeVisible();
  await expect(before.getByText('Hybrid (New York, New York, US)')).toBeVisible();
  await expect(before.getByText('Hybrid (New York, NY, US)')).toBeVisible();
});

test('after scene contains no duplicate visible location labels', async ({ page }) => {
  await goToScene(page, 5);

  const labels = await page
    .getByTestId('public-ui-after')
    .locator('[data-location-label]')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim()).filter(Boolean));

  expect(labels).toHaveLength(new Set(labels).size);
});

test('after scene shows expected canonical values', async ({ page }) => {
  await goToScene(page, 5);

  const after = page.getByTestId('public-ui-after');
  await expect(after.getByText('New York, NY', { exact: true })).toBeVisible();
  await expect(after.getByText('San Francisco, CA', { exact: true })).toBeVisible();
  await expect(after.getByText('Seattle, WA', { exact: true })).toBeVisible();
  await expect(after.getByText('Hybrid (New York, NY, US)', { exact: true })).toBeVisible();
});
