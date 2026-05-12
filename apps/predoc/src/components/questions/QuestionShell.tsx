import type { ReactNode } from 'react';

interface QuestionShellProps {
  label: string;
  helpText?: string | null;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}

export function QuestionShell({
  label,
  helpText,
  required,
  children,
  htmlFor,
}: QuestionShellProps) {
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={htmlFor} className="block">
        <span className="block text-[20px] font-semibold leading-snug text-text-primary md:text-[22px]">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </span>
        {helpText && (
          <span className="mt-1.5 block text-sm text-text-secondary">{helpText}</span>
        )}
      </label>
      {children}
    </div>
  );
}
