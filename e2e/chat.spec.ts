import { expect, test } from '@playwright/test';

test.describe('Chat Guided Intake & Classification Flow', () => {
  test('guides citizen through incident intake, category suggestion, emergency advice, and summary', async ({
    page,
  }) => {
    // Start by logging in as guest
    await page.goto('/login');
    const guestBtn = page.getByRole('button', { name: /Continue as Guest/i });
    await expect(guestBtn).toBeVisible();
    await guestBtn.click();

    // Verify redirected to /chat
    await expect(page).toHaveURL(/.*chat/);

    // Verify Rakshak AI initial greeting
    const chatThread = page.getByTestId('chat-thread');
    await expect(chatThread).toBeVisible();
    await expect(
      chatThread.getByText(/Hello! I am Rakshak AI. Tell me what happened/i),
    ).toBeVisible();

    // Type financial fraud incident into composer
    const composer = page.getByPlaceholder(/Tell Rakshak AI what happened/i);
    await expect(composer).toBeVisible();
    await composer.fill('I received a fake SMS and 35000 rs was debited via UPI without my permission');
    await page.getByRole('button', { name: /Send message to Rakshak AI/i }).click();

    // Verify Category Card appeared with Financial Fraud
    const categoryCard = page.getByTestId('category-confidence-card');
    await expect(categoryCard).toBeVisible();
    await expect(categoryCard.getByText('Financial Fraud')).toBeVisible();

    // Verify Emergency Action Card with 1930 Helpline
    const emergencyCard = page.getByTestId('emergency-action-card');
    await expect(emergencyCard).toBeVisible();
    await expect(
      emergencyCard.getByRole('link', { name: /Call national cybercrime helpline 1930/i }),
    ).toHaveAttribute('href', 'tel:1930');

    // Confirm Category via "Looks right"
    const looksRightBtn = categoryCard.getByRole('button', { name: /Looks right/i });
    await looksRightBtn.click();
    await expect(
      categoryCard.getByText(/Category confirmed: Financial Fraud/i),
    ).toBeVisible();

    // Verify Live Complaint Summary Panel on desktop
    const summaryPanel = page.getByTestId('complaint-summary-panel');
    await expect(summaryPanel).toBeVisible();
    await expect(summaryPanel.getByText('Financial Fraud')).toBeVisible();
    await expect(
      summaryPanel.getByText(/35000 rs was debited via UPI/i),
    ).toBeVisible();
  });
});
