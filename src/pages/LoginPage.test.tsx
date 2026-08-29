import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LoginPage } from './LoginPage';
import { useLanguageStore } from '../i18n';
import { useDraftStore } from '../store';

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
    useDraftStore.getState().resetDraft();
  });

  const renderWithRouter = (initialRoute = '/login') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<div>Complaint Assistant Chat View</div>} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it('renders Step 1 with mobile input, state selector, Send OTP, and Guest option', () => {
    renderWithRouter();

    expect(screen.getByRole('heading', { name: 'Sign in to continue' })).toBeInTheDocument();
    expect(screen.getByText('Your complaint draft will be prepared after verification.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/State \/ Union Territory/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send OTP/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue as Guest/i })).toBeInTheDocument();
    expect(screen.getByText(/Private by Design/i)).toBeInTheDocument();
  });

  it('shows accessible inline validation errors on empty submission and blocks proceeding', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });
    await user.click(sendOtpButton);

    expect(await screen.findByText('Please enter your mobile number.')).toBeInTheDocument();
    expect(screen.getByText('Please select your State / Union Territory.')).toBeInTheDocument();

    const mobileInput = screen.getByLabelText(/Mobile Number/i);
    expect(mobileInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('validates 10-digit Indian mobile number format starting with 6-9', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const mobileInput = screen.getByLabelText(/Mobile Number/i);
    const stateSelect = screen.getByLabelText(/State \/ Union Territory/i);
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });

    // Invalid mobile (starts with 1 or less than 10 digits)
    await user.type(mobileInput, '12345');
    await user.selectOptions(stateSelect, 'Telangana');
    await user.click(sendOtpButton);

    expect(await screen.findByText(/Please enter a valid 10-digit Indian mobile number/i)).toBeInTheDocument();

    // Fix mobile with valid 10-digit number starting with 9
    await user.clear(mobileInput);
    await user.type(mobileInput, '9876543210');
    await user.click(sendOtpButton);

    // Should transition to Step 2 OTP view
    expect(await screen.findByText(/Enter 6-Digit OTP/i)).toBeInTheDocument();
  });

  it('transitions to Step 2 OTP view with visible demo OTP helper and mobile summary', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/State \/ Union Territory/i), 'Telangana');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    expect(await screen.findByText(/Enter 6-Digit OTP/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91 98765 43210/)).toBeInTheDocument();
    expect(screen.getByText('Telangana')).toBeInTheDocument();
    expect(screen.getByText(/Demo prototype: use OTP 123456 to continue/i)).toBeInTheDocument();
  });

  it('displays error and allows re-entry when incorrect OTP is entered', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    // Step 1
    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/State \/ Union Territory/i), 'Telangana');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    // Step 2 with incorrect OTP
    const digitInputs = await screen.findAllByRole('textbox');
    await user.click(digitInputs[0]);
    await user.paste('000000');

    const verifyButton = screen.getByRole('button', { name: /Verify & Continue/i });
    await user.click(verifyButton);

    expect(await screen.findByText(/Invalid OTP. For this demo prototype, please enter 123456./i)).toBeInTheDocument();
    expect(screen.queryByText('Complaint Assistant Chat View')).not.toBeInTheDocument();

    // Verify Zustand store was not authenticated
    expect(useDraftStore.getState().isAuthenticated).toBe(false);
  });

  it('successfully verifies deterministic OTP 123456, stores complainant data, and navigates to /chat', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    // Step 1
    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/State \/ Union Territory/i), 'Telangana');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    // Step 2: Verify "Verify & Continue" button is initially available
    expect(screen.getByRole('button', { name: /Verify & Continue/i })).toBeInTheDocument();

    // Enter valid OTP 123456 by typing digits
    const digitInputs = await screen.findAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      await user.type(digitInputs[i], String(i + 1));
    }

    await waitFor(() => {
      expect(screen.getByText('Complaint Assistant Chat View')).toBeInTheDocument();
    });

    const draft = useDraftStore.getState().draft;
    expect(useDraftStore.getState().isAuthenticated).toBe(true);
    expect(draft.complainant.mobile).toBe('9876543210');
    expect(draft.complainant.state).toBe('Telangana');
    expect(draft.complainant.isGuest).toBe(false);
  });

  it('automatically verifies and navigates on pasting complete valid OTP 123456', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    // Step 1
    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/State \/ Union Territory/i), 'Telangana');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    // Step 2 with pasting OTP 123456
    const digitInputs = await screen.findAllByRole('textbox');
    await user.click(digitInputs[0]);
    await user.paste('123456');

    await waitFor(() => {
      expect(screen.getByText('Complaint Assistant Chat View')).toBeInTheDocument();
    });

    expect(useDraftStore.getState().isAuthenticated).toBe(true);
  });

  it('supports quick fill button to populate OTP 123456', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/State \/ Union Territory/i), 'Karnataka');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    const fillButton = await screen.findByRole('button', { name: /Fill 123456/i });
    await user.click(fillButton);

    const digitInputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(digitInputs.map((i) => i.value).join('')).toBe('123456');

    const verifyButton = screen.getByRole('button', { name: /Verify & Continue/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Complaint Assistant Chat View')).toBeInTheDocument();
    });
  });

  it('bypasses OTP and sets mock guest complainant data when clicking Continue as Guest', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const guestButton = screen.getByRole('button', { name: /Continue as Guest/i });
    await user.click(guestButton);

    await waitFor(() => {
      expect(screen.getByText('Complaint Assistant Chat View')).toBeInTheDocument();
    });

    const draft = useDraftStore.getState().draft;
    expect(useDraftStore.getState().isAuthenticated).toBe(true);
    expect(draft.complainant.isGuest).toBe(true);
    expect(draft.complainant.name).toBe('Guest Citizen');
    expect(draft.complainant.mobile).toBe('9800000000');
  });

  it('allows navigating back to Step 1 via Change details button', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/State \/ Union Territory/i), 'Gujarat');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    expect(await screen.findByText(/Enter 6-Digit OTP/i)).toBeInTheDocument();

    const changeDetailsButton = screen.getByRole('button', { name: /Change details/i });
    await user.click(changeDetailsButton);

    expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send OTP/i })).toBeInTheDocument();
  });

  it('shows demo resend OTP feedback notification when clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/State \/ Union Territory/i), 'Delhi');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    const resendButton = await screen.findByRole('button', { name: /Resend OTP/i });
    await user.click(resendButton);

    expect(await screen.findByText('New demo OTP sent: 123456')).toBeInTheDocument();
  });

  it('renders completely in Hindi when active language is set to hi', () => {
    act(() => {
      useLanguageStore.setState({ language: 'hi' });
    });
    renderWithRouter();

    expect(screen.getByRole('heading', { name: 'जारी रखने के लिए साइन इन करें' })).toBeInTheDocument();
    expect(screen.getByText('सत्यापन के बाद आपकी शिकायत का मसौदा तैयार किया जाएगा।')).toBeInTheDocument();
    expect(screen.getByLabelText(/मोबाइल नंबर/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/राज्य \/ केंद्र शासित प्रदेश/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ओटीपी भेजें/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /अतिथि के रूप में जारी रखें/i })).toBeInTheDocument();
  });

  it('updates copy dynamically when language switches between English and Hindi', () => {
    const { rerender } = renderWithRouter();

    expect(screen.getByRole('heading', { name: 'Sign in to continue' })).toBeInTheDocument();

    act(() => {
      useLanguageStore.setState({ language: 'hi' });
    });

    rerender(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'जारी रखने के लिए साइन इन करें' })).toBeInTheDocument();
  });

  it('handles formatted mobile numbers (+91 with spaces, hyphens, parentheses, or leading 0)', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const mobileInput = screen.getByLabelText(/Mobile Number/i);
    const stateSelect = screen.getByLabelText(/State \/ Union Territory/i);
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });

    await user.type(mobileInput, '+91 (987) 654-3210');
    await user.selectOptions(stateSelect, 'Maharashtra');
    await user.click(sendOtpButton);

    expect(await screen.findByText(/Enter 6-Digit OTP/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91 98765 43210/)).toBeInTheDocument();
    expect(screen.getByText('Maharashtra')).toBeInTheDocument();
  });

  it('submits Step 2 form using keyboard Enter key', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/State \/ Union Territory/i), 'Gujarat');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    const fillButton = await screen.findByRole('button', { name: /Fill 123456/i });
    await user.click(fillButton);

    const digitInputs = screen.getAllByRole('textbox');
    await user.type(digitInputs[5], '{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Complaint Assistant Chat View')).toBeInTheDocument();
    });
    expect(useDraftStore.getState().isAuthenticated).toBe(true);
  });

  it('displays Hindi localized state name in Step 2 summary when active language is hi', async () => {
    act(() => {
      useLanguageStore.setState({ language: 'hi' });
    });
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText(/मोबाइल नंबर/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/राज्य \/ केंद्र शासित प्रदेश/i), 'Telangana');
    await user.click(screen.getByRole('button', { name: /ओटीपी भेजें/i }));

    expect(await screen.findByText(/6 अंकों का ओटीपी दर्ज करें/i)).toBeInTheDocument();
    expect(screen.getByText('तेलंगाना')).toBeInTheDocument();
  });

  it('synchronizes active language into draft store on login and guest continuation', async () => {
    act(() => {
      useLanguageStore.setState({ language: 'hi' });
    });
    const user = userEvent.setup();
    renderWithRouter();

    const guestButton = screen.getByRole('button', { name: /अतिथि के रूप में जारी रखें/i });
    await user.click(guestButton);

    await waitFor(() => {
      expect(screen.getByText('Complaint Assistant Chat View')).toBeInTheDocument();
    });
    expect(useDraftStore.getState().draft.language).toBe('hi');
  });

  it('preserves mobile and state input values when navigating back to Step 1', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const mobileInput = screen.getByLabelText(/Mobile Number/i) as HTMLInputElement;
    const stateSelect = screen.getByLabelText(/State \/ Union Territory/i) as HTMLSelectElement;

    await user.type(mobileInput, '9876543210');
    await user.selectOptions(stateSelect, 'Karnataka');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    expect(await screen.findByText(/Enter 6-Digit OTP/i)).toBeInTheDocument();

    const changeDetailsButton = screen.getByRole('button', { name: /Change details/i });
    await user.click(changeDetailsButton);

    expect(screen.getByLabelText(/Mobile Number/i)).toHaveValue('9876543210');
    expect(screen.getByLabelText(/State \/ Union Territory/i)).toHaveValue('Karnataka');
  });

  it('normalizes +91 with leading 0 cleanly', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const mobileInput = screen.getByLabelText(/Mobile Number/i);
    const stateSelect = screen.getByLabelText(/State \/ Union Territory/i);
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });

    await user.type(mobileInput, '+91 09876543210');
    await user.selectOptions(stateSelect, 'Delhi');
    await user.click(sendOtpButton);

    expect(await screen.findByText(/Enter 6-Digit OTP/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91 98765 43210/)).toBeInTheDocument();
  });

  it('displays error message when submitting incomplete OTP', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/State \/ Union Territory/i), 'Goa');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    const digitInputs = await screen.findAllByRole('textbox');
    await user.type(digitInputs[0], '1');
    await user.type(digitInputs[1], '2');

    const verifyButton = screen.getByRole('button', { name: /Verify & Continue/i });
    await user.click(verifyButton);

    expect(await screen.findByText('OTP must be exactly 6 digits.')).toBeInTheDocument();
  });

  it('allows guest login directly from Step 2', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/State \/ Union Territory/i), 'Punjab');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    expect(await screen.findByText(/Enter 6-Digit OTP/i)).toBeInTheDocument();

    const guestButtons = screen.getAllByRole('button', { name: /Continue as Guest/i });
    await user.click(guestButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Complaint Assistant Chat View')).toBeInTheDocument();
    });

    const draft = useDraftStore.getState().draft;
    expect(useDraftStore.getState().isAuthenticated).toBe(true);
    expect(draft.complainant.isGuest).toBe(true);
    expect(draft.complainant.state).toBe('Punjab');
  });

  it('populates all 36 Indian states and Union Territories in the state selector', () => {
    renderWithRouter();

    const stateSelect = screen.getByLabelText(/State \/ Union Territory/i) as HTMLSelectElement;
    // 36 states/UTs + 1 default placeholder option = 37 options
    expect(stateSelect.options.length).toBe(37);
    expect(stateSelect.options[0].value).toBe('');
    expect(stateSelect.options[1].value).toBe('Andaman and Nicobar Islands');
  });

  it('handles direct navigation with query parameters gracefully', () => {
    renderWithRouter('/login?from=portal&ref=demo');

    expect(screen.getByRole('heading', { name: 'Sign in to continue' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
  });

  it('preserves existing draft incident data in store while updating complainant details on login', async () => {
    useDraftStore.getState().updateDraft({
      incident: {
        summary: 'Existing incident summary',
        date: '2026-08-28',
        time: '14:00',
        platform: 'UPI',
        location: 'Hyderabad',
        description: 'Test incident description',
      },
    });

    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    await user.selectOptions(screen.getByLabelText(/State \/ Union Territory/i), 'Telangana');
    await user.click(screen.getByRole('button', { name: /Send OTP/i }));

    const fillButton = await screen.findByRole('button', { name: /Fill 123456/i });
    await user.click(fillButton);

    const verifyButton = screen.getByRole('button', { name: /Verify & Continue/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Complaint Assistant Chat View')).toBeInTheDocument();
    });

    const draft = useDraftStore.getState().draft;
    expect(draft.complainant.mobile).toBe('9876543210');
    expect(draft.complainant.state).toBe('Telangana');
    expect(draft.incident.summary).toBe('Existing incident summary');
    expect(draft.incident.description).toBe('Test incident description');
  });
});


