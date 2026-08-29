import React from 'react';
import { ShieldCheck, PhoneCall, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { DemoBadge } from '../ui/DemoBadge';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-border-soft bg-white mt-auto text-xs text-muted-text">
      {/* Top advisory banner */}
      <div className="border-b border-border-soft bg-mist/50 py-3 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2 text-deep-navy font-medium">
            <AlertCircle className="size-4 text-warning-amber shrink-0" aria-hidden="true" />
            <span>{t.footer.cyberSafetyTip}</span>
          </div>
          <a
            href="tel:1930"
            className="inline-flex items-center gap-1.5 font-bold text-alert-red hover:underline shrink-0"
            aria-label={t.emergency.ariaLabel}
          >
            <PhoneCall className="size-3.5" aria-hidden="true" />
            <span>{t.footer.nationalHelpline}</span>
          </a>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-deep-navy font-semibold">
              <ShieldCheck className="size-4 text-chakra-blue shrink-0" aria-hidden="true" />
              <span>{t.common.brandName}</span>
            </div>
            <DemoBadge size="sm" />
          </div>

          <p className="max-w-xl text-center md:text-right leading-relaxed text-muted-text">
            {t.footer.disclaimer}
          </p>
        </div>

        <div className="mt-6 border-t border-border-soft pt-4 text-center text-[11px] text-muted-text/80">
          {t.footer.rightsReserved}
        </div>
      </div>
    </footer>
  );
};
