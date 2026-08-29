import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  FileText,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertCircle,
  ExternalLink,
  User,
  IndianRupee,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { useDraftStore, SAMPLE_DEMO_COMPLAINT } from '../store';
import { Button } from '../components/ui/Button';
import { DemoBadge } from '../components/ui/DemoBadge';
import { EmergencyBanner } from '../components/home/EmergencyBanner';
import { ComplaintDraft } from '../types';
import { getCategoryDefinition } from '../data/categories';

const SAMPLE_DEMO_ID = 'CR-2026-08-0001930';

export const TrackPage: React.FC = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { getSubmittedComplaint } = useDraftStore();

  const initialAckId =
    (location.state as { ackId?: string })?.ackId ||
    searchParams.get('id') ||
    SAMPLE_DEMO_ID;

  const [searchQuery, setSearchQuery] = useState(initialAckId);
  const [activeAckId, setActiveAckId] = useState<string | null>(initialAckId);
  const [foundComplaint, setFoundComplaint] = useState<ComplaintDraft | null>(
    null,
  );
  const [hasSearched, setHasSearched] = useState(true);
  const [isFound, setIsFound] = useState(true);

  // Initial search on mount
  useEffect(() => {
    const passedId =
      (location.state as { ackId?: string })?.ackId ||
      searchParams.get('id') ||
      SAMPLE_DEMO_ID;

    if (passedId) {
      setSearchQuery(passedId);
      performSearch(passedId);
    }
  }, [location.state, searchParams]);

  const performSearch = (idToSearch: string) => {
    const query = idToSearch.trim();
    setHasSearched(true);

    if (!query) {
      setActiveAckId('');
      setFoundComplaint(null);
      setIsFound(false);
      return;
    }

    const normalized = query.toUpperCase();
    const result = getSubmittedComplaint(normalized);

    if (result) {
      setActiveAckId(result.acknowledgementId || normalized);
      setFoundComplaint(result);
      setIsFound(true);
    } else if (normalized === SAMPLE_DEMO_ID) {
      setActiveAckId(SAMPLE_DEMO_ID);
      setFoundComplaint(SAMPLE_DEMO_COMPLAINT);
      setIsFound(true);
    } else {
      setActiveAckId(query);
      setFoundComplaint(null);
      setIsFound(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearch(searchQuery);
  };

  const handleUseDemoId = () => {
    setSearchQuery(SAMPLE_DEMO_ID);
    performSearch(SAMPLE_DEMO_ID);
  };

  const handleReset = () => {
    setSearchQuery('');
    setActiveAckId(null);
    setFoundComplaint(null);
    setHasSearched(false);
    setIsFound(false);
  };

  // Helper formatting for displayed complaint details
  const categoryDef = foundComplaint?.category
    ? getCategoryDefinition(foundComplaint.category)
    : undefined;

  const categoryDisplay = (() => {
    if (foundComplaint?.acknowledgementId === SAMPLE_DEMO_ID) {
      return t.track.categoryValue;
    }
    if (categoryDef) {
      const base = language === 'hi' ? categoryDef.labelHi : categoryDef.label;
      return foundComplaint?.subCategory
        ? `${base} (${foundComplaint.subCategory})`
        : base;
    }
    return t.track.categoryValue;
  })();

  const dateTimeDisplay = (() => {
    if (foundComplaint?.acknowledgementId === SAMPLE_DEMO_ID) {
      return t.track.dateTimeValue;
    }
    if (foundComplaint?.submittedAt) {
      try {
        const d = new Date(foundComplaint.submittedAt);
        return d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return foundComplaint.submittedAt;
      }
    }
    return foundComplaint?.incident.date
      ? `${foundComplaint.incident.date}${foundComplaint.incident.time ? `, ${foundComplaint.incident.time}` : ''}`
      : t.track.dateTimeValue;
  })();

  const summaryDisplay =
    foundComplaint?.acknowledgementId === SAMPLE_DEMO_ID
      ? t.track.summaryValue
      : foundComplaint?.incident.summary || t.track.summaryValue;

  const evidenceDisplay = (() => {
    if (foundComplaint?.acknowledgementId === SAMPLE_DEMO_ID) {
      return t.track.evidenceValue;
    }
    if (foundComplaint?.evidence && foundComplaint.evidence.length > 0) {
      const names = foundComplaint.evidence.map((e) => e.name).join(', ');
      return `${foundComplaint.evidence.length} ${language === 'hi' ? 'फ़ाइलें' : 'files'} (${names})`;
    }
    return language === 'hi' ? 'कोई साक्ष्य संलग्न नहीं' : '0 files attached';
  })();

  const matchPercentage = foundComplaint?.confidence
    ? Math.round(foundComplaint.confidence * 100)
    : 94;

  const matchTag =
    foundComplaint?.acknowledgementId === SAMPLE_DEMO_ID
      ? t.track.stepMatchValue
      : `${matchPercentage}% ${language === 'hi' ? 'एआई मिलान' : 'AI Match'}`;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto" data-testid="track-page">
      {/* Page Header */}
      <section
        aria-labelledby="track-page-title"
        className="rounded-lg border border-border-soft bg-white p-5 sm:p-6 lg:p-8 shadow-2xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-chakra-blue">
              {t.common.brandName} • {t.track.pageTitle}
            </span>
          </div>
          <DemoBadge size="sm" />
        </div>

        <h1
          id="track-page-title"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-deep-navy"
        >
          {t.track.pageTitle}
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-muted-text max-w-2xl leading-relaxed">
          {t.track.pageSubtitle}
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-6 space-y-3">
          <label
            htmlFor="acknowledgement-id"
            className="block text-xs sm:text-sm font-semibold text-deep-navy"
          >
            {t.track.inputLabel}
          </label>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                id="acknowledgement-id"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.track.inputPlaceholder}
                aria-label={t.track.inputLabel}
                className="w-full rounded-md border border-border-soft bg-mist/50 px-4 py-2.5 text-sm text-deep-navy placeholder:text-muted-text/70 focus:bg-white focus:border-chakra-blue focus:outline-none focus:ring-2 focus:ring-chakra-blue/20 transition-all font-mono"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Search className="size-4" aria-hidden="true" />}
              className="shrink-0"
            >
              {t.track.searchButton}
            </Button>
          </div>

          {/* Helper / Sample ID Prompt */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-text">
            <span>{t.track.demoIdPrompt}</span>
            <button
              type="button"
              onClick={handleUseDemoId}
              className="inline-flex items-center gap-1 font-mono font-bold text-chakra-blue hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100 cursor-pointer"
            >
              <Sparkles className="size-3 text-saffron" aria-hidden="true" />
              <span>{t.track.demoIdButton}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Result Status Card (Found) */}
      {hasSearched && isFound && activeAckId ? (
        <section
          role="status"
          aria-live="polite"
          aria-labelledby="tracking-result-heading"
          className="rounded-lg border border-chakra-blue/20 bg-white p-5 sm:p-6 lg:p-8 shadow-xs space-y-6"
        >
          {/* Header of Status Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-soft">
            <div>
              <span className="text-xs font-semibold text-chakra-blue uppercase tracking-wider block">
                {t.track.statusResultHeading}
              </span>
              <h2
                id="tracking-result-heading"
                className="text-lg sm:text-xl font-bold font-mono text-deep-navy"
              >
                {activeAckId}
              </h2>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-blue-50 border border-blue-200 text-chakra-blue text-xs font-bold self-start sm:self-auto">
              <Clock className="size-3.5" aria-hidden="true" />
              <span>{t.track.statusValue}</span>
            </div>
          </div>

          {/* Progress Timeline Stepper */}
          <div className="py-2">
            <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <li className="flex flex-col gap-1 p-3 rounded-md bg-emerald-50/70 border border-emerald-100 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 min-w-0">
                  <CheckCircle2 className="size-4 text-india-green shrink-0" />
                  <span className="truncate">{t.track.stepSubmitted}</span>
                </div>
                <span className="text-[11px] text-emerald-700/80 truncate">
                  {t.track.stepSubmittedDate}
                </span>
              </li>

              <li className="flex flex-col gap-1 p-3 rounded-md bg-emerald-50/70 border border-emerald-100 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 min-w-0">
                  <CheckCircle2 className="size-4 text-india-green shrink-0" />
                  <span className="truncate">{t.track.stepClassification}</span>
                </div>
                <span className="text-[11px] text-emerald-700/80 truncate">
                  {matchTag}
                </span>
              </li>

              <li className="flex flex-col gap-1 p-3 rounded-md bg-blue-50 border border-blue-200 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-chakra-blue min-w-0">
                  <Clock className="size-4 text-chakra-blue shrink-0" />
                  <span className="truncate">{t.track.stepReview}</span>
                </div>
                <span className="text-[11px] text-chakra-blue/80 truncate">
                  {t.track.stepInProgress}
                </span>
              </li>

              <li className="flex flex-col gap-1 p-3 rounded-md bg-mist/60 border border-border-soft opacity-70 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-text min-w-0">
                  <span className="size-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px] shrink-0">
                    4
                  </span>
                  <span className="truncate">{t.track.stepResolution}</span>
                </div>
                <span className="text-[11px] text-muted-text/80 truncate">
                  {t.track.stepPending}
                </span>
              </li>
            </ol>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm bg-mist/50 p-4 sm:p-5 rounded-lg border border-border-soft">
            <div>
              <span className="text-muted-text block text-xs mb-0.5">
                {t.track.categoryLabel}
              </span>
              <span className="font-semibold text-deep-navy">
                {categoryDisplay}
              </span>
            </div>

            <div>
              <span className="text-muted-text block text-xs mb-0.5">
                {t.track.dateTimeLabel}
              </span>
              <span className="font-semibold text-deep-navy">
                {dateTimeDisplay}
              </span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-border-soft/60">
              <span className="text-muted-text block text-xs mb-0.5">
                {t.track.summaryLabel}
              </span>
              <p className="text-deep-navy leading-relaxed">
                {summaryDisplay}
              </p>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-border-soft/60 flex items-center gap-2">
              <FileText className="size-4 text-chakra-blue shrink-0" aria-hidden="true" />
              <div>
                <span className="text-muted-text text-xs mr-2">
                  {t.track.evidenceLabel}:
                </span>
                <span className="font-medium text-deep-navy">
                  {evidenceDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Official Portal Notice */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950 flex items-start gap-3">
            <AlertCircle className="size-4 text-warning-amber shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <span className="font-bold block">{t.track.officialNoticeTitle}</span>
              <p className="leading-relaxed text-amber-900/90">{t.track.officialNoticeBody}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="size-3.5" aria-hidden="true" />}
            >
              {t.track.resetSearch}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/')}
              >
                {t.buttons.returnHome}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login')}
                rightIcon={<ArrowRight className="size-3.5" aria-hidden="true" />}
              >
                {t.home.startReportCta}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Result Status Card (Not Found) */}
      {hasSearched && !isFound ? (
        <section
          role="alert"
          aria-live="assertive"
          aria-labelledby="not-found-heading"
          className="rounded-lg border border-amber-200 bg-amber-50/90 p-5 sm:p-6 lg:p-8 shadow-xs space-y-5"
        >
          <div className="flex items-start gap-3.5">
            <div className="size-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-alert-red">
              <AlertCircle className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1 flex-1">
              <h2
                id="not-found-heading"
                className="text-base sm:text-lg font-bold text-deep-navy"
              >
                {t.track.notFoundTitle}
              </h2>
              <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                {t.track.notFoundBody}
              </p>
              {activeAckId ? (
                <div className="mt-2 text-xs font-mono bg-white/80 border border-amber-200 px-2.5 py-1 rounded inline-block text-deep-navy">
                  {t.track.searchedLabel}: <span className="font-semibold">{activeAckId}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-200/60">
            <Button
              variant="primary"
              size="sm"
              onClick={handleUseDemoId}
              leftIcon={<Sparkles className="size-3.5 text-deep-navy" aria-hidden="true" />}
            >
              {t.track.sampleDemoButtonText} ({SAMPLE_DEMO_ID})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="size-3.5" aria-hidden="true" />}
            >
              {t.track.resetSearch}
            </Button>
          </div>
        </section>
      ) : null}

      {/* Emergency Strip */}
      <EmergencyBanner />
    </div>
  );
};
