import { useTheme } from "../store/theme/context"

type BrandLogoVariant = "onDark" | "onLight" | "mark"

type BrandLogoProps = {
  variant?: BrandLogoVariant
  className?: string
  priority?: boolean
}

const LOGO_SRC: Record<BrandLogoVariant, string> = {
  onLight: "/farmora-logo.png",
  onDark: "/farmora-mark.png",
  mark: "/farmora-mark.png",
}

const BrandLogo = ({
  variant = "onLight",
  className = "",
  priority = false,
}: BrandLogoProps) => {
  const { mode } = useTheme()

  const effective: BrandLogoVariant =
    variant === "mark"
      ? "mark"
      : mode === "dark"
        ? "onDark"
        : "onLight"

  const defaultHeights: Record<BrandLogoVariant, string> = {
    onDark: "h-10 sm:h-11 w-auto max-w-[140px]",
    onLight: "h-14 sm:h-16 md:h-[4.25rem] w-auto max-w-[min(100%,280px)]",
    mark: "h-10 w-10 sm:h-11 sm:w-11",
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
