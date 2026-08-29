import { expect, test } from '@playwright/test';

test.describe('Homepage Transformation Hero & Experience', () => {
  test('renders legacy portal hero and scrolls to reveal Cyber Rakshak', async ({ page }) => {
    await page.goto('/');

    // Verify browser viewport frame and hero
    const viewportFrame = page.getByTestId('browser-viewport-frame');
    await expect(viewportFrame).toBeVisible();

    // Verify legacy portal image exists
    const legacyImg = page.getByAltText('National Cyber Crime Reporting Portal');
    await expect(legacyImg).toBeVisible();

    // Scroll down to resolve the hero transformation
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
    await page.waitForTimeout(500);

    // Verify resolved Cyber Rakshak view is visible
    const resolvedView = page.getByTestId('cyber-rakshak-resolved-view');
    await expect(resolvedView).toBeVisible();

    // Verify Start a Report CTA inside resolved view
    const startReportBtn = resolvedView.getByRole('button', { name: /Start a Report/i });
    await expect(startReportBtn).toBeVisible();

    // Click Start a Report and verify navigation to /login
    await startReportBtn.click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /Sign in to continue/i })).toBeVisible();
  });

  test('supports bilingual Hindi switching across the hero and page', async ({ page }) => {
    await page.goto('/login');

    // Switch to Hindi via language selector in header
    const langSelector = page.locator('#language-selector-button');
    await expect(langSelector).toBeVisible();
    await langSelector.click();
    await page.getByRole('option', { name: /हिन्दी/i }).click();

    // Verify Hindi page heading on login
    await expect(page.getByRole('heading', { name: 'जारी रखने के लिए साइन इन करें' })).toBeVisible();

    // Navigate to Home in Hindi
    await page.goto('/');
    await expect(page.getByText('साइबर रक्षक', { exact: true }).first()).toBeVisible();
  });

  test('renders without horizontal layout overflow on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const hero = page.getByTestId('portal-transform-hero');
    await expect(hero).toBeVisible();

    // Verify no horizontal document overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
