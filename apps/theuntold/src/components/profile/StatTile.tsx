interface StatTileProps {
  value: string | number;
  label: string;
}

export function StatTile({ value, label }: StatTileProps) {
  return (
    <div className="rounded-md border bg-surface p-4 text-center">
      <div className="font-display text-2xl font-semibold text-text-primary md:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-text-hint">
        {label}
      </div>
    </div>
  );
}
