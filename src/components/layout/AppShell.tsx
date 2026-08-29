import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CursorTrail } from './CursorTrail';
import { useTranslation } from '../../i18n';
import { createParticles, updateParticles, renderParticles, Particle } from './particleEngine';

export interface AppShellProps {
  children: React.ReactNode;
  showEmergencyBanner?: boolean;
  className?: string;
  mainClassName?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  showEmergencyBanner = true,
  className = '',
  mainClassName = '',
}) => {
  const { t, language } = useTranslation();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isChatPage = location.pathname === '/chat';

  const [headerVisible, setHeaderVisible] = useState<boolean>(!isHomePage);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  useEffect(() => {
    if (!isHomePage) {
      setHeaderVisible(true);
      return;
    }

    const checkScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      setHeaderVisible(scrollY > 40);
    };

    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, [isHomePage]);

  // Particle Engine initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Create more particles on larger screens
    const particleCount = width > 1024 ? 120 : 60;
    particlesRef.current = createParticles(width, height, particleCount);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      updateParticles(particlesRef.current, width, height);
      renderParticles(ctx, particlesRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col bg-paper-white text-deep-navy font-sans antialiased selection:bg-saffron/20 selection:text-deep-navy relative ${className}`}>
      
      {/* Base Canvas for Saffron Particles */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 w-full h-full pointer-events-none z-0" 
        aria-hidden="true" 
      />

      {/* Frosted Glass Blur Overlay */}
      <div className="fixed inset-0 backdrop-blur-[60px] bg-paper-white/50 pointer-events-none z-0"></div>

      {/* Saffron Cursor Trailing Effect */}
      <CursorTrail />

      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-saffron focus:px-4 focus:py-2 focus:font-bold focus:text-deep-navy focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-deep-navy"
      >
        {t.nav.skipToContent}
      </a>

      {/* Top Header Wrapper */}
      <div
        className={
          isHomePage
            ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${
                headerVisible
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-full opacity-0 pointer-events-none'
              }`
            : 'sticky top-0 z-50 relative'
        }
      >
        {/* Optional Top Emergency Banner */}
        {showEmergencyBanner && (
          <aside
            aria-label={t.emergency.ariaLabel}
            className="border-b border-alert-red/20 bg-red-50/90 text-deep-navy px-3.5 py-1.5 text-xs text-center sm:text-left shadow-2xs relative z-10"
          >
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4 px-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-alert-red uppercase tracking-wider text-[11px] bg-red-100/80 px-1.5 py-0.5 rounded border border-alert-red/30">
                  {t.emergency.bannerTitle}
                </span>
                <span className="text-xs text-ink/90 font-medium">
                  {t.emergency.bannerDescription}
                </span>
              </div>
              <a
                href="tel:1930"
                className="inline-flex items-center gap-1 font-bold text-alert-red hover:underline text-xs shrink-0 focus-visible:ring-1 focus-visible:ring-alert-red rounded px-1"
              >
                <span>{t.emergency.actionLabel}</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </aside>
        )}

        {/* Shared Header */}
        <Header topOffset={showEmergencyBanner ? 'top-10 sm:top-12' : 'top-4'} />
      </div>

      {/* Main Content Slot */}
      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-1 w-full relative z-10 flex flex-col ${
          isHomePage
            ? 'w-full max-w-none p-0 m-0 focus:outline-none'
            : isChatPage
            ? 'w-full max-w-none p-0 m-0 focus:outline-none'
            : 'max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-10 focus:outline-none'
        } ${mainClassName}`}
      >
        {children}
      </main>

      {!isChatPage && (
        <div className="relative z-10">
          <Footer />
        </div>
      )}
    </div>
  );
};
