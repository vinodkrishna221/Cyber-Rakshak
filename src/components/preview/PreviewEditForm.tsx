import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Save,
  X,
  AlertCircle,
  Layers,
  User,
  FileText,
  IndianRupee,
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  Laptop,
} from 'lucide-react';
import { ComplaintCategory, ComplaintDraft, ComplaintSubCategory } from '../../types';
import { useTranslation, useLanguageStore } from '../../i18n';
import {
  ALL_CATEGORIES,
  getSubCategoriesByCategory,
} from '../../data/categories';
import { INDIAN_STATES } from '../../data/indianStates';
import { previewEditSchema, PreviewEditFormData } from '../../schemas/previewSchema';
import { Button } from '../ui/Button';

interface PreviewEditFormProps {
  draft: ComplaintDraft;
  onSave: (data: PreviewEditFormData) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const PreviewEditForm: React.FC<PreviewEditFormProps> = ({
  draft,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const currentLanguage = useLanguageStore((s) => s.language);
  const isHindi = currentLanguage === 'hi';

  const defaultCategory: ComplaintCategory =
    draft.category || 'financial_fraud';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PreviewEditFormData>({
    resolver: zodResolver(previewEditSchema),
    defaultValues: {
      category: defaultCategory,
      subCategoryKey: draft.subCategoryKey || '',
      complainant: {
        name: draft.complainant.name || '',
        mobile: draft.complainant.mobile || '',
        state: draft.complainant.state || 'Telangana',
      },
      incident: {
        summary: draft.incident.summary || '',
        date: draft.incident.date || '',
        time: draft.incident.time || '',
        platform: draft.incident.platform || '',
        location: draft.incident.location || '',
        description: draft.incident.description || '',
      },
      financial: {
        amountLost:
          draft.financial?.amountLost !== undefined && draft.financial.amountLost !== null
            ? draft.financial.amountLost
            : '',
        paymentMethod: draft.financial?.paymentMethod || '',
        transactionId: draft.financial?.transactionId || '',
        bankOrWallet: draft.financial?.bankOrWallet || '',
      },
      suspect: {
        phone: draft.suspect?.phone || '',
        upiId: draft.suspect?.upiId || '',
        socialHandle: draft.suspect?.socialHandle || '',
        url: draft.suspect?.url || '',
        email: draft.suspect?.email || '',
      },
    },
    mode: 'onTouched',
  });

  const selectedCategory = watch('category');
  const availableSubCategories = getSubCategoriesByCategory(selectedCategory);

  // When category changes, reset subCategoryKey if not present in new category
  useEffect(() => {
    const currentSub = watch('subCategoryKey');
    const isValidForCat = availableSubCategories.some((s) => s.key === currentSub);
    if (!isValidForCat && availableSubCategories.length > 0) {
      setValue('subCategoryKey', availableSubCategories[0].key);
    }
  }, [selectedCategory, availableSubCategories, setValue, watch]);

  // Translate validation error messages
  const getErrorMessage = (errorKey?: string): string | null => {
    if (!errorKey) return null;
    if (errorKey in t.preview.errors) {
      return t.preview.errors[errorKey as keyof typeof t.preview.errors];
    }
    return errorKey;
  };

  const hasAnyErrors = Object.keys(errors).length > 0;

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      noValidate
      aria-label="Edit Complaint Draft"
      className="bg-white rounded-2xl border border-border-soft shadow-xs overflow-hidden"
      data-testid="preview-edit-form"
    >
      {/* Edit Mode Banner */}
      <div className="bg-chakra-blue p-5 text-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t.preview.editReport}</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/80">
            {t.preview.editModeActiveNotice}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            leftIcon={<X className="size-3.5" aria-hidden="true" />}
            className="bg-white/10 text-white hover:bg-white/20 border-white/30 font-semibold"
          >
            {t.preview.cancelEdit}
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            leftIcon={<Save className="size-3.5" aria-hidden="true" />}
            className="bg-saffron text-deep-navy hover:bg-[#E67E17] font-bold shadow-xs"
          >
            {isSaving ? t.preview.savingChanges : t.preview.saveChanges}
          </Button>
        </div>
      </div>

      {hasAnyErrors && (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-6 mt-6 rounded-lg bg-red-50 border border-alert-red/30 p-3.5 flex items-center gap-2.5 text-xs text-alert-red font-medium"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{t.preview.formErrorsAlert}</span>
        </div>
      )}

      <div className="p-5 sm:p-7 space-y-6">
        {/* SECTION 1: Category & Subcategory */}
        <fieldset className="rounded-xl border border-border-soft bg-mist/40 p-4 sm:p-5 space-y-4">
          <legend className="text-xs font-bold uppercase tracking-wider text-chakra-blue px-1 flex items-center gap-2">
            <Layers className="size-4 text-chakra-blue" aria-hidden="true" />
            <span>{t.preview.categorySectionTitle}</span>
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Select */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-category-select"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.categoryLabel} <span className="text-alert-red">*</span>
              </label>
              <select
                id="edit-category-select"
                aria-invalid={errors.category ? 'true' : 'false'}
                {...register('category')}
                className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-xs sm:text-sm text-deep-navy focus:border-chakra-blue focus:outline-none"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {isHindi ? cat.labelHi : cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p role="alert" className="text-xs text-alert-red font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3 shrink-0" />
                  <span>{getErrorMessage(errors.category.message)}</span>
                </p>
              )}
            </div>

