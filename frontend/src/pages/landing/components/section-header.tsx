type SectionHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: "center" | "left"
  className?: string
}

const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
}: SectionHeaderProps) => {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left"

  return (
    <div className={`max-w-3xl mb-12 md:mb-16 ${alignClass} ${className}`}>
      {eyebrow && (
        <span className="inline-block text-brand-accent font-semibold text-sm tracking-wider uppercase mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-charcoal mb-4 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-brand-steel leading-relaxed">{subtitle}</p>
      )}
    </div>
  )
}

export default SectionHeader
