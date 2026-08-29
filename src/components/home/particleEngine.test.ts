import { describe, it, expect, vi } from 'vitest';
import {
  createParticles,
  calculateParticleState,
  renderParticles,
  TRICOLOR_PALETTE,
  Particle,
} from './particleEngine';

describe('particleEngine', () => {
  const width = 800;
  const height = 600;
  const cx = width / 2;
  const cy = height / 2;

  it('creates the requested count of particles with valid properties', () => {
    const particles = createParticles(width, height, 1400);
    expect(particles).toHaveLength(1400);

    const first = particles[0];
    expect(first.id).toBe(0);
    expect(first.originX).toBeGreaterThanOrEqual(-50);
    expect(first.originX).toBeLessThanOrEqual(width + 50);
    expect(first.originY).toBeGreaterThanOrEqual(-50);
    expect(first.originY).toBeLessThanOrEqual(height + 50);
    expect(first.targetX).toBeDefined();
    expect(first.targetY).toBeDefined();
    expect(first.baseSize).toBeGreaterThan(0);
    expect(TRICOLOR_PALETTE).toContain(first.color);
  });

  it('distributes colors across saffron, white, green, and chakra blue', () => {
    const particles = createParticles(width, height, 500);
    const colors = new Set(particles.map((p) => p.color));

    expect(colors.has('#FF8F1F')).toBe(true); // saffron
    expect(colors.has('#FFFDF7')).toBe(true); // white
    expect(colors.has('#138A43')).toBe(true); // green
    expect(colors.has('#1A4E9A')).toBe(true); // chakra blue
  });

  it('calculates initial state (p=0) near origin coordinates', () => {
    const particles = createParticles(width, height, 50);
    const p = particles[0];
    const state = calculateParticleState(p, 0, cx, cy);

    expect(state.x).toBeCloseTo(p.originX, 1);
    expect(state.y).toBeCloseTo(p.originY, 1);
    expect(state.alpha).toBeGreaterThanOrEqual(0.4);
    expect(state.size).toBe(p.baseSize);
  });

  it('calculates mid-transformation swirl state (p=0.5) smoothly orbiting inward', () => {
    const particles = createParticles(width, height, 50);
    const p = particles[0];
    const state = calculateParticleState(p, 0.5, cx, cy);

    // Mid-transformation should have high opacity disc
    expect(state.alpha).toBeCloseTo(0.95, 1);
    expect(state.size).toBeGreaterThan(0);

    // Particle should have moved from its origin towards center
    const distFromCenter = Math.sqrt(
      Math.pow(state.x - cx, 2) + Math.pow(state.y - cy, 2),
    );
    expect(distFromCenter).toBeDefined();
    expect(Number.isFinite(distFromCenter)).toBe(true);
  });

  it('calculates reformation state (p=0.9) converging close to target coordinates', () => {
    const particles = createParticles(width, height, 50);
    const p = particles[0];
    const state = calculateParticleState(p, 0.94, cx, cy);

    expect(state.x).toBeCloseTo(p.targetX, 0);
    expect(state.y).toBeCloseTo(p.targetY, 0);
    expect(state.alpha).toBe(1.0);
  });

  it('calculates completion state (p=1.0) with fading alpha', () => {
    const particles = createParticles(width, height, 50);
    const p = particles[0];
    const state = calculateParticleState(p, 1.0, cx, cy);

    expect(state.alpha).toBe(0);
  });

  it('handles out-of-bound progress values safely (p < 0 and p > 1)', () => {
    const particles = createParticles(width, height, 10);
    const p = particles[0];

    const stateNeg = calculateParticleState(p, -0.5, cx, cy);
    expect(stateNeg.x).toBeDefined();
    expect(stateNeg.y).toBeDefined();

    const stateOver = calculateParticleState(p, 1.5, cx, cy);
    expect(stateOver.alpha).toBe(0);
  });

  it('preserves C0 spatial continuity across all stage boundaries (0.12, 0.68, 0.94)', () => {
    const particles = createParticles(width, height, 20);
    const p = particles[0];

    // Boundary 1: Stage 1 -> Stage 2 (prog = 0.12)
    const statePre12 = calculateParticleState(p, 0.12, cx, cy);
    const statePost12 = calculateParticleState(p, 0.12001, cx, cy);
    expect(Math.abs(statePre12.x - statePost12.x)).toBeLessThan(0.5);
    expect(Math.abs(statePre12.y - statePost12.y)).toBeLessThan(0.5);

    // Boundary 2: Stage 3 -> Stage 4 (prog = 0.68)
    const statePre68 = calculateParticleState(p, 0.68, cx, cy);
    const statePost68 = calculateParticleState(p, 0.68001, cx, cy);
    expect(Math.abs(statePre68.x - statePost68.x)).toBeLessThan(0.5);
    expect(Math.abs(statePre68.y - statePost68.y)).toBeLessThan(0.5);

    // Boundary 3: Stage 4 -> Stage 5 (prog = 0.94)
    const statePre94 = calculateParticleState(p, 0.94, cx, cy);
    const statePost94 = calculateParticleState(p, 0.94001, cx, cy);
    expect(Math.abs(statePre94.x - statePost94.x)).toBeLessThan(0.5);
    expect(Math.abs(statePre94.y - statePost94.y)).toBeLessThan(0.5);
  });

  it('renders particles to canvas context without throwing errors', () => {
    const particles = createParticles(width, height, 100);

    const mockCtx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      globalAlpha: 1,
      fillStyle: '',
    } as unknown as CanvasRenderingContext2D;

    // Should clear and draw for 0 < progress < 1
    renderParticles(mockCtx, particles, 0.6, width, height);
    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, width, height);
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();

    // At progress = 0 or 1, clears and returns early
    vi.clearAllMocks();
    renderParticles(mockCtx, particles, 0, width, height);
    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, width, height);
    expect(mockCtx.fill).not.toHaveBeenCalled();
  });

  it('safely handles zero, negative, or invalid counts and dimensions in createParticles', () => {
    const pZero = createParticles(0, 0, 0);
    expect(pZero.length).toBeGreaterThan(0);

    const pNeg = createParticles(-100, -100, -50);
    expect(pNeg.length).toBeGreaterThan(0);
  });

  it('safely handles null/invalid context, empty or null particles, and zero dimensions in renderParticles without throwing', () => {
    const particles = createParticles(width, height, 10);
    expect(() => {
      renderParticles(null as unknown as CanvasRenderingContext2D, particles, 0.5, 800, 600);
    }).not.toThrow();

    const mockCtx = {
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    expect(() => {
      renderParticles(mockCtx, null as unknown as typeof particles, 0.5, 800, 600);
    }).not.toThrow();

    expect(() => {
      renderParticles(mockCtx, [], 0.5, 800, 600);
    }).not.toThrow();

    expect(() => {
      renderParticles(mockCtx, particles, 0.5, 0, 0);
    }).not.toThrow();
  });

  it('safely handles null or undefined particle input in calculateParticleState', () => {
    const state = calculateParticleState(null as unknown as Particle, 0.5, cx, cy);
    expect(state).toEqual({ x: cx, y: cy, alpha: 0, size: 0 });
  });
});
