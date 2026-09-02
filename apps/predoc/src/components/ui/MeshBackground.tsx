interface MeshBackgroundProps {
  /** Tone presets that read on PreDoc's calm-green palette. */
  variant?: 'aurora' | 'breath';
}

export function MeshBackground({ variant = 'aurora' }: MeshBackgroundProps) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className={`mesh-bg mesh-${variant} absolute inset-0`} />
      <div className="absolute inset-0 bg-gradient-to-b from-surface/0 via-surface/40 to-surface" />
      <div className="absolute inset-0 mix-blend-soft-light opacity-50 bg-noise" />
    </div>
  );
}
