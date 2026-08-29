import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Edit3,
  Layers,
  User,
  FileText,
  IndianRupee,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Calendar,
  Globe,
  Clock,
  MapPin,
  Laptop,
} from 'lucide-react';
import { ComplaintDraft, ClassificationResult } from '../../types';
import { useTranslation } from '../../i18n';
import { getCategoryDefinition, getSubCategoryDefinition } from '../../data/categories';
import { Button } from '../ui/Button';
import { PreviewEvidenceManager } from './PreviewEvidenceManager';

interface ComplaintPreviewCardProps {
  draft: ComplaintDraft;
  classification: ClassificationResult | null;
  onEdit: () => void;
  onReturnToChat: () => void;
  onSubmit: () => void;
  declarationConfirmed: boolean;
  onDeclarationChange: (checked: boolean) => void;
  declarationError: string | null;
  isSubmitting?: boolean;
}

export const ComplaintPreviewCard: React.FC<ComplaintPreviewCardProps> = ({
  draft,
  classification,
  onEdit,
  onReturnToChat,
  onSubmit,
  declarationConfirmed,
  onDeclarationChange,
  declarationError,
  isSubmitting = false,
}) => {
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';

  const category = draft.category || classification?.category || 'other_cybercrime';
  const categoryDef = getCategoryDefinition(category);
  const categoryTitle = isHindi ? categoryDef.labelHi : categoryDef.label;

  let subCategoryTitle = draft.subCategory || classification?.subCategory;
  if (draft.subCategoryKey) {
    const subDef = getSubCategoryDefinition(draft.subCategoryKey);
    if (subDef) {
      subCategoryTitle = isHindi ? subDef.labelHi : subDef.label;
    }
  }
  if (!subCategoryTitle) {
    subCategoryTitle = t.preview.emptyFieldPlaceholder;
  }

  const confidenceScore = Math.round((draft.confidence || classification?.confidence || 0.92) * 100);

  const complainantName =
    draft.complainant.name ||
    (draft.complainant.isGuest ? t.preview.guestStatus : t.preview.emptyFieldPlaceholder);

  const complainantMobile = draft.complainant.mobile
    ? `+91 ${draft.complainant.mobile}`
    : t.preview.emptyFieldPlaceholder;

  const isFinancial = category === 'financial_fraud';
  const hasFinancialData =
    isFinancial ||
    draft.financial?.amountLost !== undefined ||
    draft.financial?.paymentMethod ||
    draft.financial?.transactionId;

  const hasSuspectData = Boolean(
    draft.suspect?.phone ||
      draft.suspect?.upiId ||
      draft.suspect?.socialHandle ||
      draft.suspect?.url ||
      draft.suspect?.email,
  );

  const formattedAmount =
    draft.financial?.amountLost !== undefined && draft.financial.amountLost !== null
      ? `₹${Number(draft.financial.amountLost).toLocaleString('en-IN')}`
      : t.preview.emptyFieldPlaceholder;

  return (
    <div
      className="bg-white rounded-2xl border border-border-soft shadow-xs overflow-hidden"
      data-testid="complaint-preview-card"
    >
      {/* Top Banner / Review Header */}
      <div className="bg-gradient-to-r from-deep-navy to-chakra-blue p-5 sm:p-6 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-white/15 text-[11px] font-bold text-white tracking-wide uppercase border border-white/20">
              <ShieldCheck className="size-3.5 text-india-green" aria-hidden="true" />
              <span>{t.preview.badge}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-saffron/20 text-saffron text-[11px] font-bold border border-saffron/30">
              <Sparkles className="size-3" aria-hidden="true" />
              <span>{t.preview.autoDraftedTag}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {t.preview.pageTitle}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl">
            {t.preview.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onEdit}
            leftIcon={<Edit3 className="size-3.5" aria-hidden="true" />}
            className="bg-white text-deep-navy hover:bg-mist font-semibold shadow-xs"
          >
            {t.preview.editReport}
          </Button>
        </div>
      </div>

      {/* Structured Content Groups */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* SECTION 1: Incident Classification */}
        <section
          aria-labelledby="section-classification-title"
          className="rounded-xl border border-border-soft bg-mist/40 p-4 sm:p-5 space-y-3.5"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-border-soft">
            <h3
              id="section-classification-title"
              className="text-xs font-bold uppercase tracking-wider text-chakra-blue flex items-center gap-2"
            >
              <Layers className="size-4 text-chakra-blue" aria-hidden="true" />
              <span>{t.preview.categorySectionTitle}</span>
            </h3>

            <span className="px-2.5 py-0.5 rounded-pill bg-blue-50 text-chakra-blue text-[11px] font-bold border border-blue-100 flex items-center gap-1">
              <Sparkles className="size-3 text-saffron" aria-hidden="true" />
              <span>{t.preview.matchScore.replace('{score}', confidenceScore.toString())}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                {t.preview.categoryLabel}
              </span>
              <p className="font-bold text-deep-navy text-sm sm:text-base mt-0.5">
                {categoryTitle}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                {t.preview.subCategoryLabel}
              </span>
              <p className="font-semibold text-chakra-blue mt-0.5">
                {subCategoryTitle}
              </p>
            </div>
          </div>

          {/* Golden Hour Reminder Callout if Financial */}
          {isFinancial && (
            <div className="rounded-lg bg-amber-50/90 border border-amber-200 p-3 text-xs text-amber-950 flex items-start gap-2.5">
              <PhoneCall className="size-4 text-alert-red shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5">
                <span className="font-bold text-deep-navy block">
                  {t.emergency.bannerTitle}
                </span>
                <p className="text-muted-text leading-relaxed">
                  {t.preview.goldenHourHelpNotice}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: Complainant Details */}
        <section
          aria-labelledby="section-complainant-title"
          className="rounded-xl border border-border-soft bg-white p-4 sm:p-5 space-y-3.5 shadow-2xs"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-border-soft">
            <h3
              id="section-complainant-title"
              className="text-xs font-bold uppercase tracking-wider text-chakra-blue flex items-center gap-2"
            >
              <User className="size-4 text-chakra-blue" aria-hidden="true" />
              <span>{t.preview.complainantSectionTitle}</span>
            </h3>

            <span className="text-[11px] font-semibold text-india-green flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-pill border border-green-100">
              <CheckCircle2 className="size-3" aria-hidden="true" />
              <span>{draft.complainant.isGuest ? t.preview.guestStatus : t.preview.verifiedStatus}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                {t.preview.citizenNameLabel}
              </span>
              <p className="font-semibold text-deep-navy mt-0.5">
                {complainantName}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                {t.preview.mobileNumberLabel}
              </span>
              <p className="font-mono font-semibold text-deep-navy mt-0.5">
                {complainantMobile}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                {t.preview.stateLabel}
              </span>
              <p className="font-semibold text-deep-navy mt-0.5">
                {draft.complainant.state || t.preview.emptyFieldPlaceholder}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: Incident Details */}
        <section
          aria-labelledby="section-incident-title"
          className="rounded-xl border border-border-soft bg-white p-4 sm:p-5 space-y-3.5 shadow-2xs"
        >
          <div className="pb-2.5 border-b border-border-soft">
            <h3
              id="section-incident-title"
              className="text-xs font-bold uppercase tracking-wider text-chakra-blue flex items-center gap-2"
            >
              <FileText className="size-4 text-chakra-blue" aria-hidden="true" />
              <span>{t.preview.incidentSectionTitle}</span>
            </h3>
          </div>

          {/* Incident Summary */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
              {t.preview.incidentSummaryLabel}
            </span>
            <p className="text-xs sm:text-sm font-medium text-ink bg-mist/60 p-3.5 rounded-lg border border-border-soft leading-relaxed">
              {draft.incident.summary || t.preview.emptyFieldPlaceholder}
            </p>
          </div>

          {/* Incident Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm pt-1">
            <div className="bg-mist/30 p-2.5 rounded-lg border border-border-soft/80">
              <span className="text-[11px] text-muted-text flex items-center gap-1 block">
                <Calendar className="size-3 text-chakra-blue" />
                <span>{t.preview.dateLabel}</span>
              </span>
              <span className="font-semibold text-deep-navy block mt-0.5 truncate">
                {draft.incident.date || t.preview.emptyFieldPlaceholder}
              </span>
            </div>

            <div className="bg-mist/30 p-2.5 rounded-lg border border-border-soft/80">
              <span className="text-[11px] text-muted-text flex items-center gap-1 block">
                <Clock className="size-3 text-chakra-blue" />
                <span>{t.preview.timeLabel}</span>
              </span>
              <span className="font-semibold text-deep-navy block mt-0.5 truncate">
                {draft.incident.time || t.preview.emptyFieldPlaceholder}
              </span>
            </div>

            <div className="bg-mist/30 p-2.5 rounded-lg border border-border-soft/80">
              <span className="text-[11px] text-muted-text flex items-center gap-1 block">
                <Laptop className="size-3 text-chakra-blue" />
                <span>{t.preview.platformLabel}</span>
              </span>
              <span className="font-semibold text-deep-navy block mt-0.5 truncate">
                {draft.incident.platform || t.preview.emptyFieldPlaceholder}
              </span>
            </div>

            {draft.incident.location && (
              <div className="bg-mist/30 p-2.5 rounded-lg border border-border-soft/80 sm:col-span-3">
                <span className="text-[11px] text-muted-text flex items-center gap-1 block">
                  <MapPin className="size-3 text-chakra-blue" />
                  <span>{t.preview.locationLabel}</span>
                </span>
                <span className="font-semibold text-deep-navy block mt-0.5">
                  {draft.incident.location}
                </span>
              </div>
            )}
          </div>

          {/* Detailed Description (if present) */}
          {draft.incident.description && (
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                {t.preview.descriptionLabel}
              </span>
              <p className="text-xs sm:text-sm text-ink/90 bg-white p-3 rounded-lg border border-border-soft leading-relaxed whitespace-pre-wrap">
                {draft.incident.description}
              </p>
            </div>
          )}
        </section>

        {/* SECTION 4: Financial Loss Details (Rendered if Financial Fraud or details present) */}
        {hasFinancialData && (
          <section
            aria-labelledby="section-financial-title"
            className="rounded-xl border border-red-200/80 bg-red-50/20 p-4 sm:p-5 space-y-3.5 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-red-200/60">
              <h3
                id="section-financial-title"
                className="text-xs font-bold uppercase tracking-wider text-alert-red flex items-center gap-2"
              >
                <IndianRupee className="size-4 text-alert-red" aria-hidden="true" />
                <span>{t.preview.financialSectionTitle}</span>
              </h3>

              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-alert-red uppercase">
                {isFinancial ? 'Financial Loss' : 'Monetary Loss'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="bg-white p-3 rounded-lg border border-red-100">
                <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                  {t.preview.amountLostLabel}
                </span>
                <p className="text-base sm:text-lg font-bold text-alert-red mt-0.5">
                  {formattedAmount}
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-border-soft">
                <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                  {t.preview.paymentMethodLabel}
                </span>
                <p className="font-semibold text-deep-navy mt-0.5 truncate">
                  {draft.financial?.paymentMethod || t.preview.emptyFieldPlaceholder}
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-border-soft">
                <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                  {t.preview.transactionIdLabel}
                </span>
                <p className="font-mono font-semibold text-deep-navy mt-0.5 truncate">
                  {draft.financial?.transactionId || t.preview.emptyFieldPlaceholder}
                </p>
              </div>

              {draft.financial?.bankOrWallet && (
                <div className="bg-white p-3 rounded-lg border border-border-soft sm:col-span-3">
                  <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                    {t.preview.bankWalletLabel}
                  </span>
                  <p className="font-semibold text-deep-navy mt-0.5">
                    {draft.financial.bankOrWallet}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION 5: Suspect Details */}
        <section
          aria-labelledby="section-suspect-title"
          className="rounded-xl border border-border-soft bg-white p-4 sm:p-5 space-y-3.5 shadow-2xs"
        >
          <div className="pb-2.5 border-b border-border-soft">
            <h3
              id="section-suspect-title"
              className="text-xs font-bold uppercase tracking-wider text-chakra-blue flex items-center gap-2"
            >
              <AlertTriangle className="size-4 text-warning-amber" aria-hidden="true" />
              <span>{t.preview.suspectSectionTitle}</span>
            </h3>
          </div>

          {!hasSuspectData ? (
            <p className="text-xs text-muted-text italic bg-mist/40 p-3 rounded-lg border border-border-soft">
              {t.preview.noSuspectDetails}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              {draft.suspect?.phone && (
                <div className="bg-mist/30 p-2.5 rounded-lg border border-border-soft">
                  <span className="text-[11px] text-muted-text block">{t.preview.suspectPhoneLabel}</span>
                  <span className="font-mono font-semibold text-deep-navy block mt-0.5">
                    {draft.suspect.phone}
                  </span>
                </div>
              )}

              {draft.suspect?.upiId && (
                <div className="bg-mist/30 p-2.5 rounded-lg border border-border-soft">
                  <span className="text-[11px] text-muted-text block">{t.preview.suspectUpiLabel}</span>
                  <span className="font-mono font-semibold text-chakra-blue block mt-0.5 truncate">
                    {draft.suspect.upiId}
                  </span>
                </div>
              )}

              {draft.suspect?.socialHandle && (
                <div className="bg-mist/30 p-2.5 rounded-lg border border-border-soft">
                  <span className="text-[11px] text-muted-text block">{t.preview.suspectHandleLabel}</span>
                  <span className="font-semibold text-deep-navy block mt-0.5 truncate">
                    {draft.suspect.socialHandle}
                  </span>
                </div>
              )}

              {draft.suspect?.url && (
                <div className="bg-mist/30 p-2.5 rounded-lg border border-border-soft">
                  <span className="text-[11px] text-muted-text block">{t.preview.suspectUrlLabel}</span>
                  <span className="font-mono text-chakra-blue underline block mt-0.5 truncate">
                    {draft.suspect.url}
                  </span>
                </div>
              )}

              {draft.suspect?.email && (
                <div className="bg-mist/30 p-2.5 rounded-lg border border-border-soft sm:col-span-2">
                  <span className="text-[11px] text-muted-text block">{t.preview.suspectEmailLabel}</span>
                  <span className="font-mono font-semibold text-deep-navy block mt-0.5">
                    {draft.suspect.email}
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* SECTION 6: Evidence Files */}
        <section
          aria-labelledby="section-evidence-title"
          className="rounded-xl border border-border-soft bg-white p-4 sm:p-5 space-y-3.5 shadow-2xs"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-border-soft">
            <h3
              id="section-evidence-title"
              className="text-xs font-bold uppercase tracking-wider text-chakra-blue flex items-center gap-2"
            >
              <FileText className="size-4 text-chakra-blue" aria-hidden="true" />
              <span>{t.preview.evidenceSectionTitle}</span>
            </h3>

            <span className="text-[11px] font-bold text-chakra-blue bg-blue-50 px-2 py-0.5 rounded-pill border border-blue-100">
              {t.preview.attachedEvidenceCount.replace('{count}', draft.evidence.length.toString())}
            </span>
          </div>

          <PreviewEvidenceManager
            evidence={draft.evidence}
            category={category}
            isEditable={true}
          />
        </section>

        {/* SECTION 7: Declaration & Actions */}
        <section
          aria-labelledby="section-declaration-title"
          className="rounded-xl border-2 border-dashed border-chakra-blue/30 bg-blue-50/40 p-4 sm:p-5 space-y-4"
        >
          <h3
            id="section-declaration-title"
            className="text-xs font-bold uppercase tracking-wider text-chakra-blue"
          >
            {t.preview.declarationSectionTitle}
          </h3>

          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                id="declaration-checkbox"
                checked={declarationConfirmed}
                onChange={(e) => onDeclarationChange(e.target.checked)}
                className="size-4.5 rounded border-border-soft text-chakra-blue focus:ring-chakra-blue mt-0.5 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-semibold text-deep-navy leading-normal">
                {t.preview.declarationCheckbox}
              </span>
            </label>

            {declarationError && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-center gap-1.5 text-xs font-semibold text-alert-red pt-1"
              >
                <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{declarationError}</span>
              </div>
            )}
          </div>

          {/* Action Button Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-chakra-blue/20">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onReturnToChat}
              leftIcon={<ArrowLeft className="size-4" aria-hidden="true" />}
              className="w-full sm:w-auto font-semibold"
            >
              {t.preview.returnToChat}
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onEdit}
                leftIcon={<Edit3 className="size-4" aria-hidden="true" />}
                className="w-full sm:w-auto font-semibold"
              >
                {t.preview.editReport}
              </Button>

              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={onSubmit}
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
                className="w-full sm:w-auto font-bold bg-saffron text-deep-navy hover:bg-[#E67E17] shadow-sm"
              >
                {isSubmitting ? t.preview.submittingComplaint : t.preview.submitDemoComplaint}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
