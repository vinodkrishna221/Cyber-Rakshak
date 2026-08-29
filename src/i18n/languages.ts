import { LanguageOption, SupportedLanguage } from './types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    available: true,
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    available: true,
  },
];

export const REGIONAL_LANGUAGES: LanguageOption[] = [
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    available: false,
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    available: false,
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    available: false,
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    available: false,
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    available: false,
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    available: false,
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    available: false,
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    available: false,
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    available: false,
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    available: false,
  },
];

export const ALL_LANGUAGES: LanguageOption[] = [
  ...SUPPORTED_LANGUAGES,
  ...REGIONAL_LANGUAGES,
];

export const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.some((l) => l.code === lang);
};
