import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SupportedLanguage } from './types';

interface LanguageState {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language: SupportedLanguage) => {
        const validLang = language === 'hi' ? 'hi' : 'en';
        if (typeof document !== 'undefined') {
          document.documentElement.lang = validLang;
        }
        set({ language: validLang });
      },
      toggleLanguage: () =>
        set((state) => {
          const next = state.language === 'en' ? 'hi' : 'en';
          if (typeof document !== 'undefined') {
            document.documentElement.lang = next;
          }
          return { language: next };
        }),
    }),
    {
      name: 'cyber-rakshak-language',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.language !== 'en' && state.language !== 'hi') {
            state.language = 'en';
          }
          if (typeof document !== 'undefined') {
            document.documentElement.lang = state.language;
          }
        }
      },
    },
  ),
);
