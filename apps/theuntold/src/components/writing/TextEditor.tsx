import { useEffect, useRef } from 'react';

interface TextEditorProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  prompt?: string | null;
  ariaLabel?: string;
  /** Optional max length — soft warning only. */
  maxLength?: number;
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

export function TextEditor({
  value,
  onChange,
  placeholder = 'Start anywhere — the first thing that comes to mind.',
  prompt,
  ariaLabel = 'Your story',
  maxLength = 4000,
}: TextEditorProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow the textarea so the page feels like one continuous page of paper.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="mx-auto max-w-story">
      {prompt && (
        <p className="mb-6 font-display text-lg italic leading-relaxed text-text-secondary">
          {prompt}
        </p>
      )}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full resize-none border-0 bg-transparent font-display text-[19px] leading-[1.75] text-text-primary outline-none placeholder:text-text-hint focus:outline-none md:text-[20px]"
        rows={10}
      />
      <div className="mt-3 flex items-center justify-between text-xs text-text-hint">
        <span>{countWords(value)} words</span>
        <span>
          {value.length} / {maxLength}
        </span>
      </div>
    </div>
  );
}
