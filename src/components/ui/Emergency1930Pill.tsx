import React from 'react';
import { PhoneCall } from 'lucide-react';
import { useTranslation } from '../../i18n';

export interface Emergency1930PillProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'alert' | 'saffron' | 'outline';
  customLabel?: string;
  showIcon?: boolean;
  pulse?: boolean;
  fullLabel?: boolean;
}

export const Emergency1930Pill: React.FC<Emergency1930PillProps> = ({
  className = '',
  size = 'md',
  variant = 'alert',
  customLabel,
  showIcon = true,
  pulse = false,
  fullLabel = false,
}) => {
  const { t } = useTranslation();
  const label = customLabel || t.emergency.pillLabel;
  const isFullLabelAlways = fullLabel || size === 'lg' || Boolean(customLabel);

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-xs sm:text-sm px-3.5 py-1.5 gap-2 min-h-[36px]',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 min-h-[44px]',
  };

  const variantClasses = {
    alert:
      'bg-alert-red hover:bg-[#B71C1C] text-white shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-alert-red focus-visible:ring-offset-2',
    saffron:
      'bg-saffron hover:bg-[#E87E14] text-deep-navy shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2',
    outline:
      'bg-white text-alert-red border border-alert-red hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-alert-red focus-visible:ring-offset-2',
  };

  return (
    <a
      href="tel:1930"
      aria-label={`${t.emergency.ariaLabel} (${t.emergency.helplineNumber})`}
      className={`group inline-flex items-center justify-center font-bold rounded-pill transition-all duration-150 cursor-pointer select-none no-underline ${sizeClasses[size]} ${variantClasses[variant]} ${pulse ? 'animate-pulse' : ''} ${className}`}
    >
      {showIcon && (
        <PhoneCall
          className="size-3.5 sm:size-4 shrink-0 transition-transform group-hover:scale-110"
          aria-hidden="true"
        />
      )}
      {isFullLabelAlways ? (
        <span className="tracking-tight">{label}</span>
      ) : (
        <>
          <span className="tracking-tight hidden xs:inline">{label}</span>
          <span className="tracking-tight xs:hidden font-bold">{t.emergency.helplineNumber}</span>
        </>
      )}
    </a>
  );
};
