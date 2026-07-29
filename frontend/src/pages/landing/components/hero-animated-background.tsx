/** Soft decorative background for white hero (mockup-style) */

const HeroAnimatedBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-white" aria-hidden>
      <div
        className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-brand-accent/10 blur-3xl"
        style={{ animation: "hero-drift 28s ease-in-out infinite" }}
      />
      <div
        className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-brand-primary/8 blur-3xl"
        style={{ animation: "hero-drift 32s ease-in-out infinite reverse" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-96 h-48 rounded-full bg-brand-mint blur-2xl opacity-80"
      />
      <div className="hero-grid absolute inset-0 opacity-[0.35]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-brand-surface/50 pointer-events-none" />
    </div>
  )
}

export default HeroAnimatedBackground
