import React from 'react';
import {
  FileWarning,
  Sparkles,
  CheckCircle2,
  XCircle,
  PhoneCall,
  ShieldCheck,
  Bot,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { ChakraMark } from '../ui/ChakraMark';

export const BeforeAfterPortalCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="before-after-heading"
      className="w-full rounded-lg border border-border-soft bg-white p-4 sm:p-6 lg:p-8 shadow-xs"
    >
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-blue-50 border border-blue-100 text-chakra-blue text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="size-3.5 text-saffron shrink-0" aria-hidden="true" />
          <span>{t.home.beforeAfterSectionTitle}</span>
        </div>
        <h2
          id="before-after-heading"
          className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-deep-navy"
        >
          {t.home.beforeAfterSectionSubtitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {/* Traditional Portal Panel */}
        <div className="flex flex-col rounded-lg border border-red-200/80 bg-red-50/30 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-red-200/60">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-red-100 text-alert-red">
                <FileWarning className="size-4" aria-hidden="true" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-alert-red block">
                  {t.home.traditionalBadge}
                </span>
                <span className="text-sm font-semibold text-deep-navy">
                  {t.home.traditionalTitle}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center text-[11px] font-semibold text-alert-red bg-white px-2 py-0.5 rounded border border-red-200">
              {t.home.legacyBadge}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-text mb-4 leading-relaxed">
            {t.home.traditionalDesc}
          </p>

          {/* Stylized Legacy UI Snapshot */}
          <div className="rounded-md border border-red-200 bg-white p-3.5 sm:p-4 mb-4 text-xs space-y-2.5 font-mono opacity-90 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-muted-text border-b border-gray-100 pb-2">
              <span className="font-semibold text-red-950">{t.home.legacyFormHeader}</span>
              <span className="text-alert-red font-bold flex items-center gap-1">
                <AlertTriangle className="size-3" /> {t.home.legacyFormMandatory}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-deep-navy/80 block font-sans">
                {t.home.legacyCategoryLabel} <span className="text-alert-red">*</span>
              </label>
              <div className="w-full bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 text-muted-text flex justify-between items-center text-[11px]">
                <span className="truncate">{t.home.legacyCategoryValue}</span>
                <span className="text-muted-text/70 shrink-0 ml-1">▼</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] text-deep-navy/80 block font-sans truncate">{t.home.legacySubCodeLabel}</label>
                <div className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-muted-text text-[11px] truncate">
                  {t.home.legacySubCodeValue}
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] text-deep-navy/80 block font-sans truncate">{t.home.legacyJurisdictionLabel}</label>
                <div className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-muted-text text-[11px] truncate">
                  {t.home.legacyJurisdictionValue}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-alert-red bg-red-50 p-1.5 rounded border border-red-100 font-sans">
              {t.home.legacyErrorMessage}
            </div>
          </div>

          {/* Friction points list */}
          <ul className="mt-auto space-y-2 text-xs text-deep-navy/90 pt-2">
            <li className="flex items-start gap-2">
              <XCircle className="size-4 text-alert-red shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.home.traditionalPoint1}</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="size-4 text-alert-red shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.home.traditionalPoint2}</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="size-4 text-alert-red shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.home.traditionalPoint3}</span>
            </li>
          </ul>
        </div>

        {/* Cyber Rakshak Modern AI Panel */}
        <div className="flex flex-col rounded-lg border-2 border-chakra-blue/30 bg-blue-50/30 p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-saffron text-deep-navy text-[11px] font-bold px-3 py-0.5 rounded-bl-md shadow-2xs">
            {t.home.nextGenBadge}
          </div>

          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-chakra-blue/20">
            <div className="flex items-center gap-2">
              <ChakraMark size="sm" aria-hidden="true" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-chakra-blue block">
                  {t.home.rakshakBadge}
                </span>
                <span className="text-sm font-semibold text-deep-navy">
                  {t.home.rakshakTitle}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-text mb-4 leading-relaxed">
            {t.home.rakshakDesc}
          </p>

          {/* Stylized AI Chat Conversation Snapshot */}
          <div className="rounded-md border border-chakra-blue/20 bg-white p-3.5 sm:p-4 mb-4 text-xs space-y-2.5 shadow-2xs font-sans">
            {/* Assistant message */}
            <div className="flex items-start gap-2">
              <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-chakra-blue">
                <Bot className="size-3.5" aria-hidden="true" />
              </div>
              <div className="bg-mist p-2.5 rounded-lg text-deep-navy text-[11px] max-w-[85%] leading-relaxed border border-border-soft">
                {t.common.brandShortLine}
              </div>
            </div>

            {/* Citizen message */}
            <div className="flex items-start justify-end gap-2">
              <div className="bg-chakra-blue text-white p-2.5 rounded-lg text-[11px] max-w-[85%] leading-relaxed shadow-2xs font-medium">
                {t.home.demoUserMessage}
              </div>
            </div>

            {/* Smart Detection pill */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-2 flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold min-w-0">
                <ShieldCheck className="size-4 text-india-green shrink-0" />
                <span className="truncate">{t.home.smartDetectionTag}</span>
              </div>
              <span className="text-[10px] bg-white text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                {t.home.autoDraftedTag}
              </span>
            </div>

            {/* 1930 Golden Hour Trigger */}
            <div className="bg-amber-50 border border-amber-200 rounded p-1.5 flex items-center justify-between text-[10px] text-amber-900 gap-2">
              <span className="flex items-center gap-1 font-medium truncate min-w-0">
                <PhoneCall className="size-3 text-alert-red shrink-0" /> {t.home.goldenHourHint}
              </span>
              <span className="text-saffron font-bold flex items-center shrink-0">
                {t.home.oneClickAction} <ArrowRight className="size-2.5 ml-0.5" />
              </span>
            </div>
          </div>

          {/* Rakshak features list */}
          <ul className="mt-auto space-y-2 text-xs text-deep-navy/90 pt-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-india-green shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-medium">{t.home.rakshakPoint1}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-india-green shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-medium">{t.home.rakshakPoint2}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-india-green shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-medium">{t.home.rakshakPoint3}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
