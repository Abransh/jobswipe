import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Premium Alert Component
 * Apple-level aesthetic for notifications and messages
 *
 * Design Principles:
 * - Clear: Immediate visual hierarchy
 * - Contextual: Color indicates severity
 * - Accessible: ARIA roles and labels
 * - Dismissible: Optional close action
 */

const alertVariants = cva(
  [
    // Base styles
    'relative w-full',
    'rounded-lg border',
    'p-4',
    'transition-all duration-smooth ease-out',
    // Icon positioning
    '[&>svg~*]:pl-8',
    '[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
    '[&>svg]:h-5 [&>svg]:w-5',
  ],
  {
    variants: {
      variant: {
        // Default: Neutral information
        default: [
          'bg-gray-50 dark:bg-gray-900',
          'border-gray-200 dark:border-gray-800',
          'text-gray-900 dark:text-gray-100',
          '[&>svg]:text-gray-600 dark:[&>svg]:text-gray-400',
        ],

        // Info: Primary color for informational messages
        info: [
          'bg-primary/5 dark:bg-primary/10',
          'border-primary/20 dark:border-primary/30',
          'text-gray-900 dark:text-gray-100',
          '[&>svg]:text-primary',
        ],

        // Success: Green for positive outcomes
        success: [
          'bg-success-light dark:bg-success/10',
          'border-success/20 dark:border-success/30',
          'text-gray-900 dark:text-gray-100',
          '[&>svg]:text-success',
        ],

        // Warning: Orange for caution
        warning: [
          'bg-warning-light dark:bg-warning/10',
          'border-warning/20 dark:border-warning/30',
          'text-gray-900 dark:text-gray-100',
          '[&>svg]:text-warning',
        ],

        // Destructive: Red for errors/dangers
        destructive: [
          'bg-error-light dark:bg-error/10',
          'border-error/20 dark:border-error/30',
          'text-gray-900 dark:text-gray-100',
          '[&>svg]:text-error',
        ],

        // Purple: Premium/special announcements
        purple: [
          'bg-purple-light dark:bg-purple/10',
          'border-purple/20 dark:border-purple/30',
          'text-gray-900 dark:text-gray-100',
          '[&>svg]:text-purple',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, onDismiss, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {children}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-3 top-3 rounded-lg p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-quick"
            aria-label="Dismiss alert"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      'font-semibold text-subhead leading-tight mb-1',
      'text-gray-900 dark:text-gray-100',
      className
    )}
    {...props}
  >
    {children}
  </h5>
));

AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'text-footnote leading-relaxed',
      'text-gray-700 dark:text-gray-300',
      '[&_p]:leading-relaxed',
      className
    )}
    {...props}
  />
));

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription, alertVariants };
