import { expect, test } from '@playwright/test';

const routes = [
  ['/', 'A safer way to report cybercrime'],
  ['/login', 'Sign in to continue'],
  ['/chat', 'Complaint assistant'],
  ['/preview', 'Complaint Preview'],
  ['/success', 'Demo acknowledgement'],
  ['/track', 'Track Complaint'],
] as const;

test('all foundation routes are available', async ({ page }) => {
  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
});
