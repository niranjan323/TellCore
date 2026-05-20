import { CalendarDays, Sparkles, Stethoscope } from 'lucide-react';
import type { SummaryResponse } from '../../types/contracts';
import { ScrollReveal } from '../ui/ScrollReveal';

interface SummaryViewProps {
  summary: SummaryResponse;
}

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SummaryView({ summary }: SummaryViewProps) {
  const sections = summary.sections.slice().sort((a, b) => a.order - b.order);

  return (
    <article className="relative overflow-hidden rounded-[20px] bg-surface p-7 shadow-sm md:p-12">
      {/* Letterhead band */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-primary" />
      <div
        className="absolute inset-0 -z-10 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='1' seed='5'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>\")",
        }}
        aria-hidden
      />

      {/* Letterhead */}
      <header className="mb-8 border-b border-border pb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
              <Stethoscope className="h-3.5 w-3.5" aria-hidden />
              PreDoc · Visit Summary
            </p>
            <h1 className="mt-4 text-[28px] font-semibold leading-[1.08] tracking-tight text-text-primary md:text-[40px]">
              {summary.title}
            </h1>
            {summary.subtitle && (
              <p className="mt-2 text-base text-text-secondary md:text-lg">
                {summary.subtitle}
              </p>
            )}
          </div>
          {summary.isAiGenerated && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary-light/70 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-primary-dark">
              <Sparkles className="h-3 w-3" aria-hidden />
              AI organised
            </span>
          )}
        </div>
        <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.22em] text-text-hint">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          {formatLongDate(summary.generatedAt)}
        </p>
      </header>

      {/* Sections — each scroll-reveal staggered */}
      <div className="flex flex-col" data-stagger>
        {sections.map((section, idx) => (
          <ScrollReveal
            key={section.key}
            variant="rise"
            index={idx}
            className={
              idx > 0
                ? 'border-t border-border pt-6 mt-6'
                : ''
            }
          >
            <div className="flex items-baseline gap-3">
              <span className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-text-hint">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-dark">
                {section.title}
              </h2>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[15.5px] leading-relaxed text-text-primary md:text-[16px]">
              {section.body}
            </p>
          </ScrollReveal>
        ))}
      </div>

      {/* Signature line */}
      <div className="mt-10 flex items-end justify-between border-t border-border pt-5">
        <p className="font-display text-[13px] uppercase tracking-[0.32em] text-text-hint">
          Page 1 of 1
        </p>
        <p className="font-semibold text-primary-dark">PreDoc</p>
      </div>

      {summary.disclaimer && (
        <p className="mt-6 text-[11.5px] leading-relaxed text-text-hint">
          {summary.disclaimer}
        </p>
      )}
    </article>
  );
}
