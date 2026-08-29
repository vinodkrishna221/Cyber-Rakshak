import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PreviewPage } from './PreviewPage';
import { useDraftStore } from '../store';
import { useLanguageStore } from '../i18n';
import { ComplaintDraft } from '../types';

const sampleFinancialDraft: ComplaintDraft = {
  language: 'en',
  category: 'financial_fraud',
  subCategory: 'UPI / Banking Fraud',
  subCategoryKey: 'upi_banking_fraud',
  confidence: 0.94,
  isEmergency: true,
  status: 'preview_ready',
  complainant: {
    name: 'Vikram Singh',
    mobile: '9876543210',
    state: 'Telangana',
    isGuest: false,
  },
  incident: {
    summary: 'Caller pretended to be SBI customer care, took OTP, and debited ₹25,000 via UPI.',
    date: '28 Aug 2026',
    time: '04:30 PM',
    platform: 'Phone call + Google Pay',
    location: 'Hyderabad, Telangana',
    description: 'Received a call claiming KYC expiry. Within minutes of sharing OTP, money was deducted.',
  },
  financial: {
    amountLost: 25000,
    paymentMethod: 'UPI',
    transactionId: 'UTR987654321012',
    bankOrWallet: 'State Bank of India',
  },
  suspect: {
    phone: '+91 98765 00000',
    upiId: 'fraudster@okhdfcbank',
    socialHandle: '@fake_sbi_support',
    url: 'https://fake-sbi-portal.in',
    email: 'support@fake-sbi-help.com',
  },
  evidence: [
    {
      id: 'ev-1',
      name: 'Bank_Debit_SMS.png',
      type: 'image/png',
      mockSize: '120 KB',
      uploadedAt: '2026-08-28T16:35:00Z',
    },
    {
      id: 'ev-2',
      name: 'Payment_Receipt.pdf',
      type: 'application/pdf',
      mockSize: '340 KB',
      uploadedAt: '2026-08-28T16:36:00Z',
    },
  ],
};

const sampleWomenChildDraft: ComplaintDraft = {
  language: 'en',
  category: 'women_child_related_crime',
  subCategory: 'Blackmail / Morphed Images / Sextortion',
  subCategoryKey: 'blackmail_morphing',
  confidence: 0.91,
  isEmergency: false,
  status: 'preview_ready',
  complainant: {
    name: 'Ananya Sharma',
    mobile: '9876512345',
    state: 'Maharashtra',
    isGuest: false,
  },
  incident: {
    summary: 'Unknown person morphed social media photos and is demanding money on WhatsApp.',
    date: 'Yesterday',
    time: 'Evening',
    platform: 'Instagram + WhatsApp',
    location: 'Mumbai, Maharashtra',
    description: 'Blackmailer created a fake account and sent threatening messages to contacts.',
  },
  suspect: {
    phone: '+91 91234 56789',
    socialHandle: '@blackmailer_handle',
  },
  evidence: [
    {
      id: 'ev-wc-1',
      name: 'Threat_Chat_Screenshot.png',
      type: 'image/png',
      mockSize: '210 KB',
      uploadedAt: '2026-08-28T18:00:00Z',
    },
  ],
};

const sampleOtherCyberDraft: ComplaintDraft = {
  language: 'en',
  category: 'other_cybercrime',
  subCategory: 'Account Hacking / Identity Theft',
  subCategoryKey: 'account_hacking_takeover',
  confidence: 0.89,
  isEmergency: false,
  status: 'preview_ready',
  complainant: {
    name: 'Guest Citizen',
    mobile: '9800000000',
    state: 'Delhi',
    isGuest: true,
  },
  incident: {
    summary: 'Instagram account hacked and password changed without authorization.',
    date: '25 Aug 2026',
    time: '11:00 AM',
    platform: 'Instagram',
    location: 'New Delhi',
    description: 'Received a phishing link disguised as a copyright warning.',
  },
  suspect: {
    url: 'https://insta-copyright-appeal.com',
  },
  evidence: [],
};

