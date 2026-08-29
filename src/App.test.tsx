import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { useLanguageStore } from './i18n';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
  });

  it('renders the application heading', () => {
    render(<App />, { wrapper: MemoryRouter });

    expect(screen.getByRole('heading', { name: 'A safer way to report cybercrime' })).toBeInTheDocument();
  });

  it.each([
    ['/', 'A safer way to report cybercrime'],
    ['/login', 'Sign in to continue'],
    ['/chat', 'Complaint assistant'],
    ['/preview', 'Complaint Preview'],
    ['/success', 'Demo acknowledgement'],
    ['/track', 'Track Complaint'],
  ])('renders the %s route', (route, heading) => {
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it.each([
    ['/', 'साइबर अपराध की रिपोर्ट करने का एक सुरक्षित तरीका'],
    ['/login', 'जारी रखने के लिए साइन इन करें'],
    ['/chat', 'शिकायत सहायक'],
    ['/preview', 'शिकायत पूर्वावलोकन'],
    ['/success', 'डेमो पावती'],
    ['/track', 'शिकायत ट्रैक करें'],
  ])('renders the %s route in Hindi when active language is hi', (route, heading) => {
    useLanguageStore.setState({ language: 'hi' });

    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