            {/* Sub-Category Select */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-subcategory-select"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.subCategoryLabel}
              </label>
              <select
                id="edit-subcategory-select"
                {...register('subCategoryKey')}
                className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-xs sm:text-sm text-deep-navy focus:border-chakra-blue focus:outline-none"
              >
                {availableSubCategories.map((sub) => (
                  <option key={sub.key} value={sub.key}>
                    {isHindi ? sub.labelHi : sub.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* SECTION 2: Complainant Details */}
        <fieldset className="rounded-xl border border-border-soft bg-white p-4 sm:p-5 space-y-4 shadow-2xs">
          <legend className="text-xs font-bold uppercase tracking-wider text-chakra-blue px-1 flex items-center gap-2">
            <User className="size-4 text-chakra-blue" aria-hidden="true" />
            <span>{t.preview.complainantSectionTitle}</span>
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Complainant Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-complainant-name"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.citizenNameLabel}
              </label>
              <input
                id="edit-complainant-name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                {...register('complainant.name')}
                className="w-full rounded-md border border-border-soft bg-mist/30 px-3 py-2 text-xs sm:text-sm text-deep-navy focus:bg-white focus:border-chakra-blue focus:outline-none"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-complainant-mobile"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.mobileNumberLabel}
              </label>
              <input
                id="edit-complainant-mobile"
                type="tel"
                placeholder="e.g. 9876543210"
                aria-invalid={errors.complainant?.mobile ? 'true' : 'false'}
                {...register('complainant.mobile')}
                className={`w-full rounded-md border px-3 py-2 text-xs sm:text-sm font-mono text-deep-navy focus:bg-white focus:outline-none ${
                  errors.complainant?.mobile
                    ? 'border-alert-red bg-red-50/40'
                    : 'border-border-soft bg-mist/30 focus:border-chakra-blue'
                }`}
              />
              {errors.complainant?.mobile && (
                <p role="alert" className="text-xs text-alert-red font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3 shrink-0" />
                  <span>{getErrorMessage(errors.complainant.mobile.message)}</span>
                </p>
              )}
            </div>

            {/* State Select */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-complainant-state"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.stateLabel} <span className="text-alert-red">*</span>
              </label>
              <select
                id="edit-complainant-state"
                aria-invalid={errors.complainant?.state ? 'true' : 'false'}
                {...register('complainant.state')}
                className={`w-full rounded-md border px-3 py-2 text-xs sm:text-sm text-deep-navy focus:bg-white focus:outline-none ${
                  errors.complainant?.state
                    ? 'border-alert-red bg-red-50/40'
                    : 'border-border-soft bg-mist/30 focus:border-chakra-blue'
                }`}
              >
                <option value="">-- {t.login.statePlaceholder} --</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st.id} value={st.nameEn}>
                    {isHindi ? st.nameHi : st.nameEn}
                  </option>
                ))}
              </select>
              {errors.complainant?.state && (
                <p role="alert" className="text-xs text-alert-red font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3 shrink-0" />
                  <span>{getErrorMessage(errors.complainant.state.message)}</span>
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* SECTION 3: Incident Details */}
        <fieldset className="rounded-xl border border-border-soft bg-white p-4 sm:p-5 space-y-4 shadow-2xs">
          <legend className="text-xs font-bold uppercase tracking-wider text-chakra-blue px-1 flex items-center gap-2">
            <FileText className="size-4 text-chakra-blue" aria-hidden="true" />
            <span>{t.preview.incidentSectionTitle}</span>
          </legend>

          {/* Incident Summary */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-incident-summary"
              className="block text-xs font-semibold text-deep-navy"
            >
              {t.preview.incidentSummaryLabel} <span className="text-alert-red">*</span>
            </label>
            <textarea
              id="edit-incident-summary"
              rows={3}
              placeholder={t.preview.incidentSummaryHelp}
              aria-invalid={errors.incident?.summary ? 'true' : 'false'}
              {...register('incident.summary')}
              className={`w-full rounded-md border p-3 text-xs sm:text-sm text-deep-navy focus:bg-white focus:outline-none ${
                errors.incident?.summary
                  ? 'border-alert-red bg-red-50/40'
                  : 'border-border-soft bg-mist/30 focus:border-chakra-blue'
              }`}
            />
            {errors.incident?.summary && (
              <p role="alert" className="text-xs text-alert-red font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="size-3 shrink-0" />
                <span>{getErrorMessage(errors.incident.summary.message)}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-incident-date"
                className="block text-xs font-semibold text-deep-navy flex items-center gap-1"
              >
                <Calendar className="size-3 text-chakra-blue" />
                <span>{t.preview.dateLabel}</span>
              </label>
              <input
                id="edit-incident-date"
                type="text"
                placeholder="e.g. 28 Aug 2026 or Today"
                {...register('incident.date')}
                className="w-full rounded-md border border-border-soft bg-mist/30 px-3 py-2 text-xs sm:text-sm text-deep-navy focus:bg-white focus:border-chakra-blue focus:outline-none"
              />
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-incident-time"
                className="block text-xs font-semibold text-deep-navy flex items-center gap-1"
              >
                <Clock className="size-3 text-chakra-blue" />
                <span>{t.preview.timeLabel}</span>
              </label>
              <input
                id="edit-incident-time"
                type="text"
                placeholder="e.g. 04:30 PM"
                {...register('incident.time')}
                className="w-full rounded-md border border-border-soft bg-mist/30 px-3 py-2 text-xs sm:text-sm text-deep-navy focus:bg-white focus:border-chakra-blue focus:outline-none"
              />
            </div>

            {/* Platform */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-incident-platform"
                className="block text-xs font-semibold text-deep-navy flex items-center gap-1"
              >
                <Laptop className="size-3 text-chakra-blue" />
                <span>{t.preview.platformLabel}</span>
              </label>
              <input
                id="edit-incident-platform"
                type="text"
                placeholder="e.g. Phone call + UPI, Instagram, WhatsApp"
                {...register('incident.platform')}
                className="w-full rounded-md border border-border-soft bg-mist/30 px-3 py-2 text-xs sm:text-sm text-deep-navy focus:bg-white focus:border-chakra-blue focus:outline-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5 sm:col-span-3">
              <label
                htmlFor="edit-incident-location"
                className="block text-xs font-semibold text-deep-navy flex items-center gap-1"
              >
                <MapPin className="size-3 text-chakra-blue" />
                <span>{t.preview.locationLabel}</span>
              </label>
              <input
                id="edit-incident-location"
                type="text"
                placeholder="e.g. Hyderabad, Telangana"
                {...register('incident.location')}
                className="w-full rounded-md border border-border-soft bg-mist/30 px-3 py-2 text-xs sm:text-sm text-deep-navy focus:bg-white focus:border-chakra-blue focus:outline-none"
              />
            </div>

            {/* Additional Description */}
            <div className="space-y-1.5 sm:col-span-3">
              <label
                htmlFor="edit-incident-desc"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.descriptionLabel}
              </label>
              <textarea
                id="edit-incident-desc"
                rows={2}
                placeholder="Additional background, suspect actions, or sequence of events..."
                {...register('incident.description')}
                className="w-full rounded-md border border-border-soft bg-mist/30 p-3 text-xs sm:text-sm text-deep-navy focus:bg-white focus:border-chakra-blue focus:outline-none"
              />
            </div>
          </div>
        </fieldset>

        {/* SECTION 4: Financial Details */}
        <fieldset className="rounded-xl border border-red-200 bg-red-50/20 p-4 sm:p-5 space-y-4 shadow-2xs">
          <legend className="text-xs font-bold uppercase tracking-wider text-alert-red px-1 flex items-center gap-2">
            <IndianRupee className="size-4 text-alert-red" aria-hidden="true" />
            <span>{t.preview.financialSectionTitle}</span>
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Amount Lost */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-financial-amount"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.amountLostLabel}
              </label>
              <input
                id="edit-financial-amount"
                type="text"
                placeholder="e.g. 25000"
                aria-invalid={errors.financial?.amountLost ? 'true' : 'false'}
                {...register('financial.amountLost')}
                className={`w-full rounded-md border px-3 py-2 text-xs sm:text-sm text-deep-navy focus:bg-white focus:outline-none ${
                  errors.financial?.amountLost
                    ? 'border-alert-red bg-red-50/40'
                    : 'border-border-soft bg-white focus:border-chakra-blue'
                }`}
              />
              {errors.financial?.amountLost && (
                <p role="alert" className="text-xs text-alert-red font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3 shrink-0" />
                  <span>{getErrorMessage(errors.financial.amountLost.message)}</span>
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-financial-method"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.paymentMethodLabel}
              </label>
              <input
                id="edit-financial-method"
                type="text"
                placeholder="e.g. UPI, Net Banking, Credit Card"
                {...register('financial.paymentMethod')}
                className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-xs sm:text-sm text-deep-navy focus:border-chakra-blue focus:outline-none"
              />
            </div>

            {/* Transaction ID */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-financial-txid"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.transactionIdLabel}
              </label>
              <input
                id="edit-financial-txid"
                type="text"
                placeholder="e.g. UTR123456789012"
                {...register('financial.transactionId')}
                className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-xs sm:text-sm font-mono text-deep-navy focus:border-chakra-blue focus:outline-none"
              />
            </div>

            {/* Bank or Wallet */}
            <div className="space-y-1.5 sm:col-span-3">
              <label
                htmlFor="edit-financial-bank"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.bankWalletLabel}
              </label>
              <input
                id="edit-financial-bank"
                type="text"
                placeholder="e.g. State Bank of India / Google Pay"
                {...register('financial.bankOrWallet')}
                className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-xs sm:text-sm text-deep-navy focus:border-chakra-blue focus:outline-none"
              />
            </div>
          </div>
        </fieldset>

        {/* SECTION 5: Suspect Details */}
        <fieldset className="rounded-xl border border-border-soft bg-white p-4 sm:p-5 space-y-4 shadow-2xs">
          <legend className="text-xs font-bold uppercase tracking-wider text-chakra-blue px-1 flex items-center gap-2">
            <AlertTriangle className="size-4 text-warning-amber" aria-hidden="true" />
            <span>{t.preview.suspectSectionTitle}</span>
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Suspect Phone */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-suspect-phone"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.suspectPhoneLabel}
              </label>
              <input
                id="edit-suspect-phone"
                type="text"
                placeholder="e.g. +91 98765 00000"
                {...register('suspect.phone')}
                className="w-full rounded-md border border-border-soft bg-mist/30 px-3 py-2 text-xs sm:text-sm font-mono text-deep-navy focus:bg-white focus:border-chakra-blue focus:outline-none"
              />
            </div>

            {/* Suspect UPI ID */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-suspect-upi"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.suspectUpiLabel}
              </label>
              <input
                id="edit-suspect-upi"
                type="text"
                placeholder="e.g. fraudster@okhdfcbank"
                {...register('suspect.upiId')}
                className="w-full rounded-md border border-border-soft bg-mist/30 px-3 py-2 text-xs sm:text-sm font-mono text-deep-navy focus:bg-white focus:border-chakra-blue focus:outline-none"
              />
            </div>

            {/* Suspect Handle */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-suspect-handle"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.suspectHandleLabel}
              </label>
              <input
                id="edit-suspect-handle"
                type="text"
                placeholder="e.g. @fake_bank_helper"
                {...register('suspect.socialHandle')}
                className="w-full rounded-md border border-border-soft bg-mist/30 px-3 py-2 text-xs sm:text-sm text-deep-navy focus:bg-white focus:border-chakra-blue focus:outline-none"
              />
            </div>

            {/* Suspect Website / URL */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-suspect-url"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.suspectUrlLabel}
              </label>
              <input
                id="edit-suspect-url"
                type="text"
                placeholder="e.g. https://fake-portal-login.in"
                aria-invalid={errors.suspect?.url ? 'true' : 'false'}
                {...register('suspect.url')}
                className={`w-full rounded-md border px-3 py-2 text-xs sm:text-sm font-mono text-deep-navy focus:bg-white focus:outline-none ${
                  errors.suspect?.url
                    ? 'border-alert-red bg-red-50/40'
                    : 'border-border-soft bg-mist/30 focus:border-chakra-blue'
                }`}
              />
              {errors.suspect?.url && (
                <p role="alert" className="text-xs text-alert-red font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3 shrink-0" />
                  <span>{getErrorMessage(errors.suspect.url.message)}</span>
                </p>
              )}
            </div>

            {/* Suspect Email */}
            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor="edit-suspect-email"
                className="block text-xs font-semibold text-deep-navy"
              >
                {t.preview.suspectEmailLabel}
              </label>
              <input
                id="edit-suspect-email"
                type="email"
                placeholder="e.g. support@fake-claims.com"
                aria-invalid={errors.suspect?.email ? 'true' : 'false'}
                {...register('suspect.email')}
                className={`w-full rounded-md border px-3 py-2 text-xs sm:text-sm font-mono text-deep-navy focus:bg-white focus:outline-none ${
                  errors.suspect?.email
                    ? 'border-alert-red bg-red-50/40'
                    : 'border-border-soft bg-mist/30 focus:border-chakra-blue'
                }`}
              />
              {errors.suspect?.email && (
                <p role="alert" className="text-xs text-alert-red font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3 shrink-0" />
                  <span>{getErrorMessage(errors.suspect.email.message)}</span>
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Bottom Save & Cancel Button Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border-soft">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="w-full sm:w-auto font-semibold"
          >
            {t.preview.cancelEdit}
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            leftIcon={<Save className="size-4" aria-hidden="true" />}
            className="w-full sm:w-auto font-bold bg-saffron text-deep-navy hover:bg-[#E67E17] shadow-xs"
          >
            {isSaving ? t.preview.savingChanges : t.preview.saveChanges}
          </Button>
        </div>
      </div>
    </form>
  );
};
