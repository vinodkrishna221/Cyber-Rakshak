import { test } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Vinod krishna/.gemini/antigravity/brain/99694244-248c-4955-8feb-da72f7d6dab1';

test.describe('Automated Visual Screenshot Artifacts Generation', () => {
  test('captures full suite of desktop (1280x800) and mobile (375x812) screenshots for all routes', async ({
    page,
  }) => {
    // Helper to capture both desktop and mobile views
    async function captureScreen(name: string, route: string, prepareFn?: () => Promise<void>) {
      // 1. Desktop Viewport
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(route);
      if (prepareFn) await prepareFn();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `${name}-desktop.png`),
        fullPage: false,
      });

      // 2. Mobile Viewport
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(route);
      if (prepareFn) await prepareFn();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `${name}-mobile.png`),
        fullPage: false,
      });
    }

    // 1. Home Page (Resolved view)
    await captureScreen('home', '/', async () => {
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
    });

    // 2. Login Page
    await captureScreen('login', '/login');

    // 3. Chat Assistant Page (with sample conversation and classification)
    await captureScreen('chat', '/chat', async () => {
      const composer = page.getByPlaceholder(/Tell Rakshak AI what happened/i);
      if (await composer.isVisible()) {
        await composer.fill('Someone called pretending to be bank support, asked for OTP, and ₹25,000 was debited via UPI.');
        await page.getByRole('button', { name: /Send message to Rakshak AI/i }).click();
        await page.waitForTimeout(400);
      }
    });

    // 4. Preview Page (with prefilled sample draft)
    await captureScreen('preview', '/preview', async () => {
      const loadSampleBtn = page.getByRole('button', { name: /Load Sample Demo Draft/i });
      if (await loadSampleBtn.isVisible()) {
        await loadSampleBtn.click();
        await page.waitForTimeout(300);
      }
    });

    // 5. Success Acknowledgement Page
    await captureScreen('success', '/success');

    // 6. Track Complaint Page
    await captureScreen('track', '/track');
  });
});
