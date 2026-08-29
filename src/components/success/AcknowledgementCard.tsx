import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  FileText,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  IndianRupee,
  Paperclip,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { ComplaintDraft } from '../../types';
import { getCategoryDefinition } from '../../data/categories';
import { DemoBadge } from '../ui/DemoBadge';

export interface AcknowledgementCardProps {
  complaint: ComplaintDraft;
  onCopySuccess?: () => void;
}

export const AcknowledgementCard: React.FC<AcknowledgementCardProps> = ({
  complaint,
  onCopySuccess,
}) => {
  const { t, language } = useTranslation();
  const [copied, setCopied] = useState(false);

  const ackId = complaint.acknowledgementId || 'CR-2026-08-0001930';

  const handleCopyId = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(ackId);
      }
      setCopied(true);
      if (onCopySuccess) onCopySuccess();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API fails
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const categoryDef = complaint.category
    ? getCategoryDefinition(complaint.category)
    : undefined;

  const categoryLabel = categoryDef
    ? language === 'hi'
      ? categoryDef.labelHi
      : categoryDef.label
    : complaint.category || t.chat.unclassified;

  const isFinancial =
    complaint.category === 'financial_fraud' ||
    Boolean(complaint.financial?.amountLost);

  // Format submission date/time
  const formattedDateTime = (() => {
    if (complaint.submittedAt) {
      try {
        const d = new Date(complaint.submittedAt);
        return d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return complaint.submittedAt;
      }
    }
    return complaint.incident.date
      ? `${complaint.incident.date}${complaint.incident.time ? `, ${complaint.incident.time}` : ''}`
      : '28 Aug 2026, 04:35 PM';
  })();

  const amountLostFormatted =
    complaint.financial?.amountLost !== undefined
      ? `₹${complaint.financial.amountLost.toLocaleString('en-IN')}`
      : null;

  return (
    <article
      data-testid="acknowledgement-card"
      aria-labelledby="ack-receipt-heading"
      className="relative overflow-hidden rounded-2xl border-2 border-chakra-blue/20 bg-white p-5 sm:p-7 shadow-md"
    >
      {/* Decorative top tricolor bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-saffron via-white to-india-green" />

      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-5 border-b border-border-soft">
        <div className="flex items-center gap-3">
          <div className="size-11 sm:size-12 rounded-xl bg-emerald-50 border border-emerald-200 text-india-green flex items-center justify-center shadow-2xs shrink-0">
            <ShieldCheck className="size-6 sm:size-7" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-chakra-blue">
                {t.common.brandName} • {t.success.badge}
              </span>
            </div>
            <h2
              id="ack-receipt-heading"
              className="text-lg sm:text-xl font-bold tracking-tight text-deep-navy"
            >
              {t.success.ackCardTitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DemoBadge size="sm" />
        </div>
      </div>

      {/* Primary Highlight: Acknowledgement Number Box */}
      <div className="my-6 rounded-xl border border-chakra-blue/30 bg-mist/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-text block">
            {t.success.ackNumberLabel}
          </span>
          <div className="flex items-center gap-2.5">
            <span
              data-testid="acknowledgement-number"
              className="font-mono text-xl sm:text-2xl lg:text-3xl font-extrabold text-deep-navy tracking-wide select-all"
            >
              {ackId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleCopyId}
            aria-label={t.success.copyAckId}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-border-soft hover:border-chakra-blue hover:text-chakra-blue text-xs font-bold text-deep-navy shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-chakra-blue/30 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="size-4 text-india-green" aria-hidden="true" />
                <span className="text-india-green font-semibold">
                  {t.success.copiedAckId}
                </span>
              </>
            ) : (
              <>
                <Copy className="size-4 text-chakra-blue" aria-hidden="true" />
                <span>{t.success.copyAckId}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status & Submission Metadata Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-6 border-b border-border-soft text-xs sm:text-sm">
        <div className="rounded-lg bg-blue-50/70 border border-blue-100 p-3 flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold uppercase text-chakra-blue block">
              {t.success.statusLabel}
            </span>
            <span className="font-bold text-deep-navy flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-india-green animate-pulse" />
              {t.success.statusValue}
            </span>
          </div>
          <Clock className="size-5 text-chakra-blue/60 shrink-0" aria-hidden="true" />
        </div>

        <div className="rounded-lg bg-mist/60 border border-border-soft p-3 flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold uppercase text-muted-text block">
              {t.success.submissionDateLabel}
            </span>
            <span className="font-semibold text-deep-navy">
              {formattedDateTime}
            </span>
          </div>
          <Calendar className="size-5 text-muted-text/60 shrink-0" aria-hidden="true" />
        </div>

        <div className="rounded-lg bg-mist/60 border border-border-soft p-3 flex items-center justify-between gap-2 sm:col-span-2 lg:col-span-1">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold uppercase text-muted-text block">
              {t.success.categoryLabel}
            </span>
            <span className="font-semibold text-deep-navy truncate block">
              {categoryLabel}
            </span>
          </div>
          <ShieldCheck className="size-5 text-muted-text/60 shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Detailed Structured Summary Section */}
      <div className="pt-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-text">
          {language === 'hi' ? 'रिपोर्ट सारांश विवरण' : 'Summary Details'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm bg-mist/40 p-4 sm:p-5 rounded-xl border border-border-soft">
          {/* Complainant Info */}
          <div className="space-y-1">
            <span className="text-xs text-muted-text flex items-center gap-1">
              <User className="size-3.5 text-chakra-blue" aria-hidden="true" />
              <span>{t.success.complainantLabel}</span>
            </span>
            <p className="font-semibold text-deep-navy">
              {complaint.complainant.name || (complaint.complainant.isGuest ? t.chat.guestUser : 'Demo Citizen')}
              {complaint.complainant.mobile ? ` • +91 ${complaint.complainant.mobile}` : ''}
              {complaint.complainant.state ? ` (${complaint.complainant.state})` : ''}
            </p>
          </div>

          {/* Sub-Category / Incident Location */}
          <div className="space-y-1">
            <span className="text-xs text-muted-text flex items-center gap-1">
              <MapPin className="size-3.5 text-chakra-blue" aria-hidden="true" />
              <span>{t.success.subCategoryLabel}</span>
            </span>
            <p className="font-semibold text-deep-navy">
              {complaint.subCategory || complaint.incident.platform || 'General Cyber Incident'}
            </p>
          </div>

          {/* Financial Loss (If applicable) */}
          {isFinancial && amountLostFormatted && (
            <div className="space-y-1 md:col-span-2 pt-2 border-t border-border-soft/60">
              <span className="text-xs text-muted-text flex items-center gap-1">
                <IndianRupee className="size-3.5 text-saffron" aria-hidden="true" />
                <span>{t.success.amountLostLabel}</span>
              </span>
              <p className="text-base font-bold text-deep-navy text-saffron">
                {amountLostFormatted}
                {complaint.financial?.paymentMethod ? ` (${complaint.financial.paymentMethod})` : ''}
                {complaint.financial?.transactionId ? ` • Ref: ${complaint.financial.transactionId}` : ''}
              </p>
            </div>
          )}

          {/* Incident Summary */}
          <div className="space-y-1 md:col-span-2 pt-2 border-t border-border-soft/60">
            <span className="text-xs text-muted-text flex items-center gap-1">
              <FileText className="size-3.5 text-chakra-blue" aria-hidden="true" />
              <span>{t.success.summaryLabel}</span>
            </span>
            <p className="text-deep-navy leading-relaxed font-normal">
              {complaint.incident.summary ||
                'Incident report drafted with Rakshak AI assisted conversation.'}
            </p>
          </div>

          {/* Evidence Attachments Count */}
          <div className="space-y-1 md:col-span-2 pt-2 border-t border-border-soft/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="size-4 text-chakra-blue" aria-hidden="true" />
              <span className="text-xs text-muted-text">
                {t.success.evidenceAttachedLabel}:
              </span>
              <span className="font-semibold text-deep-navy">
                {t.success.filesCount.replace(
                  '{count}',
                  String(complaint.evidence?.length || 0),
                )}
              </span>
            </div>

            {complaint.evidence && complaint.evidence.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {complaint.evidence.slice(0, 3).map((ev) => (
                  <span
                    key={ev.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-border-soft text-deep-navy truncate max-w-[160px]"
                  >
                    {ev.name}
                  </span>
                ))}
                {complaint.evidence.length > 3 && (
                  <span className="text-[11px] text-muted-text self-center">
                    +{complaint.evidence.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
