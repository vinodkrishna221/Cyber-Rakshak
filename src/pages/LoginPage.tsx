import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldCheck,
  Smartphone,
  MapPin,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ChevronLeft,
  KeyRound,
} from 'lucide-react';
import { useTranslation, useLanguageStore } from '../i18n';
import { INDIAN_STATES } from '../data/indianStates';
import { useDraftStore } from '../store';
import { Button } from '../components/ui/Button';
import { DemoBadge } from '../components/ui/DemoBadge';
import { EmergencyBanner } from '../components/home/EmergencyBanner';
import { OtpInput } from '../components/login/OtpInput';

// Helper to normalize mobile number by stripping whitespace, hyphens, parentheses, plus, and leading +91 / 91 / 0
export function normalizeMobileNumber(value: string): string {
  let clean = value.replace(/[\s\-().]/g, '');
  if (clean.startsWith('+91')) {
    clean = clean.slice(3);
  } else if (clean.startsWith('91') && clean.length === 12) {
    clean = clean.slice(2);
  }
  if (clean.startsWith('0') && clean.length === 11) {
    clean = clean.slice(1);
  }
  return clean.replace(/\D/g, '');
}

const mobileStepSchema = z.object({
  mobile: z
    .string()
    .refine((val) => val.trim().length > 0, 'mobileRequired')
    .refine((val) => {
      const normalized = normalizeMobileNumber(val);
      return /^[6-9]\d{9}$/.test(normalized);
    }, 'mobileInvalid'),
  state: z
    .string()
    .min(1, 'stateRequired')
    .refine((val) => val.trim().length > 0, 'stateRequired'),
});

