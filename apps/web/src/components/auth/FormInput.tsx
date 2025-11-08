import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className, id, icon: Icon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label
          htmlFor={id}
          className="block text-subhead font-medium text-gray-900 dark:text-white"
        >
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "appearance-none block w-full h-11 border rounded-lg transition-all duration-quick",
              "text-subhead text-gray-900 dark:text-white",
              "placeholder-gray-400 dark:placeholder-gray-500",
              "bg-white dark:bg-gray-800",
              "border-gray-300 dark:border-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              Icon ? "pl-10 pr-3" : "px-3",
              error && "border-error focus:border-error focus:ring-error/20",
              className
            )}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${id}-error`} className="text-footnote text-error flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-footnote text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';