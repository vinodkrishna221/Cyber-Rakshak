import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import {
  useTranslation,
  SUPPORTED_LANGUAGES,
  REGIONAL_LANGUAGES,
  SupportedLanguage,
} from '../../i18n';

export interface LanguageSelectorProps {
  className?: string;
  variant?: 'header' | 'compact' | 'footer';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleFocusOut(event: FocusEvent) {
      if (
        dropdownRef.current &&
        event.relatedTarget &&
        !dropdownRef.current.contains(event.relatedTarget as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('focusout', handleFocusOut);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [isOpen]);

  // Focus active option on open
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isOpen) {
      const activeIndex = SUPPORTED_LANGUAGES.findIndex((l) => l.code === language);
      const targetIndex = activeIndex >= 0 ? activeIndex : 0;
      timer = setTimeout(() => {
        optionRefs.current[targetIndex]?.focus();
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, language]);

  // Handle escape and arrow keys
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      const activeElement = document.activeElement;
      const currentIndex = optionRefs.current.findIndex((ref) => ref === activeElement);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = currentIndex < SUPPORTED_LANGUAGES.length - 1 ? currentIndex + 1 : 0;
        optionRefs.current[nextIndex]?.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : SUPPORTED_LANGUAGES.length - 1;
        optionRefs.current[prevIndex]?.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        optionRefs.current[0]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        optionRefs.current[SUPPORTED_LANGUAGES.length - 1]?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
    SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left ${className}`}
    >
      <button
        ref={triggerRef}
        id="language-selector-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'language-listbox' : undefined}
        aria-label={t.language.changeLanguageAria}
        className={`inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-xs font-semibold text-deep-navy shadow-2xs hover:bg-mist hover:border-saffron/40 focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-1 transition-colors cursor-pointer ${
          variant === 'compact' ? 'px-2.5 py-1 text-xs' : ''
        }`}
      >
        <Globe
          className="size-3.5 text-chakra-blue shrink-0"
          aria-hidden="true"
        />
        <span className="font-medium hidden xs:inline">
          {activeLangOption.nativeName}
        </span>
        <span className="font-semibold xs:hidden uppercase text-[11px]">
          {activeLangOption.code === 'hi' ? 'हिन्दी' : 'EN'}
        </span>
        <ChevronDown
          className={`size-3 text-muted-text transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id="language-listbox"
          role="listbox"
          aria-labelledby="language-selector-button"
          aria-label={t.language.selectLanguage}
          className="absolute right-0 z-50 mt-1.5 w-64 origin-top-right rounded-md border border-border-soft bg-white p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none max-h-80 overflow-y-auto"
        >
          {/* Active languages section */}
          <div className="px-2 py-1 text-[11px] font-bold tracking-wider text-muted-text uppercase">
            {t.language.activeLanguage}
          </div>
          <div className="space-y-0.5" role="group" aria-label={t.language.activeLanguage}>
            {SUPPORTED_LANGUAGES.map((lang, idx) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  ref={(el) => {
                    optionRefs.current[idx] = el;
                  }}
                  id={`language-option-${lang.code}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => handleSelectLanguage(lang.code as SupportedLanguage)}
                  className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer focus:bg-blue-50 focus:text-chakra-blue focus:outline-none ${
                    isSelected
                      ? 'bg-blue-50 text-chakra-blue font-bold'
                      : 'text-deep-navy hover:bg-mist'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{lang.nativeName}</span>
                    <span className="text-[11px] text-muted-text">({lang.name})</span>
                  </span>
                  {isSelected && (
                    <Check
                      className="size-4 text-chakra-blue shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-1.5 border-t border-border-soft" />

          {/* Regional languages (coming soon) */}
          <div className="px-2 py-1 text-[11px] font-bold tracking-wider text-muted-text uppercase flex items-center justify-between">
            <span>{t.language.regionalLanguagesHeader}</span>
          </div>
          <div className="space-y-0.5" role="group" aria-label={t.language.regionalLanguagesHeader}>
            {REGIONAL_LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                role="option"
                aria-disabled="true"
                aria-selected="false"
                className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs text-muted-text/70 opacity-70 select-none cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-[11px]">({lang.name})</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded-sm border border-slate-200">
                  {t.common.comingSoon}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