const renderPreviewWithRoutes = (initialRoute = '/preview') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/chat" element={<div data-testid="chat-page-stub">Chat Assistant Page</div>} />
        <Route path="/success" element={<div data-testid="success-page-stub">Success Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('PreviewPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
    useDraftStore.getState().resetDraft();
  });

  it('renders structured preview report for Financial Fraud with currency, suspect, and evidence', () => {
    useDraftStore.setState({ draft: sampleFinancialDraft });
    renderPreviewWithRoutes();

    // Headings and Badges
    expect(screen.getByRole('heading', { name: 'Complaint Preview' })).toBeInTheDocument();
    expect(screen.getByText('Auto-Drafted by Rakshak AI')).toBeInTheDocument();
    expect(screen.getByText('94% AI Match')).toBeInTheDocument();

    // Section 1: Classification
    expect(screen.getByText('1. Incident Classification')).toBeInTheDocument();
    expect(screen.getByText('Financial Fraud')).toBeInTheDocument();
    expect(screen.getByText('UPI / Banking Fraud')).toBeInTheDocument();

    // Section 2: Complainant
    expect(screen.getByText('2. Citizen / Complainant Details')).toBeInTheDocument();
    expect(screen.getByText('Vikram Singh')).toBeInTheDocument();
    expect(screen.getByText('+91 9876543210')).toBeInTheDocument();
    expect(screen.getByText('Telangana')).toBeInTheDocument();

    // Section 3: Incident Details
    expect(screen.getByText('3. Incident Information')).toBeInTheDocument();
    expect(screen.getByText(sampleFinancialDraft.incident.summary!)).toBeInTheDocument();
    expect(screen.getByText('28 Aug 2026')).toBeInTheDocument();
    expect(screen.getByText('Phone call + Google Pay')).toBeInTheDocument();

    // Section 4: Financial Loss Details
    expect(screen.getByText('4. Financial Loss Details')).toBeInTheDocument();
    expect(screen.getByText('₹25,000')).toBeInTheDocument();
    expect(screen.getByText('UTR987654321012')).toBeInTheDocument();
    expect(screen.getByText('State Bank of India')).toBeInTheDocument();

    // Section 5: Suspect Identifiers
    expect(screen.getByText('5. Suspect Identifiers')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 00000')).toBeInTheDocument();
    expect(screen.getByText('fraudster@okhdfcbank')).toBeInTheDocument();

    // Section 6: Attached Evidence
    expect(screen.getByText('6. Supporting Evidence Files')).toBeInTheDocument();
    expect(screen.getByText('Bank_Debit_SMS.png')).toBeInTheDocument();
    expect(screen.getByText('Payment_Receipt.pdf')).toBeInTheDocument();

    // Section 7: Declaration Checkbox & Actions
    expect(screen.getByText('Citizen Declaration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit demo complaint' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Return to Chat' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit Report' }).length).toBeGreaterThan(0);
  });

  it('renders preview report for Women / Child Related Crime without financial section', () => {
    useDraftStore.setState({ draft: sampleWomenChildDraft });
    renderPreviewWithRoutes();

    expect(screen.getByText('Women / Child Related Crime')).toBeInTheDocument();
    expect(screen.getByText('Blackmail / Morphed Images / Sextortion')).toBeInTheDocument();
    expect(screen.getByText('Ananya Sharma')).toBeInTheDocument();
    expect(screen.getByText(sampleWomenChildDraft.incident.summary!)).toBeInTheDocument();
    expect(screen.queryByText('4. Financial Loss Details')).not.toBeInTheDocument();
    expect(screen.getByText('Threat_Chat_Screenshot.png')).toBeInTheDocument();
  });

  it('renders preview report for Other Cybercrime with empty suspect state', () => {
    useDraftStore.setState({ draft: sampleOtherCyberDraft });
    renderPreviewWithRoutes();

    expect(screen.getByText('Other Cybercrime')).toBeInTheDocument();
    expect(screen.getByText('Account Hacking / Identity Theft')).toBeInTheDocument();
    expect(screen.getByText('Guest Citizen (Demo)')).toBeInTheDocument();
    expect(screen.getByText(sampleOtherCyberDraft.incident.summary!)).toBeInTheDocument();
    expect(screen.getByText('https://insta-copyright-appeal.com')).toBeInTheDocument();
  });

  it('renders official demo warning banner and AI suggestion notice', () => {
    useDraftStore.setState({ draft: sampleFinancialDraft });
    renderPreviewWithRoutes();

    expect(screen.getByText('Demo Prototype Only')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This is an educational prototype. No complaint will be transmitted to government portals or police departments.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The crime category and extracted parameters are automated assistant suggestions/i,
      ),
    ).toBeInTheDocument();
  });

  it('switches to Edit mode on clicking Edit Report, edits fields, and saves back to store', async () => {
    const user = userEvent.setup();
    useDraftStore.setState({ draft: sampleFinancialDraft });
    renderPreviewWithRoutes();

    const editButton = screen.getAllByRole('button', { name: 'Edit Report' })[0];
    await user.click(editButton);

    // Should be in edit mode
    expect(screen.getByTestId('preview-edit-form')).toBeInTheDocument();
    expect(screen.getByLabelText(/Incident Summary/i)).toBeInTheDocument();

    // Modify summary and amount
    const summaryInput = screen.getByLabelText(/Incident Summary/i);
    await user.clear(summaryInput);
    await user.type(summaryInput, 'Updated incident: unauthorized UPI debit of ₹30,000.');

    const amountInput = screen.getByLabelText(/Total Amount Lost/i);
    await user.clear(amountInput);
    await user.type(amountInput, '30000');

    // Click Save Changes
    const saveButton = screen.getAllByRole('button', { name: 'Save Changes' })[0];
    await user.click(saveButton);

    // Should return to view mode with updated values
    await waitFor(() => {
      expect(screen.getByTestId('complaint-preview-card')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Updated incident: unauthorized UPI debit of ₹30,000.'),
    ).toBeInTheDocument();
    expect(screen.getByText('₹30,000')).toBeInTheDocument();

    // Check store state was updated
    const updatedDraft = useDraftStore.getState().draft;
    expect(updatedDraft.incident.summary).toBe(
      'Updated incident: unauthorized UPI debit of ₹30,000.',
    );
    expect(updatedDraft.financial?.amountLost).toBe(30000);
  });

  it('validates invalid inputs in Edit mode and displays accessible errors', async () => {
    const user = userEvent.setup();
    useDraftStore.setState({ draft: sampleFinancialDraft });
    renderPreviewWithRoutes();

    await user.click(screen.getAllByRole('button', { name: 'Edit Report' })[0]);

    // Clear required summary
    const summaryInput = screen.getByLabelText(/Incident Summary/i);
    await user.clear(summaryInput);

    // Enter invalid mobile
    const mobileInput = screen.getByLabelText(/Mobile Number/i);
    await user.clear(mobileInput);
    await user.type(mobileInput, '12345');

    // Enter invalid email
    const emailInput = screen.getByLabelText(/Suspect Email Address/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');

    // Attempt to save
    await user.click(screen.getAllByRole('button', { name: 'Save Changes' })[0]);

    // Errors should be visible with role="alert"
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Please provide an incident summary.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid 10-digit Indian mobile number.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
  });

  it('cancels edit mode without updating store when Cancel is clicked', async () => {
    const user = userEvent.setup();
    useDraftStore.setState({ draft: sampleFinancialDraft });
    renderPreviewWithRoutes();

    await user.click(screen.getAllByRole('button', { name: 'Edit Report' })[0]);

    const summaryInput = screen.getByLabelText(/Incident Summary/i);
    await user.clear(summaryInput);
    await user.type(summaryInput, 'Temporary unsaved text');

    await user.click(screen.getAllByRole('button', { name: 'Cancel' })[0]);

    expect(screen.getByTestId('complaint-preview-card')).toBeInTheDocument();
    expect(screen.getByText(sampleFinancialDraft.incident.summary!)).toBeInTheDocument();
    expect(screen.queryByText('Temporary unsaved text')).not.toBeInTheDocument();
  });

  it('requires citizen declaration before demo submission and navigates to /success on valid submit', async () => {
    const user = userEvent.setup();
    useDraftStore.setState({ draft: sampleFinancialDraft });
    renderPreviewWithRoutes();

    // Click submit without declaration
    const submitBtn = screen.getByRole('button', { name: 'Submit demo complaint' });
    await user.click(submitBtn);

    // Declaration error displayed
    expect(
      screen.getByText('Please accept the declaration before submitting your demo complaint.'),
    ).toBeInTheDocument();

    // Check declaration checkbox
    const declarationCheckbox = screen.getByRole('checkbox');
    await user.click(declarationCheckbox);
    expect(declarationCheckbox).toBeChecked();

    // Submit now succeeds
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('success-page-stub')).toBeInTheDocument();
    });

    // Verify draft status in store
    const storeState = useDraftStore.getState();
    expect(storeState.draft.status).toBe('submitted');
    expect(storeState.draft.acknowledgementId).toMatch(/^CR-\d{4}-\d{2}-\d{7}$/);
  });

  it('navigates back to /chat when Return to Chat is clicked, retaining draft state', async () => {
    const user = userEvent.setup();
    useDraftStore.setState({ draft: sampleFinancialDraft });
    renderPreviewWithRoutes();

    const returnBtn = screen.getByRole('button', { name: 'Return to Chat' });
    await user.click(returnBtn);

    await waitFor(() => {
      expect(screen.getByTestId('chat-page-stub')).toBeInTheDocument();
    });

    // Store draft is unchanged
    expect(useDraftStore.getState().draft.incident.summary).toBe(
      sampleFinancialDraft.incident.summary,
    );
  });

  it('allows adding and removing evidence from preview page', async () => {
    const user = userEvent.setup();
    useDraftStore.setState({ draft: sampleFinancialDraft });
    renderPreviewWithRoutes();

    // Remove first evidence file
    const removeBtn = screen.getByLabelText('Remove file Bank_Debit_SMS.png');
    await user.click(removeBtn);

    expect(screen.queryByText('Bank_Debit_SMS.png')).not.toBeInTheDocument();
    expect(useDraftStore.getState().draft.evidence).toHaveLength(1);

    // Add sample evidence
    const sampleChip = screen.getByRole('button', { name: /\+ UPI_Transaction_Receipt\.png/i });
    await user.click(sampleChip);

    expect(screen.getByText('UPI_Transaction_Receipt.png')).toBeInTheDocument();
    expect(useDraftStore.getState().draft.evidence).toHaveLength(2);
  });

  it('renders completely in Hindi when language is set to hi', () => {
    useLanguageStore.setState({ language: 'hi' });
    useDraftStore.setState({ draft: sampleFinancialDraft });
    renderPreviewWithRoutes();

    expect(screen.getByRole('heading', { name: 'शिकायत पूर्वावलोकन' })).toBeInTheDocument();
    expect(screen.getByText('रक्षक एआई द्वारा तैयार')).toBeInTheDocument();
    expect(screen.getByText('केवल डेमो प्रोटोटाइप')).toBeInTheDocument();
    expect(screen.getByText('1. घटना वर्गीकरण')).toBeInTheDocument();
    expect(screen.getByText('2. नागरिक / शिकायतकर्ता विवरण')).toBeInTheDocument();
    expect(screen.getByText('3. घटना की जानकारी')).toBeInTheDocument();
    expect(screen.getByText('4. वित्तीय नुकसान का विवरण')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'डेमो शिकायत सबमिट करें' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'चैट पर वापस जाएं' })).toBeInTheDocument();
  });

  it('renders empty draft fallback when visiting with no draft and loads sample draft on click', async () => {
    const user = userEvent.setup();
    useDraftStore.getState().resetDraft();
    renderPreviewWithRoutes();

    expect(screen.getByText(/No complaint draft is currently loaded/i)).toBeInTheDocument();
    const loadSampleBtn = screen.getByRole('button', { name: /Load Sample Demo Draft/i });
    await user.click(loadSampleBtn);

    expect(screen.getByTestId('complaint-preview-card')).toBeInTheDocument();
    expect(screen.getByText('Financial Fraud')).toBeInTheDocument();
    expect(screen.getByText('₹25,000')).toBeInTheDocument();
  });
});
