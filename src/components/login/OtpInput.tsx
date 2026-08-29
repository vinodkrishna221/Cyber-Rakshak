import React, { useRef, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  ariaDescribedBy?: string;
  autoFocus?: boolean;
  id?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  ariaDescribedBy,
  autoFocus = false,
  id = 'otp-input',
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of length characters
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleMultipleDigits = (pasted: string, startIndex: number = 0) => {
    // Extract 6-digit code or all digits
    const match6 = pasted.match(/\b\d{6}\b/);
    const onlyDigits = match6 ? match6[0] : pasted.replace(/\D/g, '');
    if (!onlyDigits) return;

    const actualStart = onlyDigits.length >= length ? 0 : Math.min(startIndex, value.length);
    const newDigits = [...digits];
    for (let i = 0; i < onlyDigits.length && actualStart + i < length; i++) {
      newDigits[actualStart + i] = onlyDigits[i];
    }
    const newOtp = newDigits.join('');
    onChange(newOtp);

    const nextIndex = Math.min(actualStart + onlyDigits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    inputRefs.current[nextIndex]?.select();

    if (newOtp.length === length && onComplete) {
      onComplete(newOtp);
    }
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleanDigits = rawVal.replace(/\D/g, '');

    if (rawVal === '') {
      // Empty / cleared
      const newDigits = [...digits];
      newDigits[index] = '';
      const newOtp = newDigits.join('');
      onChange(newOtp);
      return;
    }

    if (!cleanDigits) {
      // Non-numeric characters entered (e.g. letters/symbols) - ignore without clearing
      return;
    }

    // If no new digit was entered (e.g. user typed a non-digit character into a box that had a digit)
    if (cleanDigits === digits[index]) {
      return;
    }

    // If single digit replaced an existing digit (input value became length 2)
    if (cleanDigits.length === 2 && digits[index]) {
      let replacement = cleanDigits[1];
      if (cleanDigits[0] !== digits[index]) {
        replacement = cleanDigits[0];
      }
      const newDigits = [...digits];
      newDigits[index] = replacement;
      const newOtp = newDigits.join('');
      onChange(newOtp);

      if (newOtp.length === length && onComplete) {
        onComplete(newOtp);
      }

      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
        inputRefs.current[index + 1]?.select();
      }
      return;
    }

    if (cleanDigits.length > 1) {
      // Multiple digits entered (e.g. mobile SMS autofill or multi-digit paste)
      handleMultipleDigits(cleanDigits, index);
      return;
    }

    // Single digit entered
    const singleDigit = cleanDigits.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    const newOtp = newDigits.join('');
    onChange(newOtp);

    if (newOtp.length === length && onComplete) {
      onComplete(newOtp);
    }

    // Move to next input if available
    if (index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is empty, back up to previous and clear it
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else if (digits[index]) {
        // Clear current
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'Delete') {
      if (digits[index]) {
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    } else if (e.key === 'Home') {
      e.preventDefault();
      inputRefs.current[0]?.focus();
      inputRefs.current[0]?.select();
    } else if (e.key === 'End') {
      e.preventDefault();
      const targetIdx = Math.min(value.length, length - 1);
      inputRefs.current[targetIdx]?.focus();
      inputRefs.current[targetIdx]?.select();
    }
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handleMultipleDigits(pastedData, index);
  };

  return (
    <div
      role="group"
      aria-label={`One-time password (${length} digits)`}
      className="flex items-center justify-between gap-2 sm:gap-3 w-full"
      id={`${id}-group`}
    >
      {digits.map((digit, idx) => (
        <input
          key={idx}
          id={idx === 0 ? id : `${id}-${idx}`}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length}
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={(e) => handlePaste(idx, e)}
          onFocus={(e) => {
            e.target.select();
          }}
          onClick={(e) => {
            (e.target as HTMLInputElement).select();
          }}
          aria-label={`Digit ${idx + 1} of ${length}`}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ariaDescribedBy}
          className={`size-11 sm:size-13 text-center text-lg sm:text-xl font-bold font-mono rounded-md border transition-all
            ${
              hasError
                ? 'border-alert-red bg-red-50/50 text-alert-red focus:border-alert-red focus:ring-2 focus:ring-alert-red/30'
                : 'border-border-soft bg-mist/50 text-deep-navy focus:bg-white focus:border-chakra-blue focus:ring-2 focus:ring-chakra-blue/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
            focus:outline-none`}
        />
      ))}
    </div>
  );
};
