import React from 'react';
import {
  MessageSquareQuote,
  FileCheck2,
  Lock,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { useTranslation } from '../../i18n';

export const TrustCuesSection: React.FC = () => {
  const { t } = useTranslation();

  const trustCards = [
    {
      id: 'guided-reporting',
      icon: MessageSquareQuote,
      iconBg: 'bg-blue-100 text-chakra-blue',
      title: t.home.trustCard1Title,
      description: t.home.trustCard1Desc,
      points: [
        t.home.trustCard1Point1,
        t.home.trustCard1Point2,
        t.home.trustCard1Point3,
      ],
    },
    {
      id: 'evidence-checklist',
      icon: FileCheck2,
      iconBg: 'bg-amber-100 text-saffron',
      title: t.home.trustCard2Title,
      description: t.home.trustCard2Desc,
      points: [
        t.home.trustCard2Point1,
        t.home.trustCard2Point2,
        t.home.trustCard2Point3,
      ],
    },
    {
      id: 'private-by-design',
      icon: Lock,
      iconBg: 'bg-emerald-100 text-india-green',
      title: t.home.trustCard3Title,
      description: t.home.trustCard3Desc,
      points: [
        t.home.trustCard3Point1,
        t.home.trustCard3Point2,
        t.home.trustCard3Point3,
      ],
    },
  ];

  return (
    <section
      aria-labelledby="trust-cues-heading"
      className="w-full space-y-6"
    >
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-emerald-50 border border-emerald-100 text-india-green text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldAlert className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{t.home.trustSectionTitle}</span>
        </div>
        <h2
          id="trust-cues-heading"
          className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-deep-navy"
        >
          {t.home.trustSectionSubtitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {trustCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.id}
              className="flex flex-col rounded-lg border border-border-soft bg-white p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow duration-150"
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`flex size-10 items-center justify-center rounded-lg ${card.iconBg} shrink-0`}
                  aria-hidden="true"
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-deep-navy tracking-tight">
                  {card.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-muted-text leading-relaxed mb-5 flex-1">
                {card.description}
              </p>

              <ul className="space-y-2 pt-3 border-t border-border-soft/70 text-xs text-deep-navy/90 font-medium">
                {card.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check
                      className="size-3.5 text-india-green shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
};
