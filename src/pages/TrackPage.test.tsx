import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TrackPage } from './TrackPage';
import { useLanguageStore } from '../i18n';
import { useDraftStore } from '../store';
import { ComplaintDraft } from '../types';

describe('TrackPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
    useDraftStore.getState().resetDraft();
  });

  it('renders track page heading, input form, and demo ID sample', () => {
    render(
      <MemoryRouter>
        <TrackPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Track Complaint' }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/Acknowledgement Number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CR-2026-08-0001930/i })).toBeInTheDocument();
  });

  it('displays demo status result card with timeline and incident details', () => {
    render(
      <MemoryRouter>
        <TrackPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'CR-2026-08-0001930' })).toBeInTheDocument();
    expect(screen.getByText('Under Demo Review')).toBeInTheDocument();
    expect(screen.getByText('Report Submitted')).toBeInTheDocument();
    expect(screen.getByText('AI Verified')).toBeInTheDocument();
    expect(screen.getByText('Demo Review')).toBeInTheDocument();
    expect(screen.getByText(/Unauthorized debit of ₹25,000/i)).toBeInTheDocument();
    expect(screen.getByText(/2 files \(SMS Screenshot, Bank Debit Advice\)/i)).toBeInTheDocument();
  });

  it('autofills and searches demo ID when clicking demo sample ID button', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TrackPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/Acknowledgement Number/i);
    await user.clear(input);
    expect(input).toHaveValue('');

    const demoButton = screen.getByRole('button', { name: /CR-2026-08-0001930/i });
    await user.click(demoButton);

    expect(input).toHaveValue('CR-2026-08-0001930');
    expect(screen.getByRole('heading', { name: 'CR-2026-08-0001930' })).toBeInTheDocument();
  });

  it('clears result card when clicking reset search button', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TrackPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'CR-2026-08-0001930' })).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: /Search another ID/i });
    await user.click(resetButton);

    expect(screen.queryByRole('heading', { name: 'CR-2026-08-0001930' })).not.toBeInTheDocument();
  });

  it('navigates to / and /login via action buttons', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/track']}>
        <Routes>
          <Route path="/track" element={<TrackPage />} />
          <Route path="/" element={<div>Mock Home Page Target</div>} />
          <Route path="/login" element={<div>Mock Login Page Target</div>} />
        </Routes>
      </MemoryRouter>,
    );

    const homeButton = screen.getByRole('button', { name: /Return home/i });
    await user.click(homeButton);
    expect(screen.getByText('Mock Home Page Target')).toBeInTheDocument();
  });

  it('displays not-found error state when entering non-demo ID and recovers on clicking sample demo button', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TrackPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/Acknowledgement Number/i);
    await user.clear(input);
    await user.type(input, 'CR-9999-NONEXISTENT');

    const searchButton = screen.getByRole('button', { name: /Check Status/i });
    await user.click(searchButton);

    expect(screen.getByRole('heading', { name: 'Acknowledgement Number Not Found' })).toBeInTheDocument();
    expect(screen.getByText(/Please enter a valid demo acknowledgement number/i)).toBeInTheDocument();
    expect(screen.getByText(/CR-9999-NONEXISTENT/i)).toBeInTheDocument();

    // Click sample recovery button
    const sampleRecoveryButton = screen.getByRole('button', { name: /Use Sample Demo ID/i });
    await user.click(sampleRecoveryButton);

    expect(screen.getByRole('heading', { name: 'CR-2026-08-0001930' })).toBeInTheDocument();
    expect(screen.getByText('Under Demo Review')).toBeInTheDocument();
  });

  it('displays not-found state when submitting empty query', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TrackPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/Acknowledgement Number/i);
    await user.clear(input);
    expect(input).toHaveValue('');

    const searchButton = screen.getByRole('button', { name: /Check Status/i });
    await user.click(searchButton);

    expect(screen.getByRole('heading', { name: 'Acknowledgement Number Not Found' })).toBeInTheDocument();
    expect(screen.getByText(/Please enter a valid demo acknowledgement number/i)).toBeInTheDocument();
  });

  it('renders completely in Hindi when language is set to hi', async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({ language: 'hi' });

    render(
      <MemoryRouter>
        <TrackPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'शिकायत ट्रैक करें' }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/पावती संख्या/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /स्थिति देखें/i })).toBeInTheDocument();
    expect(screen.getByText(/डेमो समीक्षाधीन/i)).toBeInTheDocument();
    expect(screen.getByText('रिपोर्ट दर्ज')).toBeInTheDocument();
    expect(screen.getByText('एआई सत्यापन पूर्ण')).toBeInTheDocument();
    expect(screen.getByText('28 अगस्त 2026')).toBeInTheDocument();
    expect(screen.getByText('94% एआई मिलान')).toBeInTheDocument();
    expect(screen.getByText('प्रगति पर')).toBeInTheDocument();

    // Verify Not Found in Hindi
    const input = screen.getByLabelText(/पावती संख्या/i);
    await user.clear(input);
    await user.type(input, 'CR-INVALID-ID');
    await user.click(screen.getByRole('button', { name: /स्थिति देखें/i }));

    expect(screen.getByRole('heading', { name: 'पावती संख्या नहीं मिली' })).toBeInTheDocument();
    expect(screen.getByText(/खोजा गया:/i)).toBeInTheDocument();
    expect(screen.getByText(/CR-INVALID-ID/i)).toBeInTheDocument();
  });

  it('normalizes search query handling lowercase letters and surrounding whitespace', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TrackPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/Acknowledgement Number/i);
    await user.clear(input);
    await user.type(input, '  cr-2026-08-0001930  ');

    const searchButton = screen.getByRole('button', { name: /Check Status/i });
    await user.click(searchButton);

    expect(screen.getByRole('heading', { name: 'CR-2026-08-0001930' })).toBeInTheDocument();
    expect(screen.getByText('Under Demo Review')).toBeInTheDocument();
  });

  it('tracks newly submitted user complaint dynamically with summary, category, and evidence count', async () => {
    const user = userEvent.setup();

    const customComplaint: ComplaintDraft = {
      acknowledgementId: 'CR-2026-08-0007777',
      language: 'en',
      category: 'other_cybercrime',
      subCategory: 'Account Hacking / Identity Theft',
      subCategoryKey: 'account_hacking_takeover',
      confidence: 0.96,
      status: 'submitted',
      submittedAt: '2026-08-29T10:00:00Z',
      complainant: {
        name: 'Arjun Roy',
        mobile: '9876543210',
        state: 'West Bengal',
      },
      incident: {
        summary: 'Unauthorized takeover of business email and cloud storage.',
        date: '29 Aug 2026',
        time: '10:00 AM',
        platform: 'Cloud Email',
        location: 'Kolkata',
      },
      evidence: [
        {
          id: 'ev-1',
          name: 'Breach_Log.txt',
          type: 'text/plain',
          mockSize: '45 KB',
        },
      ],
    };

    useDraftStore.setState({
      submittedComplaints: {
        'CR-2026-08-0007777': customComplaint,
      },
    });

    render(
      <MemoryRouter initialEntries={['/track']}>
        <TrackPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/Acknowledgement Number/i);
    await user.clear(input);
    await user.type(input, 'CR-2026-08-0007777');

    const searchButton = screen.getByRole('button', { name: /Check Status/i });
    await user.click(searchButton);

    expect(screen.getByRole('heading', { name: 'CR-2026-08-0007777' })).toBeInTheDocument();
    expect(
      screen.getByText('Unauthorized takeover of business email and cloud storage.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 files \(Breach_Log\.txt\)/i)).toBeInTheDocument();
    expect(screen.getByText(/96% AI Match/i)).toBeInTheDocument();
  });

  it('automatically searches and displays complaint passed via router location state', () => {
    const customComplaint: ComplaintDraft = {
      acknowledgementId: 'CR-2026-08-0008888',
      language: 'en',
      category: 'financial_fraud',
      subCategory: 'UPI / Banking Fraud',
      confidence: 0.95,
      status: 'submitted',
      submittedAt: '2026-08-29T11:00:00Z',
      complainant: {
        name: 'Meera Patel',
      },
      incident: {
        summary: 'Debit card cloned and unauthorized ATM withdrawal.',
      },
      evidence: [],
    };

    useDraftStore.setState({
      submittedComplaints: {
        'CR-2026-08-0008888': customComplaint,
      },
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/track',
            state: { ackId: 'CR-2026-08-0008888' },
          },
        ]}
      >
        <TrackPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'CR-2026-08-0008888' })).toBeInTheDocument();
    expect(
      screen.getByText('Debit card cloned and unauthorized ATM withdrawal.'),
    ).toBeInTheDocument();
  });
});