type MobileStepFormData = z.infer<typeof mobileStepSchema>;

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const currentLanguage = useLanguageStore((s) => s.language);
  const navigate = useNavigate();
  const { setComplainant, setGuestComplainant, updateDraft } = useDraftStore();

  // Multi-step flow state
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [submittedMobile, setSubmittedMobile] = useState('');
  const [submittedState, setSubmittedState] = useState('');

  // Step 2 OTP State
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendNotification, setResendNotification] = useState(false);

  // React Hook Form for Step 1
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MobileStepFormData>({
    resolver: zodResolver(mobileStepSchema),
    defaultValues: {
      mobile: '',
      state: '',
    },
    mode: 'onTouched',
  });

  const selectedStateValue = watch('state');

  // Handle Step 1 submission
  const handleMobileSubmit = (data: MobileStepFormData) => {
    const normalizedMobile = normalizeMobileNumber(data.mobile);
    setSubmittedMobile(normalizedMobile);
    setSubmittedState(data.state);
    setOtpValue('');
    setOtpError(null);
    setResendNotification(false);
    setStep('otp');
  };

  // Handle Step 2 OTP Verification
  const handleOtpVerify = (otpToVerify?: string) => {
    if (isVerifying) return;
    const code = (otpToVerify ?? otpValue).trim();
    if (!code) {
      setOtpError('otpRequired');
      return;
    }
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setOtpError('otpInvalidLength');
      return;
    }
    if (code !== '123456') {
      setOtpError('otpIncorrect');
      return;
    }

    // Deterministic valid OTP (123456)
    setOtpError(null);
    setIsVerifying(true);

    // Persist details and language to Zustand store
    setComplainant({
      mobile: submittedMobile,
      state: submittedState,
      isGuest: false,
    });
    updateDraft({ language: currentLanguage });

    // Navigate to /chat
    navigate('/chat');
  };

  // Handle Guest Mode continuation
  const handleGuestLogin = () => {
    if (isVerifying) return;
    setGuestComplainant(submittedState || selectedStateValue || 'Telangana');
    updateDraft({ language: currentLanguage });
    navigate('/chat');
  };

  // Handle Resend OTP (Demo mock action)
  const handleResendOtp = () => {
    if (isVerifying) return;
    setResendNotification(true);
    setOtpError(null);
    setTimeout(() => {
      setResendNotification(false);
    }, 4000);
  };

  // Quick fill helper for demo prototype
  const handleQuickFill = () => {
    if (isVerifying) return;
    setOtpValue('123456');
    setOtpError(null);
  };

  // Resolve dynamic error message for active language
  const getErrorMessage = (errorKey: string | undefined): string | null => {
    if (!errorKey) return null;
    if (errorKey in t.login.errors) {
      return t.login.errors[errorKey as keyof typeof t.login.errors];
    }
    return errorKey;
  };

  // Format mobile for display (+91 98765 43210)
  const formatDisplayMobile = (mobile: string): string => {
    if (mobile.length === 10) {
      return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
    }
    return `+91 ${mobile}`;
  };

  // Localized state display helper
  const getDisplayState = (stateName: string): string => {
    if (!stateName) return '';
    const matched = INDIAN_STATES.find((s) => s.nameEn === stateName);
    if (matched && currentLanguage === 'hi') return matched.nameHi;
    return stateName;
  };

  return (
    <div className="flex flex-col gap-8 max-w-xl mx-auto w-full py-4 sm:py-8">
      {/* Main Login Card */}
      <div className="rounded-lg border border-border-soft bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header with Title and Demo Badge */}
        <div className="space-y-3 pb-2 border-b border-border-soft/60">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-chakra-blue inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-chakra-blue" aria-hidden="true" />
              <span>{t.common.brandName}</span>
            </span>
            <DemoBadge size="sm" />
          </div>

          <div>
            <h1
              id="login-title"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-deep-navy"
            >
              {t.login.pageTitle}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-text leading-relaxed">
              {t.login.pageSubtitle}
            </p>
          </div>

          {/* Stepper indicator */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-text mb-1.5">
              <span className={step === 'mobile' ? 'text-chakra-blue font-bold' : 'text-india-green'}>
                {step === 'otp' ? '✓ ' + t.login.step1Title : t.login.step1Title}
              </span>
              <span className={step === 'otp' ? 'text-chakra-blue font-bold' : 'text-muted-text/70'}>
                {t.login.step2Title}
              </span>
            </div>
            <div className="w-full bg-mist h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full bg-chakra-blue transition-all duration-300 ${
                  step === 'mobile' ? 'w-1/2' : 'w-full'
                }`}
              />
            </div>
          </div>
        </div>

        {/* STEP 1: Mobile & State Entry Form */}
        {step === 'mobile' ? (
          <form
            onSubmit={handleSubmit(handleMobileSubmit)}
            noValidate
            aria-labelledby="login-title"
            className="space-y-5"
          >
            {/* Mobile Number Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="mobile-input"
                className="block text-xs sm:text-sm font-semibold text-deep-navy"
              >
                {t.login.mobileLabel} <span className="text-alert-red" aria-hidden="true">*</span>
              </label>

              <div className="relative flex rounded-md shadow-2xs">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border-soft bg-mist text-deep-navy font-mono text-xs sm:text-sm font-semibold select-none">
                  🇮🇳 +91
                </span>
                <input
                  id="mobile-input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={20}
                  placeholder={t.login.mobilePlaceholder}
                  aria-invalid={errors.mobile ? 'true' : 'false'}
                  aria-describedby={
                    errors.mobile ? 'mobile-error' : 'mobile-help'
                  }
                  {...register('mobile')}
                  className={`block w-full min-w-0 flex-1 rounded-none rounded-r-md border px-3 py-2.5 text-xs sm:text-sm text-deep-navy font-mono placeholder:text-muted-text/60 focus:bg-white focus:outline-none transition-all ${
                    errors.mobile
                      ? 'border-alert-red bg-red-50/40 focus:border-alert-red focus:ring-2 focus:ring-alert-red/20'
                      : 'border-border-soft bg-mist/30 focus:border-chakra-blue focus:ring-2 focus:ring-chakra-blue/20'
                  }`}
                />
              </div>

              {errors.mobile ? (
                <div
                  id="mobile-error"
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-1.5 text-xs font-medium text-alert-red mt-1"
                >
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{getErrorMessage(errors.mobile.message)}</span>
                </div>
              ) : (
                <p id="mobile-help" className="text-[11px] text-muted-text">
                  {t.login.mobileHelp}
                </p>
              )}
            </div>

            {/* Indian State Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="state-select"
                className="block text-xs sm:text-sm font-semibold text-deep-navy"
              >
                {t.login.stateLabel} <span className="text-alert-red" aria-hidden="true">*</span>
              </label>

              <div className="relative">
                <select
                  id="state-select"
                  aria-invalid={errors.state ? 'true' : 'false'}
                  aria-describedby={errors.state ? 'state-error' : undefined}
                  {...register('state')}
                  className={`block w-full rounded-md border px-3 py-2.5 text-xs sm:text-sm text-deep-navy focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer ${
                    errors.state
                      ? 'border-alert-red bg-red-50/40 focus:border-alert-red focus:ring-2 focus:ring-alert-red/20'
                      : 'border-border-soft bg-mist/30 focus:border-chakra-blue focus:ring-2 focus:ring-chakra-blue/20'
                  }`}
                >
                  <option value="">-- {t.login.statePlaceholder} --</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st.id} value={st.nameEn}>
                      {currentLanguage === 'hi' ? st.nameHi : st.nameEn}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-text" aria-hidden="true">
                  <MapPin className="size-4 text-muted-text" />
                </div>
              </div>

              {errors.state ? (
                <div
                  id="state-error"
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-1.5 text-xs font-medium text-alert-red mt-1"
                >
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{getErrorMessage(errors.state.message)}</span>
                </div>
              ) : null}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
              >
                {t.login.sendOtpButton}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border-soft" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-text font-medium">
                  {t.login.guestSectionTitle}
                </span>
              </div>
            </div>

            {/* Guest Login Demo CTA */}
            <div className="rounded-md border border-dashed border-chakra-blue/30 bg-blue-50/40 p-3.5 flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <UserCheck className="size-4 text-chakra-blue shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-deep-navy block">{t.login.guestButton}</span>
                  <p className="text-muted-text leading-normal">{t.login.guestDescription}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleGuestLogin}
              >
                {t.login.guestButton}
              </Button>
            </div>
          </form>
        ) : (
          /* STEP 2: OTP Verification View Form */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOtpVerify();
            }}
            noValidate
            aria-labelledby="otp-heading"
            className="space-y-5"
          >
            {/* Mobile & State summary strip */}
            <div className="rounded-md bg-mist/70 border border-border-soft p-3 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-deep-navy">
                <Smartphone className="size-4 text-chakra-blue shrink-0" aria-hidden="true" />
                <div>
                  <span className="font-mono font-bold block">{formatDisplayMobile(submittedMobile)}</span>
                  <span className="text-muted-text text-[11px]">{getDisplayState(submittedState)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('mobile')}
                className="text-xs font-semibold text-chakra-blue hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <ChevronLeft className="size-3.5" aria-hidden="true" />
                <span>{t.login.changeDetails}</span>
              </button>
            </div>

            {/* Demo Helper Callout */}
            <div
              role="region"
              aria-label={t.login.demoOtpBadge}
              className="rounded-md border border-amber-300 bg-amber-50/90 p-3.5 text-xs text-amber-950 flex items-start justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="size-4 text-saffron shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-900 block">{t.login.demoOtpBadge}</span>
                  <p className="font-mono font-semibold text-deep-navy">
                    {t.login.demoOtpInstruction}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickFill}
                className="shrink-0 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-900 text-xs font-bold px-2.5 py-1 rounded cursor-pointer transition-colors"
              >
                {t.login.quickFillOtp}
              </button>
            </div>

            {/* Resend notification alert */}
            {resendNotification ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-md bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-900 flex items-center gap-2"
              >
                <CheckCircle2 className="size-4 text-india-green shrink-0" aria-hidden="true" />
                <span className="font-medium">{t.login.resendOtpSuccess}</span>
              </div>
            ) : null}

            {/* OTP Entry Form */}
            <div className="space-y-2">
              <label
                id="otp-heading"
                htmlFor="otp-input"
                className="block text-xs sm:text-sm font-semibold text-deep-navy"
              >
                {t.login.otpLabel} <span className="text-alert-red" aria-hidden="true">*</span>
              </label>

              <OtpInput
                id="otp-input"
                value={otpValue}
                onChange={(val) => {
                  setOtpValue(val);
                  if (otpError) setOtpError(null);
                }}
                onComplete={(val) => handleOtpVerify(val)}
                hasError={Boolean(otpError)}
                ariaDescribedBy={otpError ? 'otp-error' : 'otp-hint'}
                autoFocus={true}
                disabled={isVerifying}
              />

              {otpError ? (
                <div
                  id="otp-error"
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-1.5 text-xs font-medium text-alert-red mt-1.5"
                >
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{getErrorMessage(otpError)}</span>
                </div>
              ) : (
                <p id="otp-hint" className="text-[11px] text-muted-text">
                  {t.login.otpHint}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isVerifying}
                leftIcon={<KeyRound className="size-4" aria-hidden="true" />}
              >
                {isVerifying ? t.login.verifyingButton : t.login.verifyButton}
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1 font-semibold text-chakra-blue hover:underline cursor-pointer"
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  <span>{t.login.resendOtpButton}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('mobile')}
                  className="font-medium text-muted-text hover:text-deep-navy cursor-pointer"
                >
                  {t.buttons.back}
                </button>
              </div>
            </div>

            {/* Guest login alternative in Step 2 */}
            <div className="pt-3 border-t border-border-soft flex items-center justify-center">
              <button
                type="button"
                onClick={handleGuestLogin}
                className="text-xs font-semibold text-muted-text hover:text-chakra-blue underline cursor-pointer"
              >
                {t.login.guestButton}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security & Privacy Notice */}
      <section
        aria-labelledby="security-notice-title"
        className="rounded-lg border border-border-soft bg-mist/60 p-4 sm:p-5 flex items-start gap-3.5"
      >
        <ShieldCheck className="size-5 text-chakra-blue shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <h2 id="security-notice-title" className="text-xs sm:text-sm font-bold text-deep-navy">
            {t.login.securityTitle}
          </h2>
          <p className="text-xs text-muted-text leading-relaxed">
            {t.login.securityDescription}
          </p>
        </div>
      </section>

      {/* Emergency Helpline Banner */}
      <EmergencyBanner />
    </div>
  );
};
