import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n';
import { Button } from '../components/ui/Button';
import { PortalTransformHero } from '../components/home/PortalTransformHero';
import { BeforeAfterPortalCard } from '../components/home/BeforeAfterPortalCard';
import { TrustCuesSection } from '../components/home/TrustCuesSection';
import { EmergencyBanner } from '../components/home/EmergencyBanner';
import { WorkflowStepsSection } from '../components/home/WorkflowStepsSection';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full">
      {/* Primary Scroll-Driven Transformation Hero (Starts with Legacy Portal UI - Full-bleed window size) */}
      <section aria-label="Portal transformation hero" className="w-full">
        <h1 className="sr-only">{t.home.heroTitle}</h1>
        <PortalTransformHero />
      </section>

      {/* Subsequent Sections in Centered Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col gap-10 sm:gap-14 lg:gap-16 py-8 sm:py-12">
        {/* Emergency Strip (Financial Golden Hour) */}
        <EmergencyBanner />

        {/* Static Hero Before / After Portal Card */}
        <BeforeAfterPortalCard />

        {/* Trust Cues & Guidance Cards (3 Key Cards) */}
        <TrustCuesSection />

        {/* 4-Step Process Overview */}
        <WorkflowStepsSection />

        {/* Bottom CTA Banner */}
        <section
          aria-labelledby="bottom-cta-heading"
          className="rounded-lg border border-chakra-blue/20 bg-gradient-to-r from-blue-50/70 via-mist/80 to-amber-50/50 p-5 sm:p-8 lg:p-10 text-center flex flex-col items-center justify-center shadow-2xs"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-white border border-border-soft text-deep-navy text-xs font-semibold mb-3">
            <Sparkles className="size-3.5 text-saffron" aria-hidden="true" />
            <span>{t.common.officialHelperNote}</span>
          </div>
          <h2 id="bottom-cta-heading" className="text-xl sm:text-2xl lg:text-3xl font-bold text-deep-navy tracking-tight max-w-xl">
            {t.common.brandShortLine}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-text max-w-lg">
            {t.common.brandTagline}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/login')}
              rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
            >
              {t.home.startReportCta}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/track')}
            >
              {t.home.trackComplaintCta}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};
