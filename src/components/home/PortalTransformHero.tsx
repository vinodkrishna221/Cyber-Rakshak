import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  ChevronDown,
  Paperclip,
  Send,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Button } from '../ui/Button';
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

  const trackRef = useRef<HTMLDivElement | null>(null);

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
          className="relative w-full h-full overflow-hidden flex items-center justify-center"
          data-testid="browser-viewport-frame"
        >
          {/* Layer 1: Recreated Authentic Legacy Government Portal View (Full Screen) */}
          <div
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-start bg-white transition-opacity duration-75 pointer-events-none select-none z-20"
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
                className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-deep-navy/95 hover:bg-deep-navy text-white text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 pointer-events-auto cursor-pointer animate-bounce z-30"
                aria-label="Scroll down to experience Cyber Rakshak transformation"
              >
                <span>{t.home.badge}</span>
                <ChevronDown className="size-4 text-saffron" />
              </button>
            )}
          </div>

          {/* Layer 2: Cyber Rakshak Modern Portal UI (Smoothly revealed over the global background) */}
          <div
            className={`absolute inset-0 w-full h-full flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-auto transition-opacity duration-150 z-10 ${
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
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-8 mt-12">
      
      {/* Title Area */}
      <div className="text-center space-y-4 mb-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-deep-navy tracking-tight drop-shadow-sm">
          How can Rakshak AI help you today?
        </h1>
        <p className="text-lg sm:text-xl text-muted-text font-medium drop-shadow-sm">
          {t.common.brandTagline}
        </p>
      </div>

      {/* Main Chat Input (bolt.new style - light version) */}
      <div className="w-full max-w-3xl bg-white border border-black/5 rounded-2xl p-4 shadow-xl shadow-saffron/5 focus-within:ring-2 focus-within:ring-saffron/50 transition-all">
        <textarea
          className="w-full bg-transparent text-deep-navy placeholder-gray-400 text-lg resize-none outline-none min-h-[120px] p-2"
          placeholder="Tell us what happened in plain words (e.g. UPI fraud, suspicious link, blackmail)..."
        />
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
          <button className="p-2 rounded-full hover:bg-black/5 text-gray-400 hover:text-deep-navy transition-colors">
            <Paperclip className="size-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-deep-navy transition-colors px-2">
              <Bot className="size-4" />
              <span>Rakshak AI</span>
            </button>
            <button className="flex items-center gap-2 bg-saffron hover:bg-[#E67E17] text-white px-5 py-2.5 rounded-full font-bold transition-colors shadow-md">
              Start
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-white hover:bg-mist border border-black/5 shadow-md text-deep-navy transition-all hover:scale-105"
        >
          <div className="bg-saffron/10 p-2 rounded-lg">
            <ArrowRight className="size-5 text-saffron" />
          </div>
          <span className="font-bold text-sm">{t.home.startReportCta}</span>
        </button>

        <button 
          onClick={() => navigate('/track')}
          className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-white hover:bg-mist border border-black/5 shadow-md text-deep-navy transition-all hover:scale-105"
        >
          <div className="bg-saffron/10 p-2 rounded-lg">
            <Search className="size-5 text-saffron" />
          </div>
          <span className="font-bold text-sm">{t.home.trackComplaintCta}</span>
        </button>
      </div>

      <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 text-muted-text text-xs font-bold shadow-sm">
        <ShieldCheck className="size-4 text-saffron" aria-hidden="true" />
        <span>Secure & Encrypted • Official Portal</span>
      </div>
    </div>
  );
};
