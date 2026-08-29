export interface Particle {
  id: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  baseSize: number;
  color: string;
  angle0: number;
  radius0: number;
  radiusTarget: number;
  omega: number;
  burstDist: number;
  jitterX: number;
  jitterY: number;
}

export const TRICOLOR_PALETTE = [
  '#FF8F1F', // Saffron
  '#FFFDF7', // Paper White
  '#138A43', // India Green
  '#1A4E9A', // Chakra Blue
];

/**
 * Generates target coordinates forming a Chakra Shield mark at center (cx, cy)
 */
function generateShieldTarget(
  index: number,
  total: number,
  cx: number,
  cy: number,
  scale: number,
): { x: number; y: number } {
  const safeTotal = Math.max(1, total);
  const ratio = (index % safeTotal) / safeTotal;

  if (ratio < 0.35) {
    // Outer shield contour (shield polygon)
    const t = (ratio / 0.35) * Math.PI * 2;
    // Parametric shield curve
    const width = 80 * scale;
    const height = 95 * scale;
    const shieldX = Math.sin(t) * width * (1 + 0.15 * Math.sin(t));
    const shieldY = -Math.cos(t) * height * (t > Math.PI ? 1.2 : 0.9);
    return { x: cx + shieldX, y: cy + shieldY };
  } else if (ratio < 0.65) {
    // Ashoka Chakra outer ring
    const t = ((ratio - 0.35) / 0.3) * Math.PI * 2;
    const chakraRadius = 42 * scale;
    return {
      x: cx + Math.cos(t) * chakraRadius,
      y: cy + Math.sin(t) * chakraRadius,
    };
  } else if (ratio < 0.88) {
    // 24 Spokes radiating from center
    const spokeIndex = Math.floor(((ratio - 0.65) / 0.23) * 24);
    const spokeAngle = (spokeIndex / 24) * Math.PI * 2;
    const spokeDist = ((((ratio - 0.65) / 0.23) * 24) % 1) * 38 * scale;
    return {
      x: cx + Math.cos(spokeAngle) * spokeDist,
      y: cy + Math.sin(spokeAngle) * spokeDist,
    };
  } else {
    // Central Chakra hub & protective aura particles
    const t = ((ratio - 0.88) / 0.12) * Math.PI * 2;
    const hubRadius = 12 * scale * Math.sqrt(Math.random());
    return {
      x: cx + Math.cos(t) * hubRadius,
      y: cy + Math.sin(t) * hubRadius,
    };
  }
}

/**
 * Initializes particles distributed across width x height canvas
 */
export function createParticles(
  width: number,
  height: number,
  count: number = 1400,
): Particle[] {
  const particles: Particle[] = [];
  const safeCount = Math.max(1, Math.floor(count) || 1400);
  const safeWidth = Math.max(1, Math.floor(width) || 800);
  const safeHeight = Math.max(1, Math.floor(height) || 500);

  const cx = safeWidth / 2;
  const cy = safeHeight / 2;
  const scale = Math.max(0.6, Math.min(safeWidth, safeHeight) / 450);

  const cols = Math.max(1, Math.ceil(Math.sqrt((safeCount * safeWidth) / safeHeight)));
  const rows = Math.max(1, Math.ceil(safeCount / cols));
  const stepX = safeWidth / cols;
  const stepY = safeHeight / rows;

  for (let i = 0; i < safeCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const originX = col * stepX + (Math.random() - 0.5) * stepX * 0.8;
    const originY = row * stepY + (Math.random() - 0.5) * stepY * 0.8;

    const target = generateShieldTarget(i, safeCount, cx, cy, scale);

    const dx0 = originX - cx;
    const dy0 = originY - cy;
    const radius0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);
    const angle0 = Math.atan2(dy0, dx0);

    const dxt = target.x - cx;
    const dyt = target.y - cy;
    const radiusTarget = Math.sqrt(dxt * dxt + dyt * dyt);

    // Pick tricolor palette with weighted distribution
    // 35% saffron, 25% white, 25% green, 15% chakra blue
    const rand = Math.random();
    let color: string;
    if (rand < 0.35) color = TRICOLOR_PALETTE[0]; // saffron
    else if (rand < 0.60) color = TRICOLOR_PALETTE[1]; // white
    else if (rand < 0.85) color = TRICOLOR_PALETTE[2]; // green
    else color = TRICOLOR_PALETTE[3]; // chakra blue

    particles.push({
      id: i,
      originX,
      originY,
      targetX: target.x,
      targetY: target.y,
      baseSize: 1.8 + Math.random() * 2.2,
      color,
      angle0,
      radius0,
      radiusTarget,
      omega: 1.8 + Math.random() * 2.2, // angular swirl speed
      burstDist: (Math.random() - 0.5) * 60 * scale,
      jitterX: (Math.random() - 0.5) * 20,
      jitterY: (Math.random() - 0.5) * 20,
    });
  }

  return particles;
}

