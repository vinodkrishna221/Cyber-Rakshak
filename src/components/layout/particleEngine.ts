export interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

const SAFFRON_COLORS = [
  '#FF8F1F', // Base Saffron
  '#FF9F3F', // Lighter
  '#FF7F00', // Deeper orange
  '#F6B73C', // Amber
  '#FFA500', // Orange
];

export function createParticles(width: number, height: number, count: number): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 0.8, // Slow, ambient movement
      speedY: (Math.random() - 0.5) * 0.8,
      color: SAFFRON_COLORS[Math.floor(Math.random() * SAFFRON_COLORS.length)],
      opacity: Math.random() * 0.6 + 0.1, // Subtle opacity
    });
  }
  
  return particles;
}

export function updateParticles(particles: Particle[], width: number, height: number) {
  for (const p of particles) {
    p.x += p.speedX;
    p.y += p.speedY;

    // Wrap around screen
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
  }
}

export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    
    // Convert hex to rgb for opacity
    const hex = p.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
    ctx.fill();
  }
}
