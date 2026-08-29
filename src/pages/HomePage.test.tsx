import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './HomePage';
import { useLanguageStore } from '../i18n';

describe('HomePage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
  });

  it('renders the legacy portal transformation hero and browser frame on landing', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    // Browser frame and clean legacy portal view on landing
    expect(screen.getByTestId('portal-transform-hero')).toBeInTheDocument();
    expect(screen.getByTestId('browser-viewport-frame')).toBeInTheDocument();
    expect(screen.getByAltText('National Cyber Crime Reporting Portal')).toBeInTheDocument();
  });

  it('renders primary CTA (Start a Report) and navigates to /login', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<div>Mock Login Page Target</div>} />
        </Routes>
      </MemoryRouter>,
    );

    const startReportButtons = screen.getAllByRole('button', { name: /Start a Report/i });
    expect(startReportButtons.length).toBeGreaterThanOrEqual(1);

    await user.click(startReportButtons[0]);

    expect(screen.getByText('Mock Login Page Target')).toBeInTheDocument();
  });

  it('renders secondary CTA (Track Complaint) and navigates to /track', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/track" element={<div>Mock Track Page Target</div>} />
        </Routes>
      </MemoryRouter>,
    );

    const trackButtons = screen.getAllByRole('button', { name: /Track Complaint/i });
    expect(trackButtons.length).toBeGreaterThanOrEqual(1);

    await user.click(trackButtons[0]);

    expect(screen.getByText('Mock Track Page Target')).toBeInTheDocument();
  });

  it('renders the emergency golden hour banner with tel:1930 link', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /Financial fraud\? Call 1930 immediately/i }),
    ).toBeInTheDocument();

    const emergencyLinks = screen.getAllByRole('link', { name: /1930/i });
    const hasTel1930 = emergencyLinks.some(
      (link) => link.getAttribute('href') === 'tel:1930',
    );
    expect(hasTel1930).toBe(true);
  });

  it('renders the static Before / After portal comparison card with legacy and next-gen cues', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /Transforming intimidating bureaucratic paperwork/i }),
    ).toBeInTheDocument();

    // Traditional portal side
    expect(screen.getByText('Legacy')).toBeInTheDocument();
    expect(screen.getByText('Complex Forms & Legal Jargon')).toBeInTheDocument();
    expect(screen.getByText(/40\+ mandatory fields & intimidating legal sections/i)).toBeInTheDocument();

    // Next-Gen Cyber Rakshak side
    expect(screen.getByText('Next-Gen')).toBeInTheDocument();
    expect(screen.getByText('Guided Conversational Assistant')).toBeInTheDocument();
    expect(screen.getByText(/Plain-language questions & instant answers/i)).toBeInTheDocument();
    expect(screen.getByText(/Financial Fraud • 94% Match/i)).toBeInTheDocument();
    expect(screen.getByText('Golden Hour Action')).toBeInTheDocument();
  });

  it('renders the 3 responsive trust cards (Guided reporting, Evidence checklist, Private by design)', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 3, name: 'Guided reporting' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Evidence checklist' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Private by design' })).toBeInTheDocument();

    expect(screen.getByText(/Zero legal jargon or intimidating forms/i)).toBeInTheDocument();
    expect(screen.getByText(/Tailored to incident type/i)).toBeInTheDocument();
    expect(screen.getByText(/Client-side in-browser processing/i)).toBeInTheDocument();
  });

  it('renders the 4-step workflow process cards', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText('1. Describe Incident')).toBeInTheDocument();
    expect(screen.getByText('2. Smart Classification')).toBeInTheDocument();
    expect(screen.getByText('3. Attach Evidence')).toBeInTheDocument();
    expect(screen.getByText('4. Review & Acknowledge')).toBeInTheDocument();
  });

  it('renders completely in Hindi when language is set to hi', () => {
    useLanguageStore.setState({ language: 'hi' });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByAltText('National Cyber Crime Reporting Portal'),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole('button', { name: /रिपोर्ट शुरू करें/i }).length,
    ).toBeGreaterThanOrEqual(1);

    expect(
      screen.getAllByRole('button', { name: /शिकायत ट्रैक करें/i }).length,
    ).toBeGreaterThanOrEqual(1);

    expect(
      screen.getByRole('heading', { level: 3, name: 'मार्गदर्शित रिपोर्टिंग' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: 'साक्ष्य चेकलिस्ट' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: 'गोपनीयता और सुरक्षा' }),
    ).toBeInTheDocument();

    // Verify Emergency golden hour badge in Hindi
    expect(screen.getByText('स्वर्णिम घंटा कार्रवाई')).toBeInTheDocument();

    // Verify BeforeAfter comparison card in Hindi
    expect(screen.getByText('पारंपरिक पोर्टल')).toBeInTheDocument();
    expect(screen.getByText('अगली पीढ़ी')).toBeInTheDocument();
    expect(screen.getByText('पारंपरिक प्रक्रिया')).toBeInTheDocument();
    expect(screen.getByText('जटिल फॉर्म और कानूनी शब्दावली')).toBeInTheDocument();
    expect(screen.getByText('मार्गदर्शित एआई सहायक')).toBeInTheDocument();
    expect(screen.getByText(/फॉर्म-66डी \/ शिकायत पंजीकरण/i)).toBeInTheDocument();
    expect(screen.getByText(/वित्तीय धोखाधड़ी • 94% सटीक मिलान/i)).toBeInTheDocument();

    // Verify Workflow steps in Hindi
    expect(screen.getByText('1. घटना बताइए')).toBeInTheDocument();
    expect(screen.getByText('2. एआई वर्गीकरण')).toBeInTheDocument();
    expect(screen.getByText('3. साक्ष्य जोड़ें')).toBeInTheDocument();
    expect(screen.getByText('4. समीक्षा व पावती')).toBeInTheDocument();
  });

  it('renders bottom CTA banner with official helper note and navigation links', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<div>Mock Login Route</div>} />
          <Route path="/track" element={<div>Mock Track Route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Guided digital assistance for citizens/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Tell us what happened\. We will prepare the report\./i })).toBeInTheDocument();

    const startButtons = screen.getAllByRole('button', { name: /Start a Report/i });
    expect(startButtons.length).toBeGreaterThanOrEqual(1);

    const trackButtons = screen.getAllByRole('button', { name: /Track Complaint/i });
    expect(trackButtons.length).toBeGreaterThanOrEqual(1);

    await user.click(startButtons[startButtons.length - 1]);
    expect(screen.getByText('Mock Login Route')).toBeInTheDocument();
  });
});
