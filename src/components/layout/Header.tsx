import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LogIn, MessageSquare, Search, Menu, X } from 'lucide-react';
import { ChakraMark } from '../ui/ChakraMark';
import { DemoBadge } from '../ui/DemoBadge';
import { Emergency1930Pill } from '../ui/Emergency1930Pill';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../../i18n';
import { motion } from 'motion/react';

export interface HeaderProps {
  topOffset?: string;
}

export const Header: React.FC<HeaderProps> = ({
  topOffset = 'top-4',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const isChatPage = location.pathname === '/chat';
  const shouldCollapse = isChatPage && !isHeaderHovered && !mobileMenuOpen;

  const navItems = [
    { to: '/', label: t.nav.home, icon: Home },
    { to: '/login', label: t.nav.startReport, icon: LogIn },
    { to: '/chat', label: t.nav.chat, icon: MessageSquare },
    { to: '/track', label: t.nav.track, icon: Search },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <>
      <header
        className={`fixed ${topOffset} left-1/2 -translate-x-1/2 z-50 w-full max-w-[1200px] px-2 sm:px-4 pointer-events-none transition-all duration-300 ${
          shouldCollapse ? 'max-w-fit' : ''
        }`}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <div className="mx-auto flex items-center justify-between gap-4 lg:gap-6 px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-black/10 bg-white/70 backdrop-blur-xl shadow-lg pointer-events-auto transition-all duration-300">
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
                <span className="text-sm xs:text-base font-bold tracking-tight text-deep-navy group-hover:text-saffron transition-colors leading-tight whitespace-nowrap">
                  {t.common.brandName}
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-text font-medium leading-none hidden xs:inline-block whitespace-nowrap">
                  {t.common.assistantName}
                </span>
              </div>
            </Link>

            {/* Demo Badge */}
            <div className={`hidden md:flex items-center transition-opacity duration-300 ${shouldCollapse ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              <DemoBadge size="sm" />
            </div>
          </div>

          {/* Desktop Navigation with Elastic Animations */}
          <nav
            aria-label={t.nav.mainNavAria}
            className={`lg:flex items-center gap-2 text-sm font-semibold shrink-0 transition-all duration-300 overflow-hidden ${
              shouldCollapse ? 'hidden opacity-0 max-w-0' : 'hidden lg:flex opacity-100 max-w-2xl'
            }`}
            onMouseLeave={() => setHoveredPath(null)}
          >
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onMouseEnter={() => setHoveredPath(to)}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 transition-colors z-10 whitespace-nowrap ${
                    isActive ? 'text-saffron' : 'text-deep-navy hover:text-saffron'
                  }`}
                >
                  {hoveredPath === to && (
                    <motion.div
                      layoutId="header-hover"
                      className="absolute inset-0 bg-black/5 rounded-full -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="header-active"
                      className="absolute inset-0 bg-saffron/10 border border-saffron/20 rounded-full -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions (Language Selector, Emergency Pill, Mobile Menu button) */}
          <div className={`flex items-center gap-2 sm:gap-3 shrink-0 transition-all duration-300 overflow-hidden ${
              shouldCollapse ? 'hidden opacity-0 max-w-0' : 'opacity-100 max-w-sm'
            }`}>
            {/* Language Selector */}
            <LanguageSelector />

            {/* Emergency 1930 Pill */}
            <div className="flex items-center">
              <Emergency1930Pill size="md" />
            </div>

            {/* Mobile menu hamburger button */}
            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
              className="flex lg:hidden items-center justify-center rounded-full p-2 text-deep-navy hover:bg-black/5 border border-border-soft focus-visible:ring-2 focus-visible:ring-saffron"
            >
              {mobileMenuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          ref={menuRef}
          className="lg:hidden fixed top-[80px] left-4 right-4 z-40 rounded-2xl border border-black/10 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-3">
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
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-saffron/10 text-saffron border border-saffron/20 font-bold'
                      : 'text-deep-navy hover:bg-black/5'
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
};
