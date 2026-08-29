import React from 'react';
import { PhoneCall, AlertTriangle, Clock } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Emergency1930Pill } from '../ui/Emergency1930Pill';

export const EmergencyBanner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <aside
      aria-labelledby="emergency-banner-title"
      className="w-full rounded-lg border border-red-200 bg-red-50/70 p-4 sm:p-5 lg:p-6 shadow-2xs text-deep-navy"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="flex size-10 sm:size-11 items-center justify-center rounded-full bg-alert-red text-white shrink-0 shadow-xs">
            <PhoneCall className="size-5 sm:size-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2
                id="emergency-banner-title"
                className="text-base sm:text-lg font-bold text-alert-red tracking-tight"
              >
                {t.home.emergencyHeading}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white text-alert-red px-2 py-0.5 rounded border border-red-200">
                <Clock className="size-3" aria-hidden="true" /> {t.home.goldenHourBadge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink/80 leading-relaxed">
              {t.home.emergencySubtext}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
          <Emergency1930Pill
            size="lg"
            variant="alert"
            pulse={true}
            className="w-full sm:w-auto shadow-sm"
          />
        </div>
      </div>
    </aside>
  );
};
