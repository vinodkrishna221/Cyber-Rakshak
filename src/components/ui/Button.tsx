import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'emergency' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'pill';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-saffron text-deep-navy hover:bg-[#E87E14] active:bg-[#D4700E] shadow-sm border border-transparent font-semibold focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2',
  secondary:
    'bg-white text-chakra-blue hover:bg-mist active:bg-blue-50 border-2 border-chakra-blue font-semibold focus-visible:ring-2 focus-visible:ring-chakra-blue focus-visible:ring-offset-2',
  emergency:
    'bg-alert-red text-white hover:bg-[#B71C1C] active:bg-[#991515] shadow-sm border border-transparent font-semibold focus-visible:ring-2 focus-visible:ring-alert-red focus-visible:ring-offset-2',
  outline:
    'bg-transparent text-deep-navy hover:bg-mist border border-border-soft font-medium focus-visible:ring-2 focus-visible:ring-chakra-blue focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-deep-navy hover:bg-mist active:bg-blue-50/50 border border-transparent font-medium focus-visible:ring-2 focus-visible:ring-chakra-blue focus-visible:ring-offset-2',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-sm gap-1.5 min-h-[32px]',
  md: 'text-sm px-4 py-2 rounded-md gap-2 min-h-[40px]',
  lg: 'text-base px-6 py-3 rounded-md font-semibold gap-2.5 min-h-[48px]',
  pill: 'text-sm px-5 py-2 rounded-pill font-semibold gap-2 min-h-[40px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading ? true : undefined}
        className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...rest}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon && <span className="shrink-0 inline-flex" aria-hidden="true">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0 inline-flex" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
