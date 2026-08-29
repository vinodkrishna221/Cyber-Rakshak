import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { CursorTrail } from './CursorTrail';

describe('CursorTrail Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders canvas element on non-touch devices', () => {
    const { getByTestId } = render(<CursorTrail />);
    const canvas = getByTestId('cursor-trail-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('pointer-events-none');
    expect(canvas).toHaveClass('fixed');
  });

  it('handles mouse move and leave events cleanly', () => {
    const { getByTestId } = render(<CursorTrail />);
    const canvas = getByTestId('cursor-trail-canvas');
    expect(canvas).toBeInTheDocument();

    fireEvent.mouseMove(window, { clientX: 150, clientY: 200 });
    fireEvent.mouseLeave(document);
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<CursorTrail />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });
});
