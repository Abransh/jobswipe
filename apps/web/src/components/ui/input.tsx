import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Premium Input Component
 * Apple-level aesthetic for form inputs
 *
 * Design Principles:
 * - Clarity: Clean, unambiguous appearance
 * - Feedback: Clear focus and error states
 * - Accessibility: Proper labels and ARIA
 * - Consistency: Unified with button sizing
 */

const inputVariants = cva(
  [
    // Base styles
    'flex w-full',
    'font-regular text-body',
    'text-gray-900 dark:text-white',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'bg-white dark:bg-gray-900',
    'border border-gray-300 dark:border-gray-700',
    'rounded-lg',
    'transition-all duration-quick ease-out',
    // Focus state
    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
    'dark:focus:ring-primary/30 dark:focus:border-primary',
    // Disabled state
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800',
    // File input
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    // Autofill styles
    'autofill:shadow-[inset_0_0_0_1000px_rgb(255,255,255)]',
    'dark:autofill:shadow-[inset_0_0_0_1000px_rgb(17,24,39)]',
  ],
  {
    variants: {
      size: {
        sm: 'h-9 px-3 py-2 text-footnote',
        default: 'h-11 px-4 py-3',
        lg: 'h-12 px-4 py-3 text-callout',
      },
      variant: {
        default: '',
        error: 'border-error focus:ring-error/20 focus:border-error',
        success: 'border-success focus:ring-success/20 focus:border-success',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
  helperText?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      size,
      variant,
      error,
      helperText,
      label,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-subhead font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper for icons */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ size, variant: finalVariant }),
              {
                'pl-10': leftIcon,
                'pr-10': rightIcon,
              },
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper text or error message */}
        {(helperText || error) && (
          <p
            className={cn(
              'mt-1.5 text-footnote',
              hasError
                ? 'text-error dark:text-error'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
