import React from 'react';
import { PhoneCall, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n';

export const EmergencyActionCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className="my-3 sm:my-4 rounded-xl border-2 border-alert-red/40 bg-gradient-to-br from-red-50 via-white to-amber-50/60 p-4 sm:p-5 shadow-xs"
      role="alert"
      aria-label={t.chat.call1930EmergencyTitle}
      data-testid="emergency-action-card"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-alert-red text-white shrink-0 shadow-2xs">
          <PhoneCall className="size-5" aria-hidden="true" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-alert-red flex items-center gap-1.5">
              <span>{t.chat.call1930EmergencyTitle}</span>
            </h3>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-red-100 text-alert-red border border-red-200">
              {t.chat.financialGuidanceTitle}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-ink/90 font-medium leading-relaxed">
            {t.chat.call1930EmergencyBody}
          </p>

          <p className="text-xs text-muted-text">
            {t.chat.financialGuidanceNotice}
          </p>

          <div className="pt-2">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-alert-red hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-102 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              aria-label={t.emergency.ariaLabel}
            >
              <PhoneCall className="size-4" aria-hidden="true" />
              <span>{t.chat.call1930Action}</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
