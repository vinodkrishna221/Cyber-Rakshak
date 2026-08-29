import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useTranslation } from '../../i18n';

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

  // Header visibility on home page: hidden on landing (scrollY <= 40), slides down on scroll
  const [headerVisible, setHeaderVisible] = useState<boolean>(!isHomePage);

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

  return (
    <div className={`min-h-screen flex flex-col bg-paper-white text-deep-navy font-sans antialiased selection:bg-saffron/20 selection:text-deep-navy ${className}`}>
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
            ? `fixed top-0 left-0 right-0 z-40 transition-all duration-300 transform ${
                headerVisible
                  ? 'translate-y-0 opacity-100 shadow-md'
                  : '-translate-y-full opacity-0 pointer-events-none'
              }`
            : 'sticky top-0 z-40'
        }
      >
        {/* Optional Top Emergency Banner */}
        {showEmergencyBanner && (
          <aside
            aria-label={t.emergency.ariaLabel}
            className="border-b border-alert-red/20 bg-red-50/90 text-deep-navy px-3.5 py-1.5 text-xs text-center sm:text-left shadow-2xs"
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
        <Header />
      </div>

      {/* Main Content Slot */}
      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-1 w-full ${
          isHomePage ? 'w-full max-w-none p-0 m-0 focus:outline-none' : 'max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-10 focus:outline-none'
        } ${mainClassName}`}
      >
        {children}
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
};
