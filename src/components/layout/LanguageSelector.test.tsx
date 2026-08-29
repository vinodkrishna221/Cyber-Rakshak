import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from './LanguageSelector';
import { useLanguageStore } from '../../i18n';

describe('LanguageSelector component', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
  });

  it('renders with current language label and collapsed dropdown', () => {
    render(<LanguageSelector />);

    const button = screen.getByRole('button', { name: /change application language/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('opens dropdown on click, displays available languages and coming soon regional languages', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const button = screen.getByRole('button', { name: /change application language/i });
    await user.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Check English and Hindi options
    expect(screen.getByRole('option', { name: /English/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /हिन्दी/i })).toBeInTheDocument();

    // Check that regional languages are shown with "Coming soon"
    expect(screen.getByText('தமிழ்')).toBeInTheDocument();
    expect(screen.getByText('తెలుగు')).toBeInTheDocument();
    expect(screen.getByText('বাংলা')).toBeInTheDocument();
    expect(screen.getAllByText('Coming soon').length).toBeGreaterThanOrEqual(10);
  });

  it('switches active language when user selects Hindi', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const triggerButton = screen.getByRole('button', { name: /change application language/i });
    await user.click(triggerButton);

    const hindiOption = screen.getByRole('option', { name: /हिन्दी/i });
    await user.click(hindiOption);

    expect(useLanguageStore.getState().language).toBe('hi');
  });

  it('closes dropdown when Escape key is pressed and restores focus', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const triggerButton = screen.getByRole('button', { name: /change application language/i });
    await user.click(triggerButton);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(triggerButton).toHaveFocus();
  });

  it('supports arrow key navigation between language options', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const triggerButton = screen.getByRole('button', { name: /change application language/i });
    await user.click(triggerButton);

    const englishOption = screen.getByRole('option', { name: /English/i });
    const hindiOption = screen.getByRole('option', { name: /हिन्दी/i });

    // English starts focused on open when active
    await user.keyboard('{ArrowDown}');
    expect(hindiOption).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(englishOption).toHaveFocus();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <LanguageSelector />
        <button type="button">Outside Element</button>
      </div>
    );

    const triggerButton = screen.getByRole('button', { name: /change application language/i });
    await user.click(triggerButton);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const outsideButton = screen.getByRole('button', { name: 'Outside Element' });
    await user.click(outsideButton);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
