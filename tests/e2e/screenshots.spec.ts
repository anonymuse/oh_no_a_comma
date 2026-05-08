import { test } from '@playwright/test';

const sceneScreenshots = [
  ['scene-tab-1', '01-source-data.png'],
  ['scene-tab-2', '02-api-payload-before.png'],
  ['scene-tab-3', '03-public-ui-before.png'],
  ['scene-tab-4', '04-code-change.png'],
  ['scene-tab-5', '05-public-ui-after.png'],
  ['scene-tab-6', '06-regression-tests.png'],
] as const;

test('captures one screenshot per walkthrough scene', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const [tabTestId, fileName] of sceneScreenshots) {
    await page.getByTestId(tabTestId).click();
    await page.screenshot({ path: `demo-artifacts/${fileName}`, fullPage: true });
  }
});
