import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraMark } from './ChakraMark';

describe('ChakraMark component', () => {
  it('renders as an accessible image emblem', () => {
    render(<ChakraMark aria-label="Cyber Rakshak emblem" />);

    const emblem = screen.getByRole('img', { name: 'Cyber Rakshak emblem' });
    expect(emblem).toBeInTheDocument();
  });

  it('renders as decorative when aria-hidden is true', () => {
    const { container } = render(<ChakraMark aria-hidden="true" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders with shield icon and chakra spokes', () => {
    const { container } = render(<ChakraMark size="lg" />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });
});
