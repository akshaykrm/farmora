type BrandLogoVariant = "onDark" | "onLight" | "mark"

const LOGO_SRC = "/farmora-logo.png"

type BrandLogoProps = {
  variant?: BrandLogoVariant
  className?: string
  priority?: boolean
}

const BrandLogo = ({
  variant = "onLight",
  className = "",
  priority = false,
}: BrandLogoProps) => {
  const defaultHeights: Record<BrandLogoVariant, string> = {
    onDark: "h-14 sm:h-16 md:h-[4.5rem] w-auto max-w-[min(100%,220px)]",
    onLight: "h-16 sm:h-[4.5rem] w-auto max-w-[240px]",
    mark: "h-12 w-auto max-w-[140px]",
  }

  return (
    <img
      src={LOGO_SRC}
      alt="Farmora — Farm Accounting & Management"
      className={`object-contain object-left ${defaultHeights[variant]} ${className}`.trim()}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  )
}

export default BrandLogo