/**
 * Calculates current (x, y, alpha, size) for a particle at progress p in [0, 1]
 */
export function calculateParticleState(
  p: Particle,
  progress: number,
  cx: number,
  cy: number,
): { x: number; y: number; alpha: number; size: number } {
  if (!p) {
    return { x: cx, y: cy, alpha: 0, size: 0 };
  }

  // Clamp progress between 0 and 1
  const prog = Math.max(0, Math.min(1, progress));

  if (prog <= 0.12) {
    // Stage 1: Initial break / gentle jitter
    const t = prog / 0.12;
    const x = p.originX + p.jitterX * t;
    const y = p.originY + p.jitterY * t;
    const alpha = Math.min(1, 0.4 + t * 0.6);
    const size = p.baseSize;
    return { x, y, alpha, size };
  } else if (prog <= 0.68) {
    // Stage 2 & 3: Disintegration & Inward Vortex Swirl
    const t = (prog - 0.12) / 0.56; // 0 to 1
    // Radius smoothly interpolates from radius0 to radiusTarget
    const currentRadius =
      p.radius0 * (1 - t) +
      p.radiusTarget * t +
      Math.sin(t * Math.PI) * p.burstDist;

    // Angle spins in spiral towards center
    const currentAngle = p.angle0 + t * Math.PI * 3.5 * p.omega;

    // Jitter smoothly decays as swirl accelerates to maintain C0 continuity
    const jitterDecay = Math.max(0, 1 - t * 3);
    const x = cx + Math.cos(currentAngle) * currentRadius + p.jitterX * jitterDecay;
    const y = cy + Math.sin(currentAngle) * currentRadius + p.jitterY * jitterDecay;
    const alpha = 0.95;
    const size = p.baseSize * (1 + 0.4 * Math.sin(t * Math.PI));
    return { x, y, alpha, size };
  } else if (prog <= 0.94) {
    // Stage 4: Reformation into Chakra shield target
    const t = (prog - 0.68) / 0.26; // 0 to 1
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    // Swirl end point
    const swirlEndAngle = p.angle0 + Math.PI * 3.5 * p.omega;
    const swirlEndX = cx + Math.cos(swirlEndAngle) * p.radiusTarget;
    const swirlEndY = cy + Math.sin(swirlEndAngle) * p.radiusTarget;

    const x = swirlEndX * (1 - ease) + p.targetX * ease;
    const y = swirlEndY * (1 - ease) + p.targetY * ease;
    const alpha = 1.0;
    const size = p.baseSize * (1.2 - 0.2 * ease);
    return { x, y, alpha, size };
  } else {
    // Stage 5: Blossom outward & gentle fade as UI resolves
    const t = (prog - 0.94) / 0.06; // 0 to 1
    const blastAngle = Math.atan2(p.targetY - cy, p.targetX - cx);
    const x = p.targetX + Math.cos(blastAngle) * t * 25;
    const y = p.targetY + Math.sin(blastAngle) * t * 25;
    const alpha = Math.max(0, 1 - t * 1.2);
    const size = p.baseSize * (1 + t * 0.5);
    return { x, y, alpha, size };
  }
}

/**
 * Draws all particles onto the given canvas context
 */
export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  progress: number,
  width: number,
  height: number,
): void {
  if (!ctx || width <= 0 || height <= 0) return;
  ctx.clearRect(0, 0, width, height);

  if (!particles || !particles.length || progress <= 0.05 || progress >= 0.98) {
    return;
  }

  const cx = width / 2;
  const cy = height / 2;

  // Add subtle center glow during swirl and reformation
  if (progress > 0.4 && progress < 0.96) {
    const glowProgress =
      progress < 0.8
        ? (progress - 0.4) / 0.4
        : 1 - (progress - 0.8) / 0.16;
    const glowRadius = Math.max(20, Math.min(width, height) * 0.22);
    const gradient = ctx.createRadialGradient(
      cx,
      cy,
      5,
      cx,
      cy,
      glowRadius,
    );
    gradient.addColorStop(0, `rgba(26, 78, 154, ${0.25 * glowProgress})`);
    gradient.addColorStop(0.5, `rgba(255, 143, 31, ${0.15 * glowProgress})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const { x, y, alpha, size } = calculateParticleState(p, progress, cx, cy);

    if (alpha <= 0 || size <= 0) continue;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;

    // Draw particle disc
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1.0;
}
