import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-instagram-blue hover:bg-opacity-90 text-white',
    secondary: 'bg-primary-200 hover:bg-primary-300 dark:bg-primary-800 dark:hover:bg-primary-700 text-primary-800 dark:text-primary-200',
    outline: 'border border-primary-300 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-800 text-primary-800 dark:text-primary-200',
    ghost: 'hover:bg-primary-100 dark:hover:bg-primary-800 text-primary-800 dark:text-primary-200',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5 text-lg',
  };

  const baseClasses = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-instagram-blue inline-flex items-center justify-center';
  const disabledClasses = 'opacity-60 cursor-not-allowed';
  const iconOnlyClasses = !children ? 'p-2' : '';
  const iconClasses = icon && children ? 'mr-2' : '';

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled || isLoading ? disabledClasses : '',
    iconOnlyClasses,
    className
  );

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className={iconClasses}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}; 