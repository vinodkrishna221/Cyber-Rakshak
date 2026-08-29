import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { useLanguageStore } from '../../i18n';

describe('AppShell component', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
  });

  it('renders layout header, emergency helpline elements, main content, and footer', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <div data-testid="test-content">Dashboard Content</div>
        </AppShell>
      </MemoryRouter>
    );

    // Skip to main content accessibility link
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();

    // Emergency advisory banner
    expect(screen.getByText(/financial fraud\?/i)).toBeInTheDocument();

    // Brand and Demo Badge
    expect(screen.getAllByText(/cyber rakshak/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/demo prototype/i).length).toBeGreaterThanOrEqual(1);

    // Navigation links
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start a report/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chat assistant/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /track complaint/i })).toBeInTheDocument();

    // Emergency 1930 CTA links in header and footer
    expect(screen.getAllByRole('link', { name: /call national cybercrime helpline 1930/i }).length).toBeGreaterThanOrEqual(1);

    // Main content slot
    expect(screen.getByTestId('test-content')).toBeInTheDocument();

    // Footer
    expect(screen.getByText(/this is an educational prototype demo/i)).toBeInTheDocument();
  });

  it('updates all shared shell labels immediately upon switching to Hindi', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AppShell>
          <div>Main Body</div>
        </AppShell>
      </MemoryRouter>
    );

    // Switch language to Hindi via the LanguageSelector dropdown
    const langButton = screen.getByRole('button', { name: /change application language/i });
    await user.click(langButton);

    const hindiOption = screen.getByRole('option', { name: /हिन्दी/i });
    await user.click(hindiOption);

    // Verify header, nav, emergency, and footer update to Hindi
    expect(screen.getAllByText('साइबर रक्षक').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /होम/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /रिपोर्ट शुरू करें/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /चैट सहायक/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /शिकायत ट्रैक करें/i })).toBeInTheDocument();
    expect(screen.getAllByText('1930 पर अभी कॉल करें').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('वित्तीय धोखाधड़ी?')).toBeInTheDocument();

    // Verify document.documentElement.lang is updated to Hindi
    expect(document.documentElement.lang).toBe('hi');
  });

  it('handles mobile navigation menu open, close via button toggle, and escape key', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AppShell>
          <div>Mobile Test Body</div>
        </AppShell>
      </MemoryRouter>
    );

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(menuButton).toBeInTheDocument();

    // Open mobile menu by clicking hamburger
    await user.click(menuButton);
    expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument();

    // Close mobile menu by clicking hamburger button again
    await user.click(menuButton);
    expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();

    // Re-open and test Escape key closes and restores focus
    await user.click(menuButton);
    expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
    expect(menuButton).toHaveFocus();
  });

  it('renders correctly when showEmergencyBanner is false and applies custom classNames', () => {
    render(
      <MemoryRouter>
        <AppShell showEmergencyBanner={false} className="custom-shell" mainClassName="custom-main">
          <div data-testid="custom-content">Content</div>
        </AppShell>
      </MemoryRouter>
    );

    expect(screen.queryByText(/financial fraud\?/i)).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveClass('custom-main');
  });
});
