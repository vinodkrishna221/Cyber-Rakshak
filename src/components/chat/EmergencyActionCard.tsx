import React from 'react';
import { PhoneCall, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n';

export const EmergencyActionCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className="my-3 sm:my-4 rounded-xl border border-amber-300 bg-amber-50/80 p-4 sm:p-5 shadow-sm"
      role="alert"
      aria-label={t.chat.call1930EmergencyTitle}
      data-testid="emergency-action-card"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-amber-100 text-saffron shrink-0 shadow-sm border border-amber-200">
          <PhoneCall className="size-5" aria-hidden="true" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-amber-900 flex items-center gap-1.5">
              <span>{t.chat.call1930EmergencyTitle}</span>
            </h3>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              {t.chat.financialGuidanceTitle}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-amber-900/90 font-medium leading-relaxed">
            {t.chat.call1930EmergencyBody}
          </p>

          <p className="text-xs text-amber-800/70">
            {t.chat.financialGuidanceNotice}
          </p>

          <div className="pt-2">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-saffron hover:bg-[#E67E17] text-white text-xs sm:text-sm font-bold shadow-md shadow-saffron/20 transition-all hover:scale-102 focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2"
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
