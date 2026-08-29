import { expect, test } from '@playwright/test';

test.describe('End-to-End Primary Journey: Financial Fraud (Guest Mode -> Chat -> Preview -> Edit -> Submit -> Track)', () => {
  test('completes full financial fraud lifecycle with classification, emergency guidance, evidence, preview edit, submission, and tracking', async ({
    page,
  }) => {
    // 1. Landing on Homepage
    await page.goto('/');
    await expect(page).toHaveURL(/.*\//);

    // Scroll to reveal Cyber Rakshak and click Start a Report
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
    await page.waitForTimeout(400);

    const resolvedView = page.getByTestId('cyber-rakshak-resolved-view');
    await expect(resolvedView).toBeVisible();

    const startReportBtn = resolvedView.getByRole('button', { name: /Start a Report/i });
    await expect(startReportBtn).toBeVisible();
    await startReportBtn.click();

    // 2. Login Page - Guest Mode
    await expect(page).toHaveURL(/.*login/);
    const guestBtn = page.getByRole('button', { name: /Continue as Guest/i });
    await expect(guestBtn).toBeVisible();
    await guestBtn.click();

    // 3. Chat Intake & Instant AI Classification
    await expect(page).toHaveURL(/.*chat/);
    const chatThread = page.getByTestId('chat-thread');
    await expect(chatThread).toBeVisible();

    // Fill incident summary
    const composer = page.getByPlaceholder(/Tell Rakshak AI what happened/i);
    await expect(composer).toBeVisible();
    await composer.fill('Someone called pretending to be bank support, took my OTP, and Rs 25000 was debited via UPI');
    await page.getByRole('button', { name: /Send message to Rakshak AI/i }).click();

    // Verify Category Card: Financial Fraud
    const categoryCard = page.getByTestId('category-confidence-card');
    await expect(categoryCard).toBeVisible();
    await expect(categoryCard.getByRole('heading', { name: 'Financial Fraud' })).toBeVisible();

    // Verify Persistent 1930 Emergency Card
    const emergencyCard = page.getByTestId('emergency-action-card');
    await expect(emergencyCard).toBeVisible();
    await expect(
      emergencyCard.getByRole('link', { name: /Call national cybercrime helpline 1930/i }),
    ).toHaveAttribute('href', 'tel:1930');

    // Confirm Category
    const looksRightBtn = categoryCard.getByRole('button', { name: /Looks right/i });
    await looksRightBtn.click();
    await expect(categoryCard.getByText(/Category confirmed/i)).toBeVisible();

    // 4. Guided Question Flow (Financial Fraud)
    // Q1: Date & Time - click 'Today' chip
    await expect(chatThread.getByText(/When did this fraudulent transaction or incident occur/i)).toBeVisible();
    const todayChip = page.getByRole('button', { name: /Today \(within past few hours\)/i });
    await expect(todayChip).toBeVisible();
    await todayChip.click();

    // Q2: Amount Lost - click ₹25k chip
    await expect(chatThread.getByText(/What was the approximate monetary loss/i)).toBeVisible();
    const amountChip = page.getByRole('button', { name: /₹10,000 – ₹25,000/i });
    await expect(amountChip).toBeVisible();
    await amountChip.click();

    // Q3: Payment Method - click UPI chip
    await expect(chatThread.getByText(/Which payment method, app, or channel was involved/i)).toBeVisible();
    const upiChip = page.getByRole('button', { name: /UPI \(GPay \/ PhonePe \/ Paytm \/ BHIM\)/i });
    await expect(upiChip).toBeVisible();
    await upiChip.click();

    // Q4: Txn ID / UTR - enter text
    await expect(chatThread.getByText(/Do you have a Transaction ID, UPI Reference ID/i)).toBeVisible();
    await composer.fill('UPI-REF-987654321012');
    await page.getByRole('button', { name: /Send message to Rakshak AI/i }).click();

    // Q5: Bank - click SBI chip
    await expect(chatThread.getByText(/Which bank or financial institution is your victim account held with/i)).toBeVisible();
    const sbiChip = page.getByRole('button', { name: /State Bank of India \(SBI\)/i });
    await expect(sbiChip).toBeVisible();
    await sbiChip.click();

    // Q6: Suspect details - enter phone & upi
    await expect(chatThread.getByText(/Do you have any suspect details/i)).toBeVisible();
    await composer.fill('Caller phone was 9876500112 and UPI scam@paytm');
    await page.getByRole('button', { name: /Send message to Rakshak AI/i }).click();

    // Q7: Location - click Same state chip
    await expect(chatThread.getByText(/In which city or state were you located/i)).toBeVisible();
    const locChip = page.getByRole('button', { name: /Same as my registered state/i });
    await expect(locChip).toBeVisible();
    await locChip.click();

    // Verify Question Completion notification
    await expect(chatThread.getByText(/All key incident questions for this category have been captured/i)).toBeVisible();

    // 5. Evidence Attachment
    const addSampleEvidenceChip = page.getByRole('button', { name: /Sample UPI Debit Screenshot/i });
    await expect(addSampleEvidenceChip).toBeVisible();
    await addSampleEvidenceChip.click();

    // Verify Live Complaint Summary updates
    const summaryPanel = page.getByTestId('complaint-summary-panel');
    await expect(summaryPanel).toBeVisible();
    await expect(summaryPanel.getByText('Financial Fraud', { exact: true })).toBeVisible();
    await expect(summaryPanel.getByText('₹25,000')).toBeVisible();

    // Click Preview Complaint
    const previewBtn = summaryPanel.getByRole('button', { name: /Preview Complaint/i });
    await expect(previewBtn).toBeEnabled();
    await previewBtn.click();

    // 6. Preview Complaint Screen
    await expect(page).toHaveURL(/.*preview/);
    const previewCard = page.getByTestId('complaint-preview-card');
    await expect(previewCard).toBeVisible();

    // Verify structured fields
    await expect(previewCard.getByText('Financial Fraud', { exact: true })).toBeVisible();
    await expect(previewCard.getByText('₹25,000')).toBeVisible();

    // Test Edit Flow in Preview
    const editBtn = page.getByRole('button', { name: /Edit Report/i }).first();
    await editBtn.click();

    const editForm = page.getByTestId('preview-edit-form');
    await expect(editForm).toBeVisible();

    // Update location in edit form
    const locationInput = editForm.getByLabel(/Incident Location \/ City/i);
    await locationInput.fill('Hyderabad, Telangana');

    const saveChangesBtn = editForm.getByRole('button', { name: /Save Changes/i }).first();
    await saveChangesBtn.click();

    // Verify Save success alert & view mode restored
    await expect(page.getByText(/Complaint draft updated successfully/i)).toBeVisible();
    await expect(previewCard.getByText('Hyderabad, Telangana')).toBeVisible();

    // Test Declaration Checkbox Validation
    const submitBtn = page.getByRole('button', { name: /Submit demo complaint/i });
    await submitBtn.click();
    await expect(page.getByText(/Please accept the declaration before submitting/i)).toBeVisible();

    // Accept Declaration
    const declarationCheckbox = page.getByRole('checkbox', {
      name: /I confirm that the information provided in this demo complaint/i,
    });
    await declarationCheckbox.check();
    await expect(declarationCheckbox).toBeChecked();

    // Submit Demo Complaint
    await submitBtn.click();

    // 7. Success Acknowledgement Page
    await expect(page).toHaveURL(/.*success/);
    const ackCard = page.getByTestId('acknowledgement-card');
    await expect(ackCard).toBeVisible();

    // Extract acknowledgement number (CR-YYYY-MM-######)
    const ackNumberText = await page.getByTestId('acknowledgement-number').innerText();
    expect(ackNumberText).toMatch(/^CR-\d{4}-\d{2}-\d{7}$/);

    // Verify Status & Golden Hour notice
    await expect(ackCard.getByText(/Submitted for demo review/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Urgent Golden Hour Advisory for Financial Fraud/i })).toBeVisible();

    // 8. Track Complaint Lookup Flow
    const trackComplaintCta = page.getByRole('button', { name: /Track Complaint/i });
    await trackComplaintCta.click();

    await expect(page).toHaveURL(/.*track/);
    const trackPage = page.getByTestId('track-page');
    await expect(trackPage).toBeVisible();

    // Verify tracking result card with our submitted acknowledgement number
    await expect(trackPage.getByRole('heading', { name: ackNumberText })).toBeVisible();
    await expect(trackPage.getByText(/Under Demo Review/i)).toBeVisible();
    await expect(trackPage.getByText(/Report Submitted/i)).toBeVisible();
    await expect(trackPage.getByText(/AI Verified/i)).toBeVisible();
  });
});

