import { useEffect, useState } from 'react';

interface StatCounterProps {
  value: number;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
}

/** Animated number that ticks up from 0 to `value` over `durationMs`. */
export function StatCounter({
  value,
  durationMs = 900,
  format = (n) => n.toLocaleString(),
  className,
}: StatCounterProps) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className={className}>{format(n)}</span>;
}
