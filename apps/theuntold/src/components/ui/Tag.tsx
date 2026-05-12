interface TagProps {
  label: string;
  tone?: 'soft' | 'solid' | 'gold';
}

const tones: Record<NonNullable<TagProps['tone']>, string> = {
  soft: 'bg-primary-light text-primary-dark',
  solid: 'bg-primary text-surface',
  gold: 'bg-accent/30 text-primary-dark',
};

export function Tag({ label, tone = 'soft' }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
