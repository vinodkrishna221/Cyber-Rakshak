import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { useDraftStore } from '../store';
import { ComplaintPreviewCard, PreviewEditForm } from '../components/preview';
import { PreviewEditFormData } from '../schemas/previewSchema';
import { EmergencyBanner } from '../components/home/EmergencyBanner';
import { Button } from '../components/ui/Button';
import { DemoBadge } from '../components/ui/DemoBadge';
import { getSubCategoryDefinition } from '../data/categories';
import { ComplaintCategory, ComplaintSubCategory } from '../types';

export const PreviewPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { draft, classification, updateDraft, submitComplaint } = useDraftStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [declarationError, setDeclarationError] = useState<string | null>(null);

  // If draft has no summary at all, provide a sample fallback or option to return to chat
  const hasDraftContent = Boolean(
    draft.incident.summary ||
      draft.category ||
      classification?.category ||
      draft.complainant.mobile,
  );

  // Handle saving form edits back to Zustand store
  const handleSaveEdit = (formData: PreviewEditFormData) => {
    setIsSaving(true);

    const subCategoryDef = formData.subCategoryKey
      ? getSubCategoryDefinition(formData.subCategoryKey as ComplaintSubCategory)
      : undefined;

    const subCategoryLabel = subCategoryDef
      ? subCategoryDef.label
      : formData.subCategoryKey;

    const isEmergency = formData.category === 'financial_fraud';

    const parsedAmount =
      formData.financial?.amountLost !== undefined &&
      formData.financial.amountLost !== '' &&
      formData.financial.amountLost !== null
        ? Number(formData.financial.amountLost.toString().replace(/,/g, ''))
        : undefined;

    updateDraft({
      category: formData.category as ComplaintCategory,
      subCategory: subCategoryLabel,
      subCategoryKey: formData.subCategoryKey as ComplaintSubCategory,
      isEmergency,
      complainant: {
        ...draft.complainant,
        name: formData.complainant.name || draft.complainant.name,
        mobile: formData.complainant.mobile || draft.complainant.mobile,
        state: formData.complainant.state || draft.complainant.state,
      },
      incident: {
        ...draft.incident,
        summary: formData.incident.summary,
        date: formData.incident.date,
        time: formData.incident.time,
        platform: formData.incident.platform,
        location: formData.incident.location,
        description: formData.incident.description,
      },
      financial: {
        ...draft.financial,
        amountLost: parsedAmount,
        paymentMethod: formData.financial?.paymentMethod,
        transactionId: formData.financial?.transactionId,
        bankOrWallet: formData.financial?.bankOrWallet,
      },
      suspect: {
        ...draft.suspect,
        phone: formData.suspect?.phone,
        upiId: formData.suspect?.upiId,
        socialHandle: formData.suspect?.socialHandle,
        url: formData.suspect?.url,
        email: formData.suspect?.email,
      },
      status: 'preview_ready',
    });

    setIsSaving(false);
    setIsEditing(false);
    setSaveSuccessMessage(true);

    setTimeout(() => {
      setSaveSuccessMessage(false);
    }, 4000);
  };

  // Handle Demo Submission
  const handleSubmitDemo = () => {
    if (!declarationConfirmed) {
      setDeclarationError(t.preview.declarationRequiredError);
      return;
    }

    setDeclarationError(null);
    setIsSubmitting(true);

    const ackId = submitComplaint();

    // Navigate to success page
    navigate('/success', {
      state: { ackId },
    });
  };

  // Handle return to chat with draft intact
  const handleReturnToChat = () => {
    navigate('/chat');
  };

  // Populate sample demo draft if visited directly
  const handlePopulateSampleDraft = () => {
    updateDraft({
      category: 'financial_fraud',
      subCategory: 'UPI / Banking Fraud',
      subCategoryKey: 'upi_banking_fraud',
      confidence: 0.94,
      isEmergency: true,
      complainant: {
        name: 'Demo Citizen',
        mobile: '9876543210',
        state: 'Telangana',
        isGuest: true,
      },
      incident: {
        summary:
          'Someone called pretending to be bank customer support, tricked me into sharing an OTP, and ₹25,000 was debited via UPI.',
        date: '28 Aug 2026',
        time: '04:30 PM',
        platform: 'Phone call + UPI App',
        location: 'Hyderabad, Telangana',
        description:
          'The caller claimed my KYC had expired. Within 5 minutes of giving the OTP, I received a debit SMS from my bank.',
      },
      financial: {
        amountLost: 25000,
        paymentMethod: 'UPI (Google Pay)',
        transactionId: 'UPI-REF-987654321012',
        bankOrWallet: 'State Bank of India',
      },
      suspect: {
        phone: '+91 98765 00000',
        upiId: 'fraudster@okhdfcbank',
      },
      evidence: [
        {
          id: 'ev-demo-1',
          name: 'Bank_Debit_SMS_Alert.png',
          type: 'image/png',
          mockSize: '115 KB',
          uploadedAt: new Date().toISOString(),
        },
      ],
      status: 'preview_ready',
    });
  };

  return (
    <div
      className="max-w-5xl mx-auto w-full space-y-6 py-2 sm:py-6"
      data-testid="preview-page"
    >
      {/* Top Breadcrumbs & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border-soft">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-text">
          <button
            type="button"
            onClick={handleReturnToChat}
            className="hover:text-chakra-blue inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>{t.nav.chat}</span>
          </button>
          <span aria-hidden="true">/</span>
          <span className="text-deep-navy font-bold">{t.preview.pageTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <DemoBadge size="sm" />
        </div>
      </div>

      {/* Demo Prototype & AI Suggestion Alert Banners */}
      <div className="space-y-3">
        {/* Official Demo Prototype Disclaimer Banner */}
        <section
          aria-labelledby="demo-disclaimer-heading"
          className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 sm:p-4.5 flex items-start gap-3.5 text-xs sm:text-sm text-amber-950 shadow-2xs"
        >
          <AlertTriangle className="size-5 text-saffron shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h2 id="demo-disclaimer-heading" className="font-bold text-amber-900 leading-tight">
              {t.preview.demoWarningTitle}
            </h2>
            <p className="text-amber-950/90 leading-relaxed">
              {t.preview.demoWarningBody}
            </p>
          </div>
        </section>

        {/* AI Assistant Suggestion Guidance Notice */}
        <div className="rounded-xl border border-chakra-blue/20 bg-blue-50/60 p-3.5 sm:p-4 flex items-start gap-3 text-xs sm:text-sm text-deep-navy shadow-2xs">
          <Sparkles className="size-4.5 text-chakra-blue shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-bold text-chakra-blue block">
              {t.common.assistantName}
            </span>
            <p className="text-muted-text leading-relaxed">
              {t.preview.aiSuggestionNotice}
            </p>
          </div>
        </div>
      </div>

      {/* Save Success Alert Notification */}
      {saveSuccessMessage && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-emerald-900 flex items-center gap-3 shadow-2xs animate-fade-in"
        >
          <CheckCircle2 className="size-5 text-india-green shrink-0" aria-hidden="true" />
          <span className="font-semibold">{t.preview.changesSavedSuccess}</span>
        </div>
      )}

      {/* Empty Draft Guard / Sample Pre-fill option */}
      {!hasDraftContent ? (
        <div className="rounded-2xl border border-border-soft bg-white p-8 text-center space-y-4 shadow-xs">
          <div className="size-12 rounded-full bg-mist text-chakra-blue flex items-center justify-center mx-auto">
            <FileCheck className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-deep-navy">
              {t.preview.pageTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
              No complaint draft is currently loaded. You can start a conversation in the chat assistant or load sample demo data.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleReturnToChat}
              leftIcon={<MessageSquare className="size-4" aria-hidden="true" />}
            >
              {t.preview.returnToChat}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handlePopulateSampleDraft}
              leftIcon={<Sparkles className="size-4" aria-hidden="true" />}
            >
              Load Sample Demo Draft
            </Button>
          </div>
        </div>
      ) : isEditing ? (
        /* EDIT MODE FORM */
        <PreviewEditForm
          draft={draft}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
          isSaving={isSaving}
        />
      ) : (
        /* STRUCTURED PREVIEW CARD (VIEW MODE) */
        <ComplaintPreviewCard
          draft={draft}
          classification={classification}
          onEdit={() => setIsEditing(true)}
          onReturnToChat={handleReturnToChat}
          onSubmit={handleSubmitDemo}
          declarationConfirmed={declarationConfirmed}
          onDeclarationChange={(checked) => {
            setDeclarationConfirmed(checked);
            if (declarationError) setDeclarationError(null);
          }}
          declarationError={declarationError}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Emergency 1930 Helpline Banner at Footer */}
      <EmergencyBanner />
    </div>
  );
};
