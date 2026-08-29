import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { ChatPage } from './ChatPage';
import { useDraftStore } from '../store';
import { useLanguageStore } from '../i18n';

describe('ChatPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    useDraftStore.getState().resetDraft();
    useLanguageStore.setState({ language: 'en' });
  });

  it('renders initial welcoming assistant greeting and starter chips on mount', () => {
    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('chat-page')).toBeInTheDocument();
    expect(screen.getByTestId('chat-thread')).toBeInTheDocument();
    expect(
      screen.getByText(/Hello! I am Rakshak AI. Tell me what happened in one or two lines/i),
    ).toBeInTheDocument();

    // Starter suggested chips
    expect(screen.getByText(/Bank \/ UPI OTP Fraud/i)).toBeInTheDocument();
    expect(screen.getByText(/Unauthorized Credit \/ Debit Card Transaction/i)).toBeInTheDocument();
  });

  it('submits a user message and triggers deterministic classification output', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/Tell Rakshak AI what happened/i);
    await user.type(textarea, 'Someone took my OTP and debited 25000 rs via UPI');

    const sendBtn = screen.getByRole('button', { name: /Send message to Rakshak AI/i });
    await user.click(sendBtn);

    // User message is in thread
    const chatThread = screen.getByTestId('chat-thread');
    expect(
      within(chatThread).getByText('Someone took my OTP and debited 25000 rs via UPI'),
    ).toBeInTheDocument();

    // Category card appear
    const categoryCard = screen.getByTestId('category-confidence-card');
    expect(categoryCard).toBeInTheDocument();
    expect(within(categoryCard).getByText('Financial Fraud')).toBeInTheDocument();
    expect(within(categoryCard).getByText('UPI / Banking Fraud')).toBeInTheDocument();

    const emergencyCard = screen.getByTestId('emergency-action-card');
    expect(emergencyCard).toBeInTheDocument();
    expect(
      within(emergencyCard).getByRole('link', { name: /Call national cybercrime helpline 1930/i }),
    ).toHaveAttribute('href', 'tel:1930');
  });

  it('submits incident via starter chips click', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    const upiChip = screen.getByText(/Bank \/ UPI OTP Fraud/i);
    await user.click(upiChip);

    const categoryCard = screen.getByTestId('category-confidence-card');
    expect(categoryCard).toBeInTheDocument();
    expect(within(categoryCard).getByText('Financial Fraud')).toBeInTheDocument();
  });

  it('allows citizen to confirm suggested category and starts guided question sequence', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/Tell Rakshak AI what happened/i);
    await user.type(textarea, 'My Instagram was hacked and password changed');

    await user.click(screen.getByRole('button', { name: /Send message to Rakshak AI/i }));

    const categoryCard = screen.getByTestId('category-confidence-card');
    expect(categoryCard).toBeInTheDocument();
    expect(within(categoryCard).getByText('Other Cybercrime')).toBeInTheDocument();

    const looksRightBtn = screen.getByRole('button', { name: /Looks right/i });
    await user.click(looksRightBtn);

    expect(useDraftStore.getState().workflow.categoryConfirmed).toBe(true);

    // Guided question 1 appears
    expect(screen.getByText(/When did you first detect or experience this cyber incident\?/i)).toBeInTheDocument();
    expect(screen.getByTestId('guided-options-chips')).toBeInTheDocument();
  });

  it('progresses completely through Financial Fraud guided questions using chips and text', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    // 1. Initial summary
    const textarea = screen.getByPlaceholderText(/Tell Rakshak AI what happened/i);
    await user.type(textarea, 'Fake loan app debited money and recovery agents calling');
    await user.click(screen.getByRole('button', { name: /Send message to Rakshak AI/i }));

    // Confirm category
    await user.click(screen.getByRole('button', { name: /Looks right/i }));

    // Q1: Date & Time - click 'Today' chip
    expect(screen.getByText(/When did this fraudulent transaction or incident occur\?/i)).toBeInTheDocument();
    const todayChip = screen.getByRole('button', { name: /Today \(within past few hours\)/i });
    await user.click(todayChip);
    expect(useDraftStore.getState().draft.incident.date).toBeDefined();

    // Q2: Amount Lost - click ₹25k chip
    expect(screen.getByText(/What was the approximate monetary loss/i)).toBeInTheDocument();
    const amountChip = screen.getByRole('button', { name: /₹10,000 – ₹25,000/i });
    await user.click(amountChip);
    expect(useDraftStore.getState().draft.financial?.amountLost).toBe(25000);

    // Q3: Payment Method - click UPI chip
    expect(screen.getByText(/Which payment method, app, or channel was involved/i)).toBeInTheDocument();
    const upiChip = screen.getByRole('button', { name: /UPI \(GPay \/ PhonePe \/ Paytm \/ BHIM\)/i });
    await user.click(upiChip);
    expect(useDraftStore.getState().draft.financial?.paymentMethod).toContain('UPI');

    // Q4: Txn ID / UTR - type free text UTR
    expect(screen.getByText(/Do you have a Transaction ID, UPI Reference ID/i)).toBeInTheDocument();
    // Verify supportive explanation callout is displayed!
    expect(screen.getByText(/Why we ask this/i)).toBeInTheDocument();
    expect(screen.getByText(/Investigating officers and banks use the UTR/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/Tell Rakshak AI what happened/i), 'My UTR is 202688776655');
    await user.click(screen.getByRole('button', { name: /Send message to Rakshak AI/i }));
    expect(useDraftStore.getState().draft.financial?.transactionId).toBe('202688776655');

    // Q5: Bank - click SBI chip
    expect(screen.getByText(/Which bank or financial institution is your victim account held with\?/i)).toBeInTheDocument();
    const sbiChip = screen.getByRole('button', { name: /State Bank of India \(SBI\)/i });
    await user.click(sbiChip);
    expect(useDraftStore.getState().draft.financial?.bankOrWallet).toBe('State Bank of India');

    // Q6: Suspect details - type phone
    expect(screen.getByText(/Do you have any suspect details/i)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/Tell Rakshak AI what happened/i), 'Caller phone was 9876500112 and UPI scam@paytm');
    await user.click(screen.getByRole('button', { name: /Send message to Rakshak AI/i }));
    expect(useDraftStore.getState().draft.suspect?.phone).toBe('9876500112');
    expect(useDraftStore.getState().draft.suspect?.upiId).toBe('scam@paytm');

    // Q7: Location - click Same state chip
    expect(screen.getByText(/In which city or state were you located during this incident/i)).toBeInTheDocument();
    const locChip = screen.getByRole('button', { name: /Same as my registered state/i });
    await user.click(locChip);

    // Verification of completion message
    expect(
      screen.getByText(/All key incident questions for this category have been captured/i),
    ).toBeInTheDocument();
    expect(useDraftStore.getState().workflow.isQuestionsCompleted).toBe(true);

    // Verify summary panel has live data
    const summaryPanel = screen.getByTestId('complaint-summary-panel');
    expect(summaryPanel).toHaveTextContent(/₹25,000/i);
    expect(summaryPanel).toHaveTextContent(/UPI/i);
  });

  it('progresses through Women / Child Safety path and displays sensitive privacy callouts', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/Tell Rakshak AI what happened/i);
    await user.type(textarea, 'Someone is blackmailing a girl with morphed photos on Instagram');
    await user.click(screen.getByRole('button', { name: /Send message to Rakshak AI/i }));

    const categoryCard = screen.getByTestId('category-confidence-card');
    expect(categoryCard).toHaveTextContent('Women / Child Related Crime');

    await user.click(screen.getByRole('button', { name: /Looks right/i }));

    // Q1: Affected person
    expect(screen.getByText(/who is the affected person\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Reports involving women and minors receive fast-track handling/i)).toBeInTheDocument();

    const victimChip = screen.getByRole('button', { name: /Reporting for myself \(Woman\)/i });
    await user.click(victimChip);

    // Q2: Timing
    expect(screen.getByText(/When did this harassment, stalking, or incident begin/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Active & Ongoing right now/i }));

    // Q3: Platform
    expect(screen.getByText(/Which digital platform, social media app/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Instagram \/ Facebook/i }));
    expect(useDraftStore.getState().draft.incident.platform).toBe('Instagram / Facebook');
  });

  it('progresses through Other Cybercrime questions path', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/Tell Rakshak AI what happened/i);
    await user.type(textarea, 'Received a phishing link and malware infected my laptop');
    await user.click(screen.getByRole('button', { name: /Send message to Rakshak AI/i }));

    await user.click(screen.getByRole('button', { name: /Looks right/i }));

    // Q1: Date
    await user.click(screen.getByRole('button', { name: /^Today$/i }));

    // Q2: Incident type
    expect(screen.getByText(/What was the specific nature of the cyber attack or issue\?/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Phishing Link \/ Malicious APK \/ Fake Website/i }));

    // Q3: Platform / Device
    expect(screen.getByText(/Which account, service, email provider, or device was impacted\?/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Personal Computer \/ Laptop \/ Android Phone/i }));
    expect(useDraftStore.getState().draft.incident.platform).toBe('Computer / Smartphone Device');
  });

  it('allows citizen to change category without losing summary and restarts question sequence', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/Tell Rakshak AI what happened/i);
    const summaryText = 'Someone is spreading rumors and leaked my photos';
    await user.type(textarea, summaryText);

    await user.click(screen.getByRole('button', { name: /Send message to Rakshak AI/i }));

    const categoryCard = screen.getByTestId('category-confidence-card');
    expect(categoryCard).toBeInTheDocument();

    const changeCatBtn = screen.getByRole('button', { name: /Change category/i });
    await user.click(changeCatBtn);

    // Switch to Women / Child Related Crime
    const womenChildOption = screen.getByRole('button', {
      name: /Women \/ Child Related Crime/i,
    });
    await user.click(womenChildOption);

    // Draft category updated
    expect(useDraftStore.getState().draft.category).toBe('women_child_related_crime');
    // Incident summary is preserved!
    expect(useDraftStore.getState().draft.incident.summary).toBe(summaryText);
    // Question sequence started for Women/Child
    expect(screen.getByText(/who is the affected person\?/i)).toBeInTheDocument();
  });

  it('updates live complaint summary panel in real time', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    const summaryPanel = screen.getByTestId('complaint-summary-panel');
    expect(summaryPanel).toBeInTheDocument();
    expect(summaryPanel).toHaveTextContent(/Pending classification/i);

    const textarea = screen.getByPlaceholderText(/Tell Rakshak AI what happened/i);
    await user.type(textarea, 'Fake loan app recovery agents are threatening my family');

    await user.click(screen.getByRole('button', { name: /Send message to Rakshak AI/i }));

    expect(summaryPanel).toHaveTextContent(/Financial Fraud/i);
    expect(summaryPanel).toHaveTextContent(/Illegal Loan App Harassment/i);
  });

  it('gates Preview Complaint button until minimum draft is complete, then allows navigation to /preview', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/chat']}>
        <Routes>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/preview" element={<div>Target Preview Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // Initial state: preview button is disabled
    const previewBtn = screen.getByRole('button', { name: /Preview Complaint/i });
    expect(previewBtn).toBeDisabled();

    // 1. Send incident summary
    const textarea = screen.getByPlaceholderText(/Tell Rakshak AI what happened/i);
    await user.type(textarea, 'Fake caller stole 50000 rs via UPI');
    await user.click(screen.getByRole('button', { name: /Send message to Rakshak AI/i }));

    // 2. Confirm category
    await user.click(screen.getByRole('button', { name: /Looks right/i }));

    // 3. Answer date question
    await user.click(screen.getByRole('button', { name: /Today \(within past few hours\)/i }));

    // Now draft is complete and preview button is enabled!
    expect(previewBtn).not.toBeDisabled();
    await user.click(previewBtn);

    expect(screen.getByText('Target Preview Page')).toBeInTheDocument();
  });

  it('attaches evidence via sample buttons, updates live summary, and allows removing evidence', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    // Initial summary
    const textarea = screen.getByPlaceholderText(/Tell Rakshak AI what happened/i);
    await user.type(textarea, 'UPI fraud loss of money');
    await user.click(screen.getByRole('button', { name: /Send message to Rakshak AI/i }));

    // Click attachment button in composer to toggle evidence uploader
    const attachBtn = screen.getByTitle(/Attach evidence files/i);
    await user.click(attachBtn);

    expect(screen.getByTestId('chat-evidence-section')).toBeInTheDocument();

    // Add sample evidence
    const sampleChip = screen.getByRole('button', { name: /Sample UPI Debit Screenshot/i });
    await user.click(sampleChip);

    // Evidence count in summary panel updates to 1
    const summaryPanel = screen.getByTestId('complaint-summary-panel');
    expect(summaryPanel).toHaveTextContent('UPI-Payment-Debit-Receipt.png');
    expect(summaryPanel).toHaveTextContent('1');

    // Remove evidence from summary panel
    const removeBtn = within(summaryPanel).getByRole('button', {
      name: /Remove file UPI-Payment-Debit-Receipt\.png/i,
    });
    await user.click(removeBtn);

    expect(useDraftStore.getState().draft.evidence.length).toBe(0);
  });

  it('renders completely in Hindi when language is switched to hi', async () => {
    useLanguageStore.setState({ language: 'hi' });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'शिकायत सहायक' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('रक्षक एआई को बताइए क्या हुआ...')).toBeInTheDocument();
    expect(screen.getByText(/नमस्ते! मैं रक्षक एआई हूं/i)).toBeInTheDocument();
    expect(screen.getByText(/बैंक \/ यूपीआई ओटीपी फ्रॉड/i)).toBeInTheDocument();

    // Trigger Hindi guided questions
    const chip = screen.getByText(/बैंक \/ यूपीआई ओटीपी फ्रॉड/i);
    await user.click(chip);

    await user.click(screen.getByRole('button', { name: /यह सही है/i }));

    expect(screen.getByText(/यह अनधिकृत लेन-देन या धोखाधड़ी की घटना कब हुई\?/i)).toBeInTheDocument();
    expect(screen.getByText(/आज \(पिछले कुछ घंटों में\)/i)).toBeInTheDocument();
  });

  it('handles Enter key submission and prevents submission when empty or disabled', async () => {
    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/Tell Rakshak AI what happened/i);

    // Pressing Enter when empty does nothing
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(useDraftStore.getState().chatMessages.length).toBe(1); // Only initial greeting

    // Type and press Enter
    fireEvent.change(textarea, { target: { value: 'My bank account was hacked' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    const chatThread = screen.getByTestId('chat-thread');
    expect(
      within(chatThread).getByText('My bank account was hacked'),
    ).toBeInTheDocument();
  });
});
