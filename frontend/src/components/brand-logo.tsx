import { useTheme } from "../store/theme/context"

type BrandLogoVariant = "onDark" | "onLight" | "mark"

type BrandLogoProps = {
  variant?: BrandLogoVariant
  className?: string
  priority?: boolean
}

const LOGO_SRC: Record<BrandLogoVariant, string> = {
  onLight: "/logo.svg",
  onDark: "/logo-on-dark.svg",
  mark: "/logo-mark.svg",
}

const BrandLogo = ({
  variant = "onLight",
  className = "",
  priority = false,
}: BrandLogoProps) => {
  const { mode } = useTheme()

  // Auto-flip light/dark lockups with the active theme; mark stays the same.
  const effective: BrandLogoVariant =
    variant === "mark"
      ? "mark"
      : mode === "dark"
        ? "onDark"
        : "onLight"

  const defaultHeights: Record<BrandLogoVariant, string> = {
    onDark: "h-14 sm:h-16 md:h-[4.5rem] w-auto max-w-[min(100%,220px)]",
    onLight: "h-16 sm:h-[4.5rem] w-auto max-w-[240px]",
    mark: "h-12 w-auto max-w-[140px]",
  }

  return (
    <img
      src={LOGO_SRC[effective]}
      alt="Farmora — Farm Accounting & Management"
      className={`object-contain object-left ${defaultHeights[effective]} ${className}`.trim()}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  )
}

export default BrandLogo
