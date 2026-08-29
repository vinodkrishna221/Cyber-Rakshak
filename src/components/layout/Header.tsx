import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LogIn, MessageSquare, Search, Menu, X } from 'lucide-react';
import { ChakraMark } from '../ui/ChakraMark';
import { DemoBadge } from '../ui/DemoBadge';
import { Emergency1930Pill } from '../ui/Emergency1930Pill';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../../i18n';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const navItems = [
    { to: '/', label: t.nav.home, icon: Home },
    { to: '/login', label: t.nav.startReport, icon: LogIn },
    { to: '/chat', label: t.nav.chat, icon: MessageSquare },
    { to: '/track', label: t.nav.track, icon: Search },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle Escape key for mobile menu and restore focus to trigger
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Handle outside clicks for mobile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-soft bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3.5 py-2.5 sm:px-6 sm:py-3.5">
        {/* Brand logo and Mark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="group flex items-center gap-2 sm:gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2"
            aria-label={`${t.common.brandName} - ${t.common.brandTagline}`}
          >
            <ChakraMark size="md" aria-hidden="true" className="transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-sm xs:text-base sm:text-lg font-bold tracking-tight text-deep-navy group-hover:text-chakra-blue transition-colors leading-tight">
                {t.common.brandName}
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted-text font-medium leading-none hidden xs:inline-block">
                {t.common.assistantName}
              </span>
            </div>
          </Link>

          {/* Demo Badge */}
          <div className="hidden md:flex items-center">
            <DemoBadge size="sm" />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav
          aria-label={t.nav.mainNavAria}
          className="hidden lg:flex items-center gap-1 text-sm font-medium"
        >
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-chakra-blue font-semibold'
                    : 'text-deep-navy hover:bg-mist hover:text-chakra-blue'
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions (Emergency Pill, Language Selector, Mobile Menu button) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Emergency 1930 Pill */}
          <div className="flex items-center">
            <Emergency1930Pill size="md" />
          </div>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Mobile menu hamburger button */}
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
            className="flex lg:hidden items-center justify-center rounded-md p-2 text-deep-navy hover:bg-mist border border-border-soft focus-visible:ring-2 focus-visible:ring-saffron"
          >
            {mobileMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          ref={menuRef}
          className="lg:hidden border-t border-border-soft bg-white px-4 pt-3 pb-4 shadow-lg animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border-soft mb-3">
            <DemoBadge size="sm" />
            <span className="text-xs text-muted-text">{t.common.officialHelperNote}</span>
          </div>

          <nav aria-label={t.nav.mainNavAria} className="flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-chakra-blue font-bold'
                      : 'text-deep-navy hover:bg-mist'
                  }`}
                >
                  <Icon className="size-4 shrink-0 text-chakra-blue" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
