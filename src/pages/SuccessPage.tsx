import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Home,
  MessageSquare,
  PhoneCall,
  Printer,
  Search,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  FileCheck,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { useDraftStore, SAMPLE_DEMO_COMPLAINT } from '../store';
import { AcknowledgementCard } from '../components/success';
import { Button } from '../components/ui/Button';
import { DemoBadge } from '../components/ui/DemoBadge';
import { EmergencyBanner } from '../components/home/EmergencyBanner';
import { ComplaintDraft } from '../types';

export const SuccessPage: React.FC = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    draft,
    latestSubmissionId,
    getSubmittedComplaint,
    resetDraft,
    updateDraft,
  } = useDraftStore();

  const [activeComplaint, setActiveComplaint] = useState<ComplaintDraft | null>(
    null,
  );

  // Determine active complaint:
  // 1. From location state ackId
  // 2. From latestSubmissionId in store
  // 3. From current draft if submitted
  // 4. Fallback to sample demo complaint if valid draft exists or pre-filled
  useEffect(() => {
    const passedAckId = (location.state as { ackId?: string })?.ackId;

    if (passedAckId) {
      const found = getSubmittedComplaint(passedAckId);
      if (found) {
        setActiveComplaint(found);
        return;
      }
    }

    if (latestSubmissionId) {
      const found = getSubmittedComplaint(latestSubmissionId);
      if (found) {
        setActiveComplaint(found);
        return;
      }
    }

    if (draft.status === 'submitted' && draft.acknowledgementId) {
      setActiveComplaint(draft);
      return;
    }

    // If draft has content but was not formally submitted, show current draft with demo ACK ID
    if (draft.incident.summary || draft.category) {
      const ackId = draft.acknowledgementId || 'CR-2026-08-0001930';
      setActiveComplaint({
        ...draft,
        acknowledgementId: ackId,
        status: 'submitted',
      });
      return;
    }

    // Default sample demo complaint
    setActiveComplaint(SAMPLE_DEMO_COMPLAINT);
  }, [location.state, latestSubmissionId, draft, getSubmittedComplaint]);

  const ackId = activeComplaint?.acknowledgementId || 'CR-2026-08-0001930';
  const isEmergency =
    activeComplaint?.category === 'financial_fraud' ||
    activeComplaint?.isEmergency ||
    Boolean(activeComplaint?.financial?.amountLost);

  const handleTrackComplaint = () => {
    navigate('/track', {
      state: { ackId },
    });
  };

  const handleStartNewReport = () => {
    resetDraft();
    navigate('/chat');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleLoadSampleDemo = () => {
    updateDraft({
      ...SAMPLE_DEMO_COMPLAINT,
    });
    setActiveComplaint(SAMPLE_DEMO_COMPLAINT);
  };

  return (
    <div
      className="max-w-5xl mx-auto w-full space-y-6 py-2 sm:py-6"
      data-testid="success-page"
    >
      {/* Top Breadcrumb & Demo Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border-soft">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-text">
          <button
            type="button"
            onClick={handleReturnHome}
            className="hover:text-chakra-blue inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Home className="size-3.5" aria-hidden="true" />
            <span>{t.nav.home}</span>
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => navigate('/preview')}
            className="hover:text-chakra-blue inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t.nav.preview}</span>
          </button>
          <span aria-hidden="true">/</span>
          <span className="text-deep-navy font-bold">{t.success.pageTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <DemoBadge size="sm" />
        </div>
      </div>

      {/* Main Page Title Header */}
      <section
        aria-labelledby="success-page-title"
        className="rounded-2xl border border-border-soft bg-white p-5 sm:p-7 shadow-2xs space-y-2"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-india-green border border-emerald-200">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            <span>{t.success.badge}</span>
          </span>
        </div>

        <h1
          id="success-page-title"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-deep-navy"
        >
          {t.success.pageTitle}
        </h1>

        <p className="text-xs sm:text-sm text-muted-text max-w-2xl leading-relaxed">
          {t.success.pageSubtitle}
        </p>
      </section>

      {/* Official Demo Prototype Warning Disclaimer Banner */}
      <section
        aria-labelledby="demo-warning-heading"
        className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 sm:p-4.5 flex items-start gap-3.5 text-xs sm:text-sm text-amber-950 shadow-2xs"
      >
        <AlertTriangle
          className="size-5 text-saffron shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <h2
            id="demo-warning-heading"
            className="font-bold text-amber-900 leading-tight"
          >
            {t.success.demoDisclaimerTitle}
          </h2>
          <p className="text-amber-950/90 leading-relaxed">
            {t.success.demoDisclaimerBody}
          </p>
        </div>
      </section>

      {/* Primary Acknowledgement Receipt Card */}
      {activeComplaint ? (
        <AcknowledgementCard complaint={activeComplaint} />
      ) : (
        <div className="rounded-2xl border border-border-soft bg-white p-8 text-center space-y-4 shadow-xs">
          <div className="size-12 rounded-full bg-mist text-chakra-blue flex items-center justify-center mx-auto">
            <FileCheck className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-deep-navy">
              {t.success.noSubmissionFoundTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
              {t.success.noSubmissionFoundBody}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleStartNewReport}
              leftIcon={<MessageSquare className="size-4" aria-hidden="true" />}
            >
              {t.success.goToChatBtn}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleLoadSampleDemo}
              leftIcon={<Sparkles className="size-4" aria-hidden="true" />}
            >
              {t.success.loadSampleBtn}
            </Button>
          </div>
        </div>
      )}

      {/* Urgent Financial Fraud Golden Hour Notice */}
      {isEmergency && (
        <section
          aria-labelledby="emergency-golden-hour-heading"
          className="rounded-2xl border-2 border-alert-red/30 bg-red-50/90 p-5 sm:p-6 text-xs sm:text-sm text-deep-navy shadow-sm space-y-3"
        >
          <div className="flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-alert-red text-white flex items-center justify-center shrink-0 shadow-2xs">
              <PhoneCall className="size-5 animate-pulse" aria-hidden="true" />
            </div>
            <div className="space-y-1 flex-1">
              <h2
                id="emergency-golden-hour-heading"
                className="text-base sm:text-lg font-bold text-alert-red"
              >
                {t.success.financialNoticeTitle}
              </h2>
              <p className="text-deep-navy/90 leading-relaxed">
                {t.success.financialNoticeBody}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-red-200/70">
            <div className="text-xs font-semibold text-alert-red">
              {t.emergency.bannerDescription}
            </div>
            <a
              href="tel:1930"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-alert-red hover:bg-alert-red/90 text-white font-bold text-xs sm:text-sm shadow-xs transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-alert-red/40"
            >
              <PhoneCall className="size-4" aria-hidden="true" />
              <span>{t.emergency.actionLabel} (1930)</span>
            </a>
          </div>
        </section>
      )}

      {/* Important Next Steps Guidance */}
      <section
        aria-labelledby="next-steps-heading"
        className="rounded-2xl border border-border-soft bg-white p-5 sm:p-6 lg:p-7 shadow-2xs space-y-4"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-chakra-blue" aria-hidden="true" />
          <h2
            id="next-steps-heading"
            className="text-base sm:text-lg font-bold text-deep-navy"
          >
            {t.success.nextStepsTitle}
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm">
          <li className="p-4 rounded-xl bg-mist/60 border border-border-soft space-y-1.5">
            <div className="size-6 rounded-full bg-blue-100 text-chakra-blue font-bold flex items-center justify-center text-xs">
              1
            </div>
            <p className="text-deep-navy leading-relaxed font-medium">
              {t.success.nextStep1}
            </p>
          </li>

          <li className="p-4 rounded-xl bg-mist/60 border border-border-soft space-y-1.5">
            <div className="size-6 rounded-full bg-blue-100 text-chakra-blue font-bold flex items-center justify-center text-xs">
              2
            </div>
            <p className="text-deep-navy leading-relaxed font-medium">
              {t.success.nextStep2}
            </p>
          </li>

          <li className="p-4 rounded-xl bg-mist/60 border border-border-soft space-y-1.5">
            <div className="size-6 rounded-full bg-blue-100 text-chakra-blue font-bold flex items-center justify-center text-xs">
              3
            </div>
            <p className="text-deep-navy leading-relaxed font-medium">
              {t.success.nextStep3}
            </p>
          </li>
        </ol>
      </section>

      {/* Primary Action Buttons */}
      <section
        aria-label="Submission Actions"
        className="rounded-2xl border border-border-soft bg-white p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-3.5"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleTrackComplaint}
            leftIcon={<Search className="size-4" aria-hidden="true" />}
            rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
          >
            {t.success.trackComplaintBtn}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleStartNewReport}
            leftIcon={<MessageSquare className="size-4" aria-hidden="true" />}
          >
            {t.success.startNewReportBtn}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handlePrint}
            leftIcon={<Printer className="size-4" aria-hidden="true" />}
          >
            {t.success.printSummaryBtn}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleReturnHome}
            leftIcon={<Home className="size-4" aria-hidden="true" />}
          >
            {t.success.returnHomeBtn}
          </Button>
        </div>
      </section>

      {/* Bottom Emergency Banner */}
      <EmergencyBanner />
    </div>
  );
};
