import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useTranslation, TranslationSchema } from '../i18n';

type PlaceholderPageProps = {
  titleKey?: keyof TranslationSchema['placeholders'];
  title?: string;
  route: string;
};

export function PlaceholderPage({ titleKey, title, route }: PlaceholderPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const displayTitle = (titleKey && t.placeholders[titleKey]) || title || '';

  return (
    <section
      aria-labelledby="page-title"
      className="rounded-lg border border-border-soft bg-white p-6 shadow-2xs sm:p-10"
    >
      <p className="mb-2 text-xs font-bold tracking-wider text-chakra-blue uppercase">
        {t.common.brandName} • {t.common.demoPrototype}
      </p>
      <h1 id="page-title" className="text-2xl font-bold tracking-tight text-deep-navy sm:text-3xl">
        {displayTitle}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-text">
        {t.placeholders.routeReadyText.replace('{route}', route)}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/')}
        >
          {t.buttons.returnHome}
        </Button>
      </div>
    </section>
  );
}

