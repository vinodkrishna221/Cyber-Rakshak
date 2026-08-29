import React from 'react';
import { useTranslation } from '../../i18n';

export interface DemoBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  className = '',
  size = 'md',
}) => {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  return (
    <span
      role="status"
      aria-label={`${t.common.demoPrototype}: ${t.common.demoNotice}`}
      className={`inline-flex items-center gap-1.5 font-medium rounded-pill bg-amber-50 text-amber-900 border border-amber-200/80 select-none shadow-2xs ${sizeClasses[size]} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-warning-amber inline-block" aria-hidden="true" />
      <span>{t.common.demoPrototype}</span>
    </span>
  );
};
