import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SuccessPage } from './SuccessPage';
import { useDraftStore, SAMPLE_DEMO_COMPLAINT } from '../store';
import { useLanguageStore } from '../i18n';
import { ComplaintDraft } from '../types';

const sampleSubmittedFinancialComplaint: ComplaintDraft = {
  acknowledgementId: 'CR-2026-08-0001930',
  language: 'en',
  category: 'financial_fraud',
  subCategory: 'UPI / Banking Fraud',
  subCategoryKey: 'upi_banking_fraud',
  confidence: 0.94,
  isEmergency: true,
  status: 'submitted',
  submittedAt: '2026-08-28T16:35:00.000Z',
  complainant: {
    name: 'Vikram Singh',
    mobile: '9876543210',
    state: 'Telangana',
    isGuest: false,
  },
  incident: {
    summary:
      'Caller pretended to be SBI customer care, took OTP, and debited ₹25,000 via UPI.',
    date: '28 Aug 2026',
    time: '04:30 PM',
    platform: 'Phone call + Google Pay',
    location: 'Hyderabad, Telangana',
    description:
      'Received a call claiming KYC expiry. Within minutes of sharing OTP, money was deducted.',
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

const sampleSubmittedWomenChildComplaint: ComplaintDraft = {
  acknowledgementId: 'CR-2026-08-0004567',
  language: 'en',
  category: 'women_child_related_crime',
  subCategory: 'Cyber Stalking & Harassment',
  subCategoryKey: 'cyber_stalking_harassment',
  confidence: 0.92,
  isEmergency: false,
  status: 'submitted',
  submittedAt: '2026-08-28T17:00:00.000Z',
  complainant: {
    name: 'Pooja Sharma',
    mobile: '9876511111',
    state: 'Delhi',
    isGuest: false,
  },
  incident: {
    summary:
      'Unknown user is stalking and sending abusive messages across multiple accounts.',
    date: '28 Aug 2026',
    time: '05:00 PM',
    platform: 'Instagram',
    location: 'New Delhi',
  },
  evidence: [],
};

const renderSuccessWithRoutes = (initialEntries = ['/success']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/success" element={<SuccessPage />} />
        <Route
          path="/track"
          element={<div data-testid="track-page-stub">Track Page Stub</div>}
        />
        <Route
          path="/chat"
          element={<div data-testid="chat-page-stub">Chat Assistant Stub</div>}
        />
        <Route
          path="/preview"
          element={<div data-testid="preview-page-stub">Preview Page Stub</div>}
        />
        <Route
          path="/"
          element={<div data-testid="home-page-stub">Home Page Stub</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
};

describe('SuccessPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
    useDraftStore.getState().resetDraft();
    useDraftStore.setState({
      latestSubmissionId: null,
      submittedComplaints: {
        'CR-2026-08-0001930': SAMPLE_DEMO_COMPLAINT,
      },
    });
  });

  it('renders acknowledgement receipt for submitted financial fraud complaint with ID, status, and details', () => {
    useDraftStore.setState({
      draft: sampleSubmittedFinancialComplaint,
      latestSubmissionId: 'CR-2026-08-0001930',
      submittedComplaints: {
        'CR-2026-08-0001930': sampleSubmittedFinancialComplaint,
      },
    });

    renderSuccessWithRoutes();

    // Page title and badges
    expect(
      screen.getByRole('heading', { level: 1, name: 'Demo acknowledgement' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Submission Complete/i).length).toBeGreaterThan(0);

    // Acknowledgement Receipt Card
    expect(
      screen.getByRole('heading', {
        name: 'Official Demo Acknowledgement Receipt',
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('acknowledgement-number')).toHaveTextContent(
      'CR-2026-08-0001930',
    );
    expect(screen.getByText('Submitted for demo review')).toBeInTheDocument();

    // Complaint Details
    expect(screen.getByText('Vikram Singh • +91 9876543210 (Telangana)')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Caller pretended to be SBI customer care, took OTP, and debited ₹25,000 via UPI.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('₹25,000 (UPI) • Ref: UTR987654321012')).toBeInTheDocument();
    expect(screen.getByText('2 files attached')).toBeInTheDocument();
    expect(screen.getByText('Bank_Debit_SMS.png')).toBeInTheDocument();
  });

  it('displays official demo warning banner', () => {
    useDraftStore.setState({
      draft: sampleSubmittedFinancialComplaint,
    });

    renderSuccessWithRoutes();

    expect(
      screen.getByText('Demo Prototype Only — No Police Report Filed'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'This is an educational prototype. No complaint was transmitted to government portals, police departments, or real-time databases.',
      ),
    ).toBeInTheDocument();
  });

  it('displays urgent Golden Hour financial fraud guidance when complaint is financial', () => {
    useDraftStore.setState({
      draft: sampleSubmittedFinancialComplaint,
      latestSubmissionId: 'CR-2026-08-0001930',
    });

    renderSuccessWithRoutes();

    expect(
      screen.getByRole('heading', {
        name: 'Urgent Golden Hour Advisory for Financial Fraud',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /1930/i })[0],
    ).toHaveAttribute('href', 'tel:1930');
  });

  it('does not display financial emergency banner for non-financial category', () => {
    useDraftStore.setState({
      draft: sampleSubmittedWomenChildComplaint,
      latestSubmissionId: 'CR-2026-08-0004567',
      submittedComplaints: {
        'CR-2026-08-0004567': sampleSubmittedWomenChildComplaint,
      },
    });

    renderSuccessWithRoutes();

    expect(
      screen.queryByRole('heading', {
        name: 'Urgent Golden Hour Advisory for Financial Fraud',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Women / Child Related Crime'),
    ).toBeInTheDocument();
  });

  it('handles copying acknowledgement ID with visual confirmation', async () => {
    const user = userEvent.setup();
    useDraftStore.setState({
      draft: sampleSubmittedFinancialComplaint,
      latestSubmissionId: 'CR-2026-08-0001930',
      submittedComplaints: {
        'CR-2026-08-0001930': sampleSubmittedFinancialComplaint,
      },
    });

    // Mock clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
      writable: true,
    });

    renderSuccessWithRoutes();

    const copyBtn = screen.getByRole('button', { name: 'Copy ID' });
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('CR-2026-08-0001930');
    expect(screen.getByText('Copied to clipboard!')).toBeInTheDocument();
  });

  it('navigates to /track with acknowledgement ID when clicking Track Complaint CTA', async () => {
    const user = userEvent.setup();
    useDraftStore.setState({
      draft: sampleSubmittedFinancialComplaint,
      latestSubmissionId: 'CR-2026-08-0001930',
    });

    renderSuccessWithRoutes();

    const trackBtn = screen.getByRole('button', { name: 'Track Complaint' });
    await user.click(trackBtn);

    await waitFor(() => {
      expect(screen.getByTestId('track-page-stub')).toBeInTheDocument();
    });
  });

  it('navigates to /chat and resets draft when clicking Start New Report', async () => {
    const user = userEvent.setup();
    useDraftStore.setState({
      draft: sampleSubmittedFinancialComplaint,
    });

    renderSuccessWithRoutes();

    const newReportBtn = screen.getByRole('button', {
      name: 'Start New Report',
    });
    await user.click(newReportBtn);

    await waitFor(() => {
      expect(screen.getByTestId('chat-page-stub')).toBeInTheDocument();
    });

    expect(useDraftStore.getState().draft.status).toBe('draft');
  });

  it('calls window.print when clicking Print Summary', async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    useDraftStore.setState({
      draft: sampleSubmittedFinancialComplaint,
    });

    renderSuccessWithRoutes();

    const printBtn = screen.getByRole('button', { name: 'Print Summary' });
    await user.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('navigates to home when clicking Return to Home', async () => {
    const user = userEvent.setup();
    useDraftStore.setState({
      draft: sampleSubmittedFinancialComplaint,
    });

    renderSuccessWithRoutes();

    const homeBtn = screen.getByRole('button', { name: 'Return to Home' });
    await user.click(homeBtn);

    await waitFor(() => {
      expect(screen.getByTestId('home-page-stub')).toBeInTheDocument();
    });
  });

  it('renders completely in Hindi when language is set to hi', () => {
    useLanguageStore.setState({ language: 'hi' });
    useDraftStore.setState({
      draft: sampleSubmittedFinancialComplaint,
      latestSubmissionId: 'CR-2026-08-0001930',
      submittedComplaints: {
        'CR-2026-08-0001930': sampleSubmittedFinancialComplaint,
      },
    });

    renderSuccessWithRoutes();

    expect(
      screen.getByRole('heading', { level: 1, name: 'डेमो पावती' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'आधिकारिक डेमो पावती रसीद' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('केवल डेमो प्रोटोटाइप — कोई पुलिस रिपोर्ट दर्ज नहीं हुई'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'शिकायत ट्रैक करें' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'नई रिपोर्ट शुरू करें' }),
    ).toBeInTheDocument();
  });
});
