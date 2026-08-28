import { expect, test } from '@playwright/test';

const routes = [
  ['/', 'A safer way to report cybercrime'],
  ['/login', 'Demo login'],
  ['/chat', 'Complaint assistant'],
  ['/preview', 'Preview complaint'],
  ['/success', 'Demo acknowledgement'],
  ['/track', 'Track a complaint'],
] as const;

test('all foundation routes are available', async ({ page }) => {
  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});
