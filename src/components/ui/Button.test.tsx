import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button component', () => {
  it('renders with children and default primary variant', () => {
    render(<Button>Start Report</Button>);

    const button = screen.getByRole('button', { name: 'Start Report' });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('bg-saffron');
    expect(button.className).toContain('text-deep-navy');
  });

  it('applies secondary, emergency, outline, and ghost variant classes', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    let button = screen.getByRole('button', { name: 'Secondary' });
    expect(button.className).toContain('border-chakra-blue');
    expect(button.className).toContain('text-chakra-blue');

    rerender(<Button variant="emergency">Emergency</Button>);
    button = screen.getByRole('button', { name: 'Emergency' });
    expect(button.className).toContain('bg-alert-red');
    expect(button.className).toContain('text-white');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: 'Outline' });
    expect(button.className).toContain('border-border-soft');

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: 'Ghost' });
    expect(button.className).toContain('bg-transparent');
  });

  it('supports sizes sm, md, lg, and pill', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button', { name: 'Small' });
    expect(button.className).toContain('text-xs');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: 'Large' });
    expect(button.className).toContain('text-base');

    rerender(<Button size="pill">Pill</Button>);
    button = screen.getByRole('button', { name: 'Pill' });
    expect(button.className).toContain('rounded-pill');
  });

  it('triggers onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click Me</Button>);
    const button = screen.getByRole('button', { name: 'Click Me' });

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables interactions and prevents click when disabled or loading', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    const { rerender } = render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();

    rerender(
      <Button isLoading onClick={handleClick}>
        Loading
      </Button>
    );
    const loadingButton = screen.getByRole('button', { name: 'Loading' });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');
  });

  it('renders left and right icons when provided', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">←</span>}
        rightIcon={<span data-testid="right-icon">→</span>}
      >
        With Icons
      </Button>
    );

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
