import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Search,
  Bot,
  PhoneCall,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Button } from '../ui/Button';
import { ChakraMark } from '../ui/ChakraMark';
import { createParticles, renderParticles, Particle } from './particleEngine';
import { LegacyPortalView } from './LegacyPortalView';

interface PortalTransformHeroProps {
  initialProgress?: number;
}

export const PortalTransformHero: React.FC<PortalTransformHeroProps> = ({
  initialProgress = 0,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Progress state [0, 1]
  const [progress, setProgress] = useState<number>(initialProgress);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lastDimensionsRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const progressRef = useRef<number>(initialProgress);
  progressRef.current = progress;

  // Sync initialProgress prop if provided explicitly (e.g. for testing)
  useEffect(() => {
    if (initialProgress !== undefined) {
      setProgress(Math.max(0, Math.min(1, initialProgress)));
    }
  }, [initialProgress]);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
      };

      try {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } catch {
        mediaQuery.addListener?.(handleChange);
        return () => mediaQuery.removeListener?.(handleChange);
      }
    }
  }, []);

  // Initialize and resize canvas & particles
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) return;

    const rect = viewport.getBoundingClientRect();
    const width =
      Math.floor(rect.width) ||
      (typeof window !== 'undefined' && window.innerWidth
        ? window.innerWidth
        : 1200);
    const height = Math.floor(rect.height) || 600;

    if (width <= 0 || height <= 0) return;

    if (
      lastDimensionsRef.current.width !== width ||
      lastDimensionsRef.current.height !== height ||
      particlesRef.current.length === 0
    ) {
      lastDimensionsRef.current = { width, height };

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const count = width < 768 ? 800 : 1600;
      particlesRef.current = createParticles(width, height, count);
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (progressRef.current <= 0.05 || progressRef.current >= 0.95) {
        ctx.clearRect(0, 0, width, height);
      } else {
        renderParticles(ctx, particlesRef.current, progressRef.current, width, height);
      }
    }
  }, []);

  useEffect(() => {
    initCanvas();

    const handleResize = () => {
      initCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  // Render particles when progress updates
  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = lastDimensionsRef.current.width || viewport.getBoundingClientRect().width || 1200;
    const height = lastDimensionsRef.current.height || viewport.getBoundingClientRect().height || 600;

    if (progress <= 0.05 || progress >= 0.95) {
      ctx.clearRect(0, 0, width, height);
    } else {
      renderParticles(ctx, particlesRef.current, progress, width, height);
    }
  }, [progress, reducedMotion]);

  // Natural scroll-driven transformation
  useEffect(() => {
    if (reducedMotion) return;

    const handleScroll = () => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const windowHeight = window.innerHeight || 800;

      // Scroll distance to complete transformation
      const scrollDistance = windowHeight * 1.1;
      const currentScroll = -rect.top;

      // Deadzone threshold before transformation starts
      const startThreshold = 40;

      if (currentScroll <= startThreshold) {
        if (initialProgress === undefined || initialProgress === 0) {
          setProgress(0);
        }
      } else if (currentScroll >= scrollDistance) {
        setProgress(1);
      } else {
        const computed = (currentScroll - startThreshold) / (scrollDistance - startThreshold);
        setProgress(Math.max(0, Math.min(1, computed)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion, initialProgress]);

  // Smooth scroll helper for the indicator
  const handleScrollDown = () => {
    const track = trackRef.current;
    if (track) {
      const rect = track.getBoundingClientRect();
      const targetY = window.scrollY + rect.top + (window.innerHeight || 800) * 1.1;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  // Computed visual opacities
  const legacyOpacity = Math.max(0, 1 - progress * 2.2);
  const rakshakOpacity = Math.max(0, (progress - 0.65) * 2.85);
  const isResolved = progress >= 0.92;

  return (
    <div
      ref={trackRef}
      className="relative w-full h-[220vh]"
      data-testid="portal-transform-hero"
    >
      {/* Sticky Fullscreen Container */}
      <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Full-bleed Content Area */}
        <div
          ref={viewportRef}
          className="relative w-full h-full bg-[#002B49] overflow-hidden flex items-center justify-center"
          data-testid="browser-viewport-frame"
        >
          {/* Layer 1: Recreated Authentic Legacy Government Portal View (Full Screen) */}
          <div
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-start bg-[#002B49] transition-opacity duration-75 pointer-events-none select-none"
            style={{ opacity: legacyOpacity }}
            aria-hidden={legacyOpacity <= 0.05}
            data-testid="legacy-screenshot-layer"
          >
            <img
              src="/legacy-portal-clean.png"
              alt="National Cyber Crime Reporting Portal"
              className="w-full h-full object-contain object-top select-none pointer-events-none"
            />

            {/* Floating Scroll Prompt Indicator */}
            {progress < 0.15 && (
              <button
                type="button"
                onClick={handleScrollDown}
                className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-pill bg-deep-navy/95 hover:bg-deep-navy text-white text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 pointer-events-auto cursor-pointer animate-bounce z-30"
                aria-label="Scroll down to experience Cyber Rakshak transformation"
              >
                <span>{t.home.badge}</span>
                <ChevronDown className="size-4 text-saffron" />
              </button>
            )}
          </div>

          {/* Layer 2: Canvas Tricolor Particle Simulation (Only active while actively transforming) */}
          {!reducedMotion && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{
                opacity: progress > 0.05 && progress < 0.95 ? 1 : 0,
                display: progress > 0.05 && progress < 0.95 ? 'block' : 'none',
              }}
              data-testid="particle-canvas"
              aria-hidden="true"
            />
          )}

          {/* Layer 3: Cyber Rakshak Modern Portal UI (Smoothly revealed) */}
          <div
            className={`absolute inset-0 w-full h-full bg-paper-white flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-auto transition-opacity duration-150 z-20 ${
              isResolved ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{ opacity: rakshakOpacity }}
            aria-hidden={rakshakOpacity <= 0.05}
            inert={!isResolved}
            data-testid="cyber-rakshak-resolved-view"
          >
            <CyberRakshakResolvedContent
              t={t}
              navigate={navigate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface CyberRakshakResolvedContentProps {
  t: ReturnType<typeof useTranslation>['t'];
  navigate: ReturnType<typeof useNavigate>;
}

const CyberRakshakResolvedContent: React.FC<CyberRakshakResolvedContentProps> = ({
  t,
  navigate,
}) => {
  return (
    <div className="flex flex-col justify-center max-w-5xl mx-auto w-full gap-6 sm:gap-8 my-auto">
      {/* Brand Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-soft">
        <div className="flex items-center gap-3">
          <ChakraMark size="lg" aria-hidden="true" />
          <div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-chakra-blue block">
              {t.common.brandName}
            </span>
            <span className="text-base sm:text-xl font-extrabold text-deep-navy">
              {t.common.brandTagline}
            </span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="size-4 text-india-green" aria-hidden="true" />
          <span>{t.home.autoDraftedTag} • AI Ready</span>
        </div>
      </div>

      {/* Main Feature Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left Column: Reassuring message & Smart Detection */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-mist p-4 sm:p-5 rounded-2xl border border-border-soft space-y-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-chakra-blue text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="size-4.5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-chakra-blue uppercase tracking-wider">
                  {t.common.assistantName}
                </span>
                <p className="text-sm sm:text-base text-deep-navy font-semibold leading-relaxed">
                  {t.common.brandShortLine}
                </p>
              </div>
            </div>

            {/* Citizen Input Preview */}
            <div className="bg-white p-3.5 rounded-xl border border-border-soft text-xs sm:text-sm text-muted-text font-medium flex items-center justify-between gap-3 shadow-2xs">
              <span className="truncate italic">
                &ldquo;{t.transformHero.resolvedUserMsg}&rdquo;
              </span>
              <span className="text-[11px] bg-blue-50 text-chakra-blue font-bold px-2.5 py-1 rounded-md shrink-0">
                {t.transformHero.resolvedSmartTag}
              </span>
            </div>
          </div>

          {/* Key Advantages */}
          <div className="grid grid-cols-2 gap-2.5 text-xs text-deep-navy font-medium">
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-border-soft shadow-2xs">
              <CheckCircle2 className="size-4 text-india-green shrink-0" />
              <span className="truncate">{t.transformHero.resolvedPoint1}</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-border-soft shadow-2xs">
              <CheckCircle2 className="size-4 text-india-green shrink-0" />
              <span className="truncate">{t.transformHero.resolvedPoint2}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Instant CTAs */}
        <div className="md:col-span-5 flex flex-col gap-3 bg-gradient-to-br from-blue-50/80 via-white to-amber-50/50 p-5 rounded-2xl border border-chakra-blue/25 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-chakra-blue">
            {t.transformHero.rakshakBadge}
          </span>
          <p className="text-xs sm:text-sm text-muted-text leading-relaxed font-normal">
            {t.transformHero.resolvedCtaDesc}
          </p>

          <div className="flex flex-col gap-2.5 mt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              rightIcon={<ArrowRight className="size-4.5" aria-hidden="true" />}
              className="w-full shadow-sm text-sm font-bold"
            >
              {t.home.startReportCta}
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/track')}
              leftIcon={<Search className="size-4 text-chakra-blue" aria-hidden="true" />}
              className="w-full bg-white text-xs font-semibold"
            >
              {t.home.trackComplaintCta}
            </Button>
          </div>
        </div>
      </div>

      {/* Emergency Golden Hour Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs sm:text-sm text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <PhoneCall className="size-4 text-alert-red shrink-0" aria-hidden="true" />
          <span className="font-semibold truncate">
            {t.home.goldenHourHint}
          </span>
        </div>
        <a
          href="tel:1930"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-pill bg-alert-red text-white text-xs sm:text-sm font-bold hover:bg-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 shrink-0"
          aria-label={t.emergency.ariaLabel}
        >
          {t.emergency.pillLabel}
        </a>
      </div>
    </div>
  );
};
