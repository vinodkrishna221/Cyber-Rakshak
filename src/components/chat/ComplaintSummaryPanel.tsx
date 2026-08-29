import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Calendar,
  Layers,
  Paperclip,
  User,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  IndianRupee,
  Smartphone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  FileImage,
  File,
  Info,
} from 'lucide-react';
import { ComplaintDraft, ClassificationResult } from '../../types';
import { useTranslation } from '../../i18n';
import { useDraftStore } from '../../store';
import { Button } from '../ui/Button';

interface ComplaintSummaryPanelProps {
  draft: ComplaintDraft;
  classification: ClassificationResult | null;
  className?: string;
  isMobileDrawer?: boolean;
  onOpenEvidence?: () => void;
}

export const ComplaintSummaryPanel: React.FC<ComplaintSummaryPanelProps> = ({
  draft,
  classification,
  className = '',
  isMobileDrawer = false,
  onOpenEvidence,
}) => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const { removeEvidenceItem } = useDraftStore();

  const isHindi = language === 'hi';
  const categoryLabel = classification
    ? isHindi
      ? classification.categoryLabelHi
      : classification.categoryLabel
    : draft.category
      ? draft.category.replace(/_/g, ' ')
      : t.chat.unclassified;

  const subCategoryLabel =
    classification?.subCategory || draft.subCategory || t.chat.pending;

  const complainantName =
    draft.complainant.name ||
    (draft.complainant.isGuest ? t.chat.guestUser : t.chat.pending);

  const complainantMobile = draft.complainant.mobile
    ? `+91 ${draft.complainant.mobile}`
    : t.chat.pending;

  const evidenceCount = draft.evidence.length;

  const suspectSummary = [
    draft.suspect?.phone,
    draft.suspect?.upiId,
    draft.suspect?.socialHandle,
    draft.suspect?.url,
  ]
    .filter(Boolean)
    .join(', ');

  // Compute Draft Completeness & Progress Percentage
  const hasSummary = Boolean(draft.incident.summary && draft.incident.summary.trim().length > 0);
  const hasCategory = Boolean(draft.category || classification?.category);
  const hasIncidentDetails = Boolean(
    draft.incident.date ||
      draft.incident.platform ||
      draft.incident.location ||
      draft.financial?.amountLost !== undefined ||
      draft.financial?.paymentMethod ||
      draft.financial?.transactionId ||
      draft.suspect?.phone ||
      draft.suspect?.upiId,
  );

  // Minimum required for preview: summary + category + some incident detail
  const isDraftComplete = hasSummary && hasCategory && hasIncidentDetails;

  let progressPercent = 0;
  if (hasSummary) progressPercent += 30;
  if (hasCategory) progressPercent += 30;
  if (hasIncidentDetails) progressPercent += 25;
  if (evidenceCount > 0) progressPercent += 15;
  progressPercent = Math.min(progressPercent, 100);

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (
      lower.endsWith('.png') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.webp')
    ) {
      return <FileImage className="size-3.5 text-chakra-blue" aria-hidden="true" />;
    }
    if (lower.endsWith('.pdf') || lower.endsWith('.docx') || lower.endsWith('.doc')) {
      return <FileText className="size-3.5 text-alert-red" aria-hidden="true" />;
    }
    return <File className="size-3.5 text-deep-navy" aria-hidden="true" />;
  };

  const content = (
    <div className="space-y-3.5">
      {/* Draft Progress & Readiness Indicator */}
      <div className="rounded-xl bg-white p-3 border border-border-soft space-y-2 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-deep-navy flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-chakra-blue" aria-hidden="true" />
            <span>{t.chat.draftProgressLabel}</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-pill text-[10px] font-bold border ${
              isDraftComplete
                ? 'bg-green-50 text-india-green border-green-200'
                : 'bg-amber-50 text-warning-amber border-amber-200'
            }`}
          >
            {isDraftComplete ? t.chat.draftReadyToPreview : t.chat.draftInProgress}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-mist rounded-full h-2 overflow-hidden border border-border-soft">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isDraftComplete ? 'bg-india-green' : 'bg-chakra-blue'
            }`}
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${t.chat.draftProgressLabel}: ${progressPercent}%`}
          />
        </div>
      </div>

      {/* Category Section */}
      <div className="rounded-xl bg-mist p-3.5 border border-border-soft space-y-2 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
            <Layers className="size-3.5 text-chakra-blue" aria-hidden="true" />
            <span>{t.chat.categoryLabel}</span>
          </span>
          {classification && (
            <span className="text-[11px] font-bold text-chakra-blue bg-blue-50 px-2 py-0.5 rounded-pill border border-blue-100 flex items-center gap-1">
              <Sparkles className="size-3 text-saffron" aria-hidden="true" />
              <span>
                {Math.round((classification.confidence || 0.9) * 100)}%
              </span>
            </span>
          )}
        </div>

        <div>
          <p className="text-sm font-bold text-deep-navy">{categoryLabel}</p>
          <p className="text-xs text-chakra-blue font-medium mt-0.5">
            {subCategoryLabel}
          </p>
        </div>
      </div>

      {/* Incident Summary Snippet */}
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-text block">
          {t.chat.incidentSummaryLabel}
        </span>
        <p className="text-xs sm:text-sm text-ink/90 font-medium bg-white p-3 rounded-lg border border-border-soft leading-relaxed min-h-[44px]">
          {draft.incident.summary || t.chat.noSummaryYet}
        </p>
      </div>

      {/* Extracted Incident Details */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-text block">
          {t.chat.incidentDetailsLabel}
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Date & Time */}
          <div className="bg-white p-2.5 rounded-lg border border-border-soft">
            <span className="text-muted-text text-[11px] block">{t.chat.dateTimeLabel}</span>
            <span className="font-semibold text-deep-navy truncate block">
              {draft.incident.date || t.chat.pending}
            </span>
          </div>

          {/* Amount Lost (if financial) or Platform */}
          {draft.category === 'financial_fraud' || draft.financial?.amountLost !== undefined ? (
            <div className="bg-white p-2.5 rounded-lg border border-border-soft">
              <span className="text-muted-text text-[11px] block">{t.chat.amountLostLabel}</span>
              <span className="font-bold text-alert-red flex items-center gap-0.5">
                {draft.financial?.amountLost !== undefined
                  ? `₹${draft.financial.amountLost.toLocaleString('en-IN')}`
                  : t.chat.pending}
              </span>
            </div>
          ) : (
            <div className="bg-white p-2.5 rounded-lg border border-border-soft">
              <span className="text-muted-text text-[11px] block">{t.chat.platformLabel}</span>
              <span className="font-semibold text-deep-navy truncate block">
                {draft.incident.platform || t.chat.pending}
              </span>
            </div>
          )}

          {/* Platform / Channel */}
          {draft.category === 'financial_fraud' && (
            <div className="bg-white p-2.5 rounded-lg border border-border-soft col-span-2">
              <span className="text-muted-text text-[11px] block">{t.chat.paymentMethodLabel}</span>
              <span className="font-semibold text-deep-navy truncate block">
                {draft.financial?.paymentMethod || draft.incident.platform || t.chat.pending}
              </span>
            </div>
          )}

          {/* Suspect Identifiers (if any captured) */}
          {suspectSummary && (
            <div className="bg-white p-2.5 rounded-lg border border-border-soft col-span-2">
              <span className="text-muted-text text-[11px] block">{t.chat.suspectDetailsLabel}</span>
              <span className="font-semibold text-deep-navy truncate block text-[11px]">
                {suspectSummary}
              </span>
            </div>
          )}

          {/* Location */}
          {draft.incident.location && (
            <div className="bg-white p-2.5 rounded-lg border border-border-soft col-span-2">
              <span className="text-muted-text text-[11px] block">{t.chat.locationLabel}</span>
              <span className="font-semibold text-deep-navy truncate block text-[11px]">
                {draft.incident.location}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Supporting Evidence List & Management */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
            <Paperclip className="size-3.5 text-chakra-blue" aria-hidden="true" />
            <span>{t.chat.evidenceSectionTitle}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-chakra-blue bg-blue-50 px-2 py-0.5 rounded-pill border border-blue-100">
              {evidenceCount}
            </span>
            {onOpenEvidence && (
              <button
                type="button"
                onClick={onOpenEvidence}
                aria-label={t.chat.addEvidenceBtn}
                className="text-[11px] font-semibold text-chakra-blue hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="size-3" />
                <span>{t.chat.addEvidenceBtn}</span>
              </button>
            )}
          </div>
        </div>

        {evidenceCount === 0 ? (
          <div className="bg-white p-2.5 rounded-lg border border-border-soft text-xs text-muted-text">
            <span>{t.evidence.noEvidenceAttached}</span>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {draft.evidence.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-border-soft text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getFileIcon(item.name)}
                  <span className="font-medium text-deep-navy truncate max-w-[140px] sm:max-w-[170px]" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-[10px] text-muted-text shrink-0">({item.mockSize})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeEvidenceItem(item.id)}
                  aria-label={t.evidence.removeFileAria.replace('{fileName}', item.name)}
                  title={t.evidence.removeFileAria.replace('{fileName}', item.name)}
                  className="text-muted-text hover:text-alert-red p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Citizen / Complainant Details */}
      <div className="bg-white p-3 rounded-lg border border-border-soft space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
          <User className="size-3.5 text-chakra-blue" aria-hidden="true" />
          <span>{t.chat.complainantLabel}</span>
        </span>
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="font-semibold text-deep-navy">{complainantName}</span>
          <span className="text-muted-text">{complainantMobile}</span>
        </div>
      </div>

      {/* Preview CTA Button & Validation Tooltip */}
      <div className="pt-1 space-y-1.5">
        <Button
          variant={isDraftComplete ? 'primary' : 'secondary'}
          size="md"
          disabled={!isDraftComplete}
          onClick={() => navigate('/preview')}
          rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
          className={`w-full font-bold text-xs shadow-2xs ${
            isDraftComplete
              ? 'bg-saffron text-deep-navy hover:bg-[#E67E17]'
              : 'bg-mist text-muted-text opacity-70 cursor-not-allowed border-border-soft'
          }`}
        >
          {t.chat.previewBtn}
        </Button>

        {!isDraftComplete && (
          <p className="text-[11px] text-muted-text text-center flex items-center justify-center gap-1">
            <Info className="size-3 text-muted-text shrink-0" aria-hidden="true" />
            <span>{t.chat.previewDisabledTooltip}</span>
          </p>
        )}
      </div>
    </div>
  );

  // Mobile Collapsible Bottom Drawer
  if (isMobileDrawer) {
    return (
      <div className="lg:hidden border-t border-border-soft bg-white shadow-lg">
        {/* Toggle Bar */}
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          aria-expanded={mobileExpanded}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-deep-navy bg-mist/80 hover:bg-mist transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-chakra-blue" aria-hidden="true" />
            <span>
              {mobileExpanded
                ? t.chat.mobileSummaryCollapse
                : t.chat.mobileSummaryToggle}
            </span>
            {draft.category && (
              <span className="px-2 py-0.5 rounded-pill bg-blue-100 text-chakra-blue text-[10px] font-bold">
                {categoryLabel}
              </span>
            )}
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                isDraftComplete
                  ? 'bg-green-100 text-india-green'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {progressPercent}%
            </span>
          </div>
          {mobileExpanded ? (
            <ChevronDown className="size-4 text-muted-text" />
          ) : (
            <ChevronUp className="size-4 text-muted-text" />
          )}
        </button>

        {/* Expandable Content */}
        {mobileExpanded && <div className="p-4 border-t border-border-soft">{content}</div>}
      </div>
    );
  }

  // Desktop Static Sidebar Panel
  return (
    <aside
      className={`rounded-2xl border border-border-soft bg-white/90 p-5 shadow-xs flex flex-col gap-4 ${className}`}
      aria-label={t.chat.summaryPanelTitle}
      data-testid="complaint-summary-panel"
    >
      <div className="flex items-center justify-between pb-3 border-b border-border-soft">
        <div>
          <h2 className="text-sm font-bold text-deep-navy flex items-center gap-2">
            <FileText className="size-4 text-chakra-blue" aria-hidden="true" />
            <span>{t.chat.summaryPanelTitle}</span>
          </h2>
          <span className="text-[11px] text-muted-text">
            {t.chat.summaryPanelSubtitle}
          </span>
        </div>
        <div className="size-2 rounded-full bg-india-green animate-pulse" title="Live sync" />
      </div>

      {content}
    </aside>
  );
};
