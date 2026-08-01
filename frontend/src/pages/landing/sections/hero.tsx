import { Play } from "lucide-react"
import HeroAnimatedBackground from "../components/hero-animated-background"
import HeroMainDashboard from "../components/hero-main-dashboard"
import { gradients as brandGradients } from "../../../theme/tokens"
import { useEffect, useState } from "react"
import { Menu, X, ArrowRight } from "lucide-react"
import { Button } from "@mui/material"
import { useNavigate } from "react-router"
import BrandLogo from "@components/brand-logo"

interface HeroSectionProps {
  onScrollToFeatures: () => void
  onScrollToPreview: () => void
  onScrollToPackages: () => void
  onScrollToTestimonials: () => void
  onScrollToContact: () => void
}

const TRUST_AVATARS = ["RP", "PS", "AM", "KN", "+"]

const HeroSection = ({
  onScrollToFeatures,
  onScrollToPreview,
  onScrollToPackages,
  onScrollToTestimonials,
  onScrollToContact,
}: HeroSectionProps) => {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinkClass =
    "text-brand-ink-soft hover:text-brand-ink transition-colors text-sm font-medium"

  const navItems = [
    { label: "Features", action: onScrollToFeatures },
    { label: "Pricing", action: onScrollToPackages },
    { label: "About", action: onScrollToTestimonials },
    { label: "Contact", action: onScrollToContact },
  ]

  return (
    <div className="relative w-full overflow-hidden font-sans bg-brand-card">
      <HeroAnimatedBackground />

      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-brand-card/95 backdrop-blur-md shadow-sm border-b border-brand-border"
            : "bg-brand-card/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-2 md:py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="shrink-0"
            aria-label="Scroll to top"
          >
            <BrandLogo variant="onLight" priority />
          </button>

          <div className="hidden md:flex items-center gap-5 lg:gap-6">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className={navLinkClass}
              >
                {item.label}
              </button>
            ))}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={onScrollToPackages}
              sx={{
                background: brandGradients.cta,
                "&:hover": {
                  background: "linear-gradient(90deg, #2E7D32 0%, #1B5E20 100%)",
                },
              }}
            >
              Get Started
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden text-brand-ink p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-brand-card border-t border-brand-border px-6 py-4 space-y-3 shadow-lg">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.action()
                  setMobileMenuOpen(false)
                }}
                className={`block w-full text-left py-2 ${navLinkClass}`}
              >
                {item.label}
              </button>
            ))}
            <Button
              variant="outlined"
              fullWidth
              size="small"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              variant="contained"
              fullWidth
              size="small"
              onClick={() => {
                onScrollToPackages()
                setMobileMenuOpen(false)
              }}
            >
              Get Started
            </Button>
          </div>
        )}
      </div>

      <div className="relative z-10 pt-24 md:pt-28 pb-12 md:pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-ink mb-6 leading-tight animate-fade-in-up">
            Modern farm management for{" "}
            <span className="text-brand-accent">smarter livestock</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-ink-soft mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-1">
            Manage multiple farms, batches, and seasons—track costs and sales,
            auto-calculate P&amp;L and cost per kg, and share investor profit
            from one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-2">
            <Button
              variant="contained"
              size="large"
              onClick={onScrollToPackages}
              endIcon={<ArrowRight size={18} />}
              sx={{
                background: brandGradients.cta,
                "&:hover": {
                  background: "linear-gradient(90deg, #2E7D32 0%, #1B5E20 100%)",
                },
              }}
            >
              Start free trial
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={onScrollToPreview}
              startIcon={<Play size={18} className="fill-brand-accent/20" />}
            >
              Watch demo
            </Button>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up animate-delay-3">
            <div className="flex -space-x-2">
              {TRUST_AVATARS.map((initials, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white bg-brand-canvas text-[10px] font-semibold text-brand-primary flex items-center justify-center shadow-sm"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-brand-ink-soft">
              Trusted by livestock operators across India
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto mt-12 md:mt-16 px-0 md:px-4 animate-fade-in-up animate-delay-3">
          <HeroMainDashboard />
        </div>
      </div>
    </div>
  )
}

export default HeroSection
