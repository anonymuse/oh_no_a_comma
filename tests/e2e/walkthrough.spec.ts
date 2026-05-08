import { expect, test } from '@playwright/test';

async function goToScene(page: import('@playwright/test').Page, sceneNumber: number) {
  await page.goto('/');
  await page.getByTestId(`scene-tab-${sceneNumber}`).click();
}

test('before scene shows duplicate and inconsistent raw labels', async ({ page }) => {
  await goToScene(page, 4);

  const before = page.getByTestId('public-ui-before');
  await expect(before.getByText('New York , NY')).toBeVisible();
  await expect(before.getByText('New York, NY', { exact: true })).toBeVisible();
  await expect(before.getByText('Hybrid (New York, New York, US)')).toBeVisible();
  await expect(before.getByText('Hybrid (New York, NY, US)')).toBeVisible();
  await expect(page.getByTestId('before-match-proof')).toContainText('leaves 1 stranded option');
});

test('after scene contains canonical deduplicated labels', async ({ page }) => {
  await goToScene(page, 6);

  const labels = await page
    .getByTestId('public-ui-after')
    .locator('[data-location-label]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-location-label')).filter(Boolean));

  expect(labels).toEqual([
    'New York, NY',
    'Hybrid (New York, NY, US)',
    'San Francisco, CA',
    'Seattle, WA',
  ]);
  await expect(page.getByTestId('after-match-proof')).toContainText('Canonical match returns 4 New York jobs');
});

test('graph scene shows aberrant raw label and canonical convergence', async ({ page }) => {
  await goToScene(page, 7);

  const graph = page.getByTestId('graph-panel');
  await expect(graph.getByText('New York , NY')).toBeVisible();
  await expect(page.getByTestId('aberrant-raw-node')).toContainText('raw node: 1 job(s)');
  await expect(page.getByTestId('canonical-new-york-node')).toContainText('canonical node: 4 job(s)');
});
