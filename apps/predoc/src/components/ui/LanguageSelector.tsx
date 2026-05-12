import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  es: 'Español',
};

export function LanguageSelector({
  value,
  options,
  onChange,
  ariaLabel = 'Language',
}: LanguageSelectorProps) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-md border bg-surface px-2.5 py-1.5 text-sm text-text-secondary">
      <Globe className="h-4 w-4 text-text-hint" aria-hidden />
      <span className="sr-only">{ariaLabel}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {LANGUAGE_NAMES[opt] ?? opt.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
