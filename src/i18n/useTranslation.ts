import { useLanguageStore } from './useLanguageStore';
import { translations } from './translations';
import { TranslationSchema } from './types';

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  const t: TranslationSchema = translations[language] || translations.en;

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    translations,
  };
}
