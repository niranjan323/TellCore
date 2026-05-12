import { Sparkles } from 'lucide-react';
import type { SummaryResponse } from '../../types/contracts';

interface SummaryViewProps {
  summary: SummaryResponse;
}

export function SummaryView({ summary }: SummaryViewProps) {
  return (
    <article className="rounded-lg bg-surface p-6 shadow-sm md:p-10">
      <header className="mb-6 border-b pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
          {summary.title}
        </h1>
        {summary.subtitle && (
          <p className="mt-1.5 text-sm text-text-secondary">{summary.subtitle}</p>
        )}
        {summary.isAiGenerated && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary-light px-2.5 py-1 text-xs font-medium text-primary-dark">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            AI-organised
          </div>
        )}
      </header>

      <div className="flex flex-col">
        {summary.sections
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((section, idx) => (
            <section
              key={section.key}
              className={idx > 0 ? 'border-t pt-5 mt-5' : ''}
            >
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-hint">
                {section.title}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-text-primary">
                {section.body}
              </p>
            </section>
          ))}
      </div>

      {summary.disclaimer && (
        <p className="mt-8 text-xs leading-relaxed text-text-hint">
          {summary.disclaimer}
        </p>
      )}
    </article>
  );
}
