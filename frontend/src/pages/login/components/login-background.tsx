/** Login page backdrop — light gray, dot grid, soft leaf shapes */

const LoginBackground = () => (
  <div
    className="pointer-events-none absolute inset-0 z-0 bg-brand-canvas"
    aria-hidden
  >
    <div className="hero-grid absolute inset-0 opacity-40" />
    <div
      className="absolute top-[8%] left-[42%] w-64 h-64 rounded-full bg-brand-accent/8 blur-3xl"
      style={{ animation: "hero-drift 28s ease-in-out infinite" }}
    />
    <svg
      className="absolute top-[18%] right-[8%] w-24 h-24 text-brand-accent/15 rotate-12"
      viewBox="0 0 64 64"
      fill="currentColor"
    >
      <path d="M32 4C20 28 8 36 8 48c0 8 10 12 24 12s24-4 24-12c0-12-12-20-24-44z" />
    </svg>
    <svg
      className="absolute bottom-[22%] left-[6%] w-20 h-20 text-brand-primary/12 -rotate-45"
      viewBox="0 0 64 64"
      fill="currentColor"
    >
      <path d="M32 4C20 28 8 36 8 48c0 8 10 12 24 12s24-4 24-12c0-12-12-20-24-44z" />
    </svg>
    <svg
      className="absolute bottom-[35%] right-[28%] w-16 h-16 text-brand-accent/10 rotate-6"
      viewBox="0 0 64 64"
      fill="currentColor"
    >
      <path d="M32 4C20 28 8 36 8 48c0 8 10 12 24 12s24-4 24-12c0-12-12-20-24-44z" />
    </svg>
  </div>
)

export default LoginBackground
