import { describe, it, expect, beforeEach } from 'vitest';
import { useLanguageStore } from './useLanguageStore';
import { translations } from './translations';
import { SUPPORTED_LANGUAGES, REGIONAL_LANGUAGES } from './languages';

describe('useLanguageStore and i18n dictionary', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
  });

  it('initializes with English as default language', () => {
    expect(useLanguageStore.getState().language).toBe('en');
  });

  it('switches language using setLanguage and updates documentElement lang', () => {
    useLanguageStore.getState().setLanguage('hi');
    expect(useLanguageStore.getState().language).toBe('hi');
    expect(document.documentElement.lang).toBe('hi');

    useLanguageStore.getState().setLanguage('en');
    expect(useLanguageStore.getState().language).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('toggles language between English and Hindi using toggleLanguage', () => {
    expect(useLanguageStore.getState().language).toBe('en');

    useLanguageStore.getState().toggleLanguage();
    expect(useLanguageStore.getState().language).toBe('hi');

    useLanguageStore.getState().toggleLanguage();
    expect(useLanguageStore.getState().language).toBe('en');
  });

  it('contains complete dictionary schema for all supported languages', () => {
    for (const lang of ['en', 'hi'] as const) {
      const dict = translations[lang];
      expect(dict).toBeDefined();
      expect(dict.common.brandName).toBeTruthy();
      expect(dict.common.assistantName).toBeTruthy();
      expect(dict.common.brandTagline).toBeTruthy();
      expect(dict.common.demoPrototype).toBeTruthy();
      expect(dict.common.comingSoon).toBeTruthy();

      expect(dict.nav.home).toBeTruthy();
      expect(dict.nav.startReport).toBeTruthy();
      expect(dict.nav.chat).toBeTruthy();
      expect(dict.nav.track).toBeTruthy();
      expect(dict.nav.skipToContent).toBeTruthy();

      expect(dict.emergency.pillLabel).toBeTruthy();
      expect(dict.emergency.bannerTitle).toBeTruthy();
      expect(dict.emergency.bannerDescription).toBeTruthy();
      expect(dict.emergency.helplineNumber).toBe('1930');

      expect(dict.buttons.startReport).toBeTruthy();
      expect(dict.buttons.trackComplaint).toBeTruthy();
      expect(dict.buttons.returnHome).toBeTruthy();
      expect(dict.buttons.call1930Now).toBeTruthy();

      expect(dict.footer.disclaimer).toBeTruthy();
      expect(dict.footer.nationalHelpline).toContain('1930');
    }
  });

  it('includes all 10 planned regional Indian languages marked as coming soon', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(2);
    expect(REGIONAL_LANGUAGES).toHaveLength(10);

    const regionalCodes = REGIONAL_LANGUAGES.map((l) => l.code);
    expect(regionalCodes).toEqual(
      expect.arrayContaining(['ta', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'or', 'as'])
    );

    REGIONAL_LANGUAGES.forEach((lang) => {
      expect(lang.available).toBe(false);
      expect(lang.nativeName).toBeTruthy();
    });
  });

  it('persists selected language to localStorage', () => {
    useLanguageStore.getState().setLanguage('hi');
    const stored = JSON.parse(localStorage.getItem('cyber-rakshak-language') || '{}');
    expect(stored.state?.language).toBe('hi');
  });

  it('safely defaults to English when an invalid language is passed to setLanguage', () => {
    // @ts-expect-error testing runtime resilience against invalid inputs
    useLanguageStore.getState().setLanguage('invalid_lang');
    expect(useLanguageStore.getState().language).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
