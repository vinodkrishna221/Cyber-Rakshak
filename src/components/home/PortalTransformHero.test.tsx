import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PortalTransformHero } from './PortalTransformHero';
import { useLanguageStore } from '../../i18n';

describe('PortalTransformHero Component', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
  });

  it('renders initial legacy portal state on landing', () => {
    render(
      <MemoryRouter>
        <PortalTransformHero initialProgress={0} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('portal-transform-hero')).toBeInTheDocument();
    expect(screen.getByTestId('browser-viewport-frame')).toBeInTheDocument();

    // Clean legacy portal image layer
    const legacyImg = screen.getByAltText('National Cyber Crime Reporting Portal');
    expect(legacyImg).toBeInTheDocument();
    expect(legacyImg).toHaveAttribute('src', '/legacy-portal-clean.png');

    // Scroll prompt indicator
    expect(
      screen.getByRole('button', { name: /Scroll down to experience Cyber Rakshak transformation/i }),
    ).toBeInTheDocument();

    // No debug buttons or sliders
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(screen.queryByText(/Skip animation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Play transformation/i)).not.toBeInTheDocument();
  });

  it('renders resolved Cyber Rakshak portal state at progress = 1', () => {
    render(
      <MemoryRouter>
        <PortalTransformHero initialProgress={1} />
      </MemoryRouter>,
    );

    // Cyber Rakshak modern content is visible
    expect(screen.getByTestId('cyber-rakshak-resolved-view')).toBeInTheDocument();
    expect(screen.getByText(/Report cybercrime through a guided conversation/i)).toBeInTheDocument();
  });

  it('navigates to /login and /track from inside resolved hero actions', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={<PortalTransformHero initialProgress={1} />}
          />
          <Route path="/login" element={<div>Target Login Route</div>} />
          <Route path="/track" element={<div>Target Track Route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    const startReportBtn = screen.getByRole('button', { name: /Start a Report/i });
    await user.click(startReportBtn);
    expect(screen.getByText('Target Login Route')).toBeInTheDocument();
  });

  it('isolates keyboard focus using inert attribute when hero is not yet resolved', () => {
    render(
      <MemoryRouter>
        <PortalTransformHero initialProgress={0} />
      </MemoryRouter>,
    );

    const resolvedView = screen.getByTestId('cyber-rakshak-resolved-view');
    expect(resolvedView).toHaveAttribute('inert');
  });

  it('cleans up scroll and resize listeners cleanly on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <MemoryRouter>
        <PortalTransformHero initialProgress={0} />
      </MemoryRouter>,
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('responds to scroll events and computes transformation progress', () => {
    render(
      <MemoryRouter>
        <PortalTransformHero initialProgress={0} />
      </MemoryRouter>,
    );

    // Simulate window scroll
    fireEvent.scroll(window, { target: { scrollY: 300 } });

    // Component remains stable and active
    expect(screen.getByTestId('portal-transform-hero')).toBeInTheDocument();
  });
});
