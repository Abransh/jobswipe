import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Premium Badge Component
 * Apple-level aesthetic for labels, tags, and status indicators
 *
 * Design Principles:
 * - Minimal: Small, unobtrusive
 * - Contextual: Color conveys meaning
 * - Readable: High contrast text
 * - Consistent: Unified appearance
 */

const badgeVariants = cva(
  [
    // Base styles
    'inline-flex items-center justify-center',
    'font-medium',
    'whitespace-nowrap',
    'transition-all duration-quick ease-out',
    'border',
  ],
  {
    variants: {
      variant: {
        // Default: Neutral gray
        default: [
          'bg-gray-100 dark:bg-gray-800',
          'text-gray-700 dark:text-gray-300',
          'border-gray-200 dark:border-gray-700',
        ],

        // Primary: Brand accent
        primary: [
          'bg-primary/10 dark:bg-primary/20',
          'text-primary dark:text-primary',
          'border-primary/20 dark:border-primary/30',
        ],

        // Success: Green for positive states
        success: [
          'bg-success-light dark:bg-success/20',
          'text-success dark:text-success',
          'border-success/20 dark:border-success/30',
        ],

        // Warning: Orange for caution
        warning: [
          'bg-warning-light dark:bg-warning/20',
          'text-warning dark:text-warning',
          'border-warning/20 dark:border-warning/30',
        ],

        // Error: Red for negative states
        error: [
          'bg-error-light dark:bg-error/20',
          'text-error dark:text-error',
          'border-error/20 dark:border-error/30',
        ],

        // Purple: Premium/special
        purple: [
          'bg-purple-light dark:bg-purple/20',
          'text-purple dark:text-purple',
          'border-purple/20 dark:border-purple/30',
        ],

        // Outline: Transparent with border
        outline: [
          'bg-transparent',
          'text-gray-700 dark:text-gray-300',
          'border-gray-300 dark:border-gray-600',
        ],

        // Solid primary: Filled with brand color
        solid: [
          'bg-primary',
          'text-white',
          'border-primary',
        ],
      },

      size: {
        // Small: Compact tags
        sm: [
          'text-caption',
          'px-2',
          'py-0.5',
          'rounded-sm',
          'h-5',
        ],

        // Default: Standard size
        default: [
          'text-footnote',
          'px-3',
          'py-1',
          'rounded-md',
          'h-6',
        ],

        // Large: Prominent badges
        lg: [
          'text-subhead',
          'px-4',
          'py-1.5',
          'rounded-lg',
          'h-8',
        ],
      },

      // Interactive badges (clickable/removable)
      interactive: {
        true: [
          'cursor-pointer',
          'hover:opacity-80',
          'active:scale-95',
        ],
      },

      // Dot indicator (small colored dot)
      dot: {
        true: [
          'pl-2',
          'before:content-[""]',
          'before:w-1.5',
          'before:h-1.5',
          'before:rounded-full',
          'before:mr-1.5',
          'before:inline-block',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: false,
      dot: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, interactive, dot, onRemove, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, interactive: interactive || !!onRemove, dot }),
          className
        )}
        {...props}
      >
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 -mr-1 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Remove"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M9 3L3 9M3 3L9 9"
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

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
