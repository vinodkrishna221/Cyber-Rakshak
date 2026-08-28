import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

describe('App', () => {
  it('renders the application heading', () => {
    render(<App />, { wrapper: MemoryRouter });

    expect(screen.getByRole('heading', { name: 'A safer way to report cybercrime' })).toBeInTheDocument();
  });

  it.each([
    ['/', 'A safer way to report cybercrime'],
    ['/login', 'Demo login'],
    ['/chat', 'Complaint assistant'],
    ['/preview', 'Preview complaint'],
    ['/success', 'Demo acknowledgement'],
    ['/track', 'Track a complaint'],
  ])('renders the %s route', (route, heading) => {
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
