import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Premium Button Component
 * Apple-level aesthetic with psychological UI/UX principles
 *
 * Design Principles:
 * - Clarity: Clear visual hierarchy
 * - Deference: Subtle, non-intrusive
 * - Depth: Layered shadows and states
 * - Feedback: Instant visual response
 * - Accessibility: WCAG AA compliant
 */

const buttonVariants = cva(
  [
    // Base styles
    'inline-flex items-center justify-center',
    'font-medium text-subhead',
    'whitespace-nowrap',
    'transition-all duration-quick ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
    // Premium touch target (min 44x44 for accessibility)
    'min-h-[44px]',
    // Active state (pressed feel)
    'active:scale-[0.96]',
  ],
  {
    variants: {
      variant: {
        // Primary: Apple blue, prominent CTA
        default: [
          'bg-primary text-white',
          'hover:bg-primary/90',
          'shadow-card hover:shadow-elevated',
          'dark:bg-primary dark:hover:bg-primary/90',
        ],

        // Destructive: Apple red, dangerous actions
        destructive: [
          'bg-error text-white',
          'hover:bg-error/90',
          'shadow-card hover:shadow-elevated',
          'dark:bg-error dark:hover:bg-error/90',
        ],

        // Outline: Minimal, secondary actions
        outline: [
          'border border-gray-300 dark:border-gray-700',
          'bg-transparent',
          'text-gray-900 dark:text-white',
          'hover:bg-gray-50 dark:hover:bg-gray-800',
          'shadow-minimal hover:shadow-card',
        ],

        // Secondary: Subtle background
        secondary: [
          'bg-gray-100 dark:bg-gray-800',
          'text-gray-900 dark:text-white',
          'hover:bg-gray-200 dark:hover:bg-gray-700',
          'shadow-minimal',
        ],

        // Ghost: Invisible until hover
        ghost: [
          'bg-transparent',
          'text-gray-700 dark:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'hover:text-gray-900 dark:hover:text-white',
        ],

        // Link: Text-only button
        link: [
          'bg-transparent',
          'text-primary',
          'underline-offset-4',
          'hover:underline',
          'hover:text-primary/80',
          'shadow-none',
        ],

        // Success: Apple green
        success: [
          'bg-success text-white',
          'hover:bg-success/90',
          'shadow-card hover:shadow-elevated',
          'dark:bg-success dark:hover:bg-success/90',
        ],

        // Premium: Gradient with purple accent
        premium: [
          'bg-gradient-to-r from-primary to-purple',
          'text-white',
          'hover:shadow-premium',
          'shadow-elevated',
        ],
      },

      size: {
        // Small: Compact, secondary actions
        sm: [
          'h-9',
          'px-3',
          'text-footnote',
          'rounded-md',
        ],

        // Default: Most common size
        default: [
          'h-11',
          'px-6',
          'text-subhead',
          'rounded-lg',
        ],

        // Large: Primary CTAs, hero sections
        lg: [
          'h-12',
          'px-8',
          'text-callout',
          'rounded-lg',
          'font-semibold',
        ],

        // Extra large: Landing page heroes
        xl: [
          'h-14',
          'px-10',
          'text-headline',
          'rounded-xl',
          'font-semibold',
        ],

        // Icon: Square button for icons
        icon: [
          'h-10',
          'w-10',
          'p-0',
          'rounded-lg',
        ],

        // Icon small
        'icon-sm': [
          'h-8',
          'w-8',
          'p-0',
          'rounded-md',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    isLoading = false,
    loadingText,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            {/* Premium loading spinner */}
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            <span>{loadingText || 'Loading...'}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
