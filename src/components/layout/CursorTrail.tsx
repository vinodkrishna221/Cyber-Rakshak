import React, { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

const TRAIL_LENGTH = 14;
const SAFFRON_COLOR = '255, 143, 31'; // #FF8F1F

export const CursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const pointsRef = useRef<TrailPoint[]>([]);
  const isVisibleRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Check if user prefers reduced motion or is on touch device
    if (typeof window === 'undefined') return;
    
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize trail points
    pointsRef.current = Array.from({ length: TRAIL_LENGTH }, () => ({
      x: -100,
      y: -100,
      size: 0,
      opacity: 0,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      isVisibleRef.current = true;
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Render loop with smooth delay / lerp
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isVisibleRef.current) {
        const target = mousePosRef.current;
        const points = pointsRef.current;

        // Head lerp with smooth delay
        points[0].x += (target.x - points[0].x) * 0.35;
        points[0].y += (target.y - points[0].y) * 0.35;
        points[0].size = 7;
        points[0].opacity = 0.85;

        // Trailing points smoothly follow previous point with compounding delay
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];

          // Elastic lerp factor for trailing delay effect
          const lerpFactor = 0.28 - (i * 0.012);
          curr.x += (prev.x - curr.x) * Math.max(0.1, lerpFactor);
          curr.y += (prev.y - curr.y) * Math.max(0.1, lerpFactor);

          // Taper size and opacity towards the tail
          const progress = 1 - (i / points.length);
          curr.size = Math.max(1.5, 7 * Math.pow(progress, 1.2));
          curr.opacity = Math.max(0.05, 0.75 * Math.pow(progress, 1.5));
        }

        // Draw connecting fluid lines between points
        if (points.length > 1) {
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            if (p1.x > 0 && p2.x > 0) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${SAFFRON_COLOR}, ${p2.opacity * 0.6})`;
              ctx.lineWidth = p2.size * 1.5;
              ctx.lineCap = 'round';
              ctx.stroke();
            }
          }
        }

        // Draw glowing circles at each point
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (p.x > 0 && p.y > 0) {
            // Outer glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${SAFFRON_COLOR}, ${p.opacity * 0.3})`;
            ctx.fill();

            // Inner solid saffron dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${SAFFRON_COLOR}, ${p.opacity})`;
            ctx.fill();
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      aria-hidden="true"
      data-testid="cursor-trail-canvas"
    />
  );
};
