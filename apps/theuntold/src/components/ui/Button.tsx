import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-[15px] font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-surface hover:bg-primary-dark active:bg-primary-dark shadow-sm',
  secondary:
    'bg-primary-light text-primary-dark hover:bg-primary-light/70 border border-transparent',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary',
  gold:
    'bg-accent text-primary-dark hover:bg-accent/85 active:bg-accent/85 shadow-sm font-semibold',
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        base,
        variants[variant],
        fullWidth ? 'w-full' : '',
        className ?? '',
      ].join(' ')}
    >
      {loading ? <Spinner size="sm" /> : leadingIcon}
      <span>{label}</span>
      {!loading && trailingIcon}
    </button>
  );
}
