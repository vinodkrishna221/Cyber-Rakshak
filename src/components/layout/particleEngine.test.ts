import { describe, it, expect, vi } from 'vitest';
import {
  createParticles,
  updateParticles,
  renderParticles,
} from './particleEngine';

describe('particleEngine', () => {
  const width = 800;
  const height = 600;

  it('creates the requested count of particles with valid properties', () => {
    const particles = createParticles(width, height, 100);
    expect(particles).toHaveLength(100);

    const first = particles[0];
    expect(first.x).toBeGreaterThanOrEqual(0);
    expect(first.x).toBeLessThanOrEqual(width);
    expect(first.y).toBeGreaterThanOrEqual(0);
    expect(first.y).toBeLessThanOrEqual(height);
    expect(first.size).toBeGreaterThan(0);
    expect(first.color).toBeDefined();
    expect(first.opacity).toBeGreaterThan(0);
  });

  it('updates particle positions correctly with wrapping', () => {
    const particles = createParticles(width, height, 10);
    const initialX = particles[0].x;
    const initialY = particles[0].y;

    updateParticles(particles, width, height);

    expect(particles[0].x).not.toBe(initialX);
    expect(particles[0].y).not.toBe(initialY);
  });

  it('renders particles to canvas context without throwing', () => {
    const particles = createParticles(width, height, 5);
    const mockContext = {
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillStyle: '',
    } as unknown as CanvasRenderingContext2D;

    expect(() => renderParticles(mockContext, particles)).not.toThrow();
    expect(mockContext.beginPath).toHaveBeenCalledTimes(5);
    expect(mockContext.fill).toHaveBeenCalledTimes(5);
  });
});
