import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Emergency1930Pill } from './Emergency1930Pill';
import { useLanguageStore } from '../../i18n';

describe('Emergency1930Pill component', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
  });

  it('renders default English text and link to tel:1930', () => {
    render(<Emergency1930Pill />);

    const link = screen.getByRole('link', { name: /call national cybercrime helpline 1930/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'tel:1930');
    expect(screen.getByText('Call 1930 now')).toBeInTheDocument();
  });

  it('updates label automatically when language changes to Hindi', () => {
    const { rerender } = render(<Emergency1930Pill />);
    expect(screen.getByText('Call 1930 now')).toBeInTheDocument();

    act(() => {
      useLanguageStore.getState().setLanguage('hi');
    });
    rerender(<Emergency1930Pill />);

    expect(screen.getByText('1930 पर अभी कॉल करें')).toBeInTheDocument();
  });

  it('accepts custom label override', () => {
    render(<Emergency1930Pill customLabel="Emergency Helpline 1930" />);
    expect(screen.getAllByText('Emergency Helpline 1930').length).toBeGreaterThanOrEqual(1);
  });

  it('applies variant classes and pulse animation', () => {
    const { rerender } = render(<Emergency1930Pill variant="saffron" pulse />);
    let link = screen.getByRole('link', { name: /call national cybercrime helpline 1930/i });
    expect(link.className).toContain('bg-saffron');
    expect(link.className).toContain('animate-pulse');

    rerender(<Emergency1930Pill variant="outline" />);
    link = screen.getByRole('link', { name: /call national cybercrime helpline 1930/i });
    expect(link.className).toContain('border-alert-red');
  });
});