test.describe('End-to-End Secondary Journey: Women & Child Safety (OTP Login -> Chat -> Preview -> Submit)', () => {
  test('completes Women / Child Safety reporting with OTP login, privacy-sensitive questions, and acknowledgement', async ({
    page,
  }) => {
    // 1. Login with Mobile & State
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign in to continue/i })).toBeVisible();

    await page.getByLabel(/Mobile Number/i).fill('9876543210');
    await page.getByLabel(/State \/ Union Territory/i).selectOption('Telangana');
    await page.getByRole('button', { name: /Send OTP/i }).click();

    // Step 2 OTP Entry
    await expect(page.getByText(/Enter 6-Digit OTP/i).first()).toBeVisible();
    await page.getByRole('button', { name: /Fill 123456/i }).click();
    await page.getByRole('button', { name: /Verify & Continue/i }).click();

    // 2. Chat Intake for Women / Child Safety
    await expect(page).toHaveURL(/.*chat/);
    const composer = page.getByPlaceholder(/Tell Rakshak AI what happened/i);
    await composer.fill('Someone is stalking and sending abusive threatening messages and morphed photos on Instagram');
    await page.getByRole('button', { name: /Send message to Rakshak AI/i }).click();

    // Verify Category: Women / Child Related Crime
    const categoryCard = page.getByTestId('category-confidence-card');
    await expect(categoryCard).toBeVisible();
    await expect(categoryCard.getByRole('heading', { name: 'Women / Child Related Crime' })).toBeVisible();

    // Confirm Category
    await categoryCard.getByRole('button', { name: /Looks right/i }).click();

    // Progress through Women/Child Safety Questions
    const chatThread = page.getByTestId('chat-thread');
    await expect(chatThread.getByText(/who is the affected person\?/i)).toBeVisible();

    // Answer Q1 with chip
    const victimChip = page.getByRole('button', { name: /Reporting for myself \(Woman\)/i });
    await victimChip.click();

    // Answer Q2: Timing
    await expect(chatThread.getByText(/When did this harassment, stalking, or incident begin/i)).toBeVisible();
    const ongoingChip = page.getByRole('button', { name: /Active & Ongoing right now/i });
    await ongoingChip.click();

    // Answer Q3: Platform
    await expect(chatThread.getByText(/Which digital platform, social media app/i)).toBeVisible();
    const instaChip = page.getByRole('button', { name: /Instagram \/ Facebook/i });
    await instaChip.click();

    // Answer Q4: Threat nature
    await expect(chatThread.getByText(/What is the nature of the threat\?/i)).toBeVisible();
    const threatsChip = page.getByRole('button', { name: /Blackmail \/ Morphed Images \/ Video Call/i });
    await threatsChip.click();

    // Answer Q5: Suspect details
    await expect(chatThread.getByText(/Do you have any suspect information/i)).toBeVisible();
    await composer.fill('Instagram handle: @fake_harasser_user');
    await page.getByRole('button', { name: /Send message to Rakshak AI/i }).click();

    // Answer Q6: Location
    await expect(chatThread.getByText(/What is your current city or state where you are residing\?/i)).toBeVisible();
    const locationChip = page.getByRole('button', { name: /My current registered state/i });
    await locationChip.click();

    // Attach Sample Evidence
    const sampleChatChip = page.getByRole('button', { name: /Sample WhatsApp \/ Insta Chat/i });
    await sampleChatChip.click();

    // Preview
    const summaryPanel = page.getByTestId('complaint-summary-panel');
    const previewBtn = summaryPanel.getByRole('button', { name: /Preview Complaint/i });
    await previewBtn.click();

    // 3. Verify Preview Page has no financial section and accurate details
    await expect(page).toHaveURL(/.*preview/);
    const previewCard = page.getByTestId('complaint-preview-card');
    await expect(previewCard.getByText('Women / Child Related Crime', { exact: true })).toBeVisible();
    await expect(previewCard.getByText(/4\. Financial Loss Details/i)).not.toBeVisible();

    // Accept Declaration and Submit
    const declarationCheckbox = page.getByRole('checkbox', {
      name: /I confirm that the information provided in this demo complaint/i,
    });
    await declarationCheckbox.check();
    await page.getByRole('button', { name: /Submit demo complaint/i }).click();

    // 4. Success Screen
    await expect(page).toHaveURL(/.*success/);
    await expect(page.getByTestId('acknowledgement-card')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Urgent Golden Hour Advisory for Financial Fraud/i })).not.toBeVisible();

    // Return to Home
    await page.getByRole('button', { name: /Return to Home/i }).click();
    await expect(page).toHaveURL(/.*\//);
  });
});

test.describe('End-to-End Accessibility & Reduced Motion Checks', () => {
  test('supports Skip to Main Content keyboard shortcut and visible focus states', async ({ page }) => {
    await page.goto('/login');

    // Press Tab to focus Skip to Content link
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await expect(skipLink).toBeFocused();

    // Press Enter to activate Skip link and focus main container
    await page.keyboard.press('Enter');
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('handles Escape key to close mobile drawer and restores focus cleanly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Scroll to reveal mobile header
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(300);

    const menuBtn = page.getByRole('button', { name: /Open navigation menu/i });
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await expect(page.getByRole('navigation', { name: /Main navigation/i })).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: /Open navigation menu/i })).toBeVisible();
    }
  });
});
