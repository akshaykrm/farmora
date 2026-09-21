import { useRef, useEffect } from "react"
import { useLocation } from "react-router"
import HeroSection from "./sections/hero"
import FeaturesSection from "./sections/features"
import StatsBar from "./sections/stats-bar"
import ProductPreviewSection from "./sections/product-preview"
import WhyChooseSection from "./sections/why-choose"
import HowItWorksSection from "./sections/how-it-works"
import SocialProofSection from "./sections/social-proof"
import PackagesSection from "./sections/packages"
import FinalCTA from "./sections/final-cta"
import ContactSection from "./sections/contact"
import Footer from "./sections/footer"

const LandingPage = () => {
  const featuresRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const howRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const packagesRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (location.hash === "#features") {
      setTimeout(() => scrollToSection(featuresRef), 100)
    } else if (location.hash === "#how-it-works") {
      setTimeout(() => scrollToSection(howRef), 100)
    } else if (location.hash === "#packages") {
      setTimeout(() => scrollToSection(packagesRef), 100)
    } else if (location.hash === "#contact") {
      setTimeout(() => scrollToSection(contactRef), 100)
    } else if (location.hash === "#preview") {
      setTimeout(() => scrollToSection(previewRef), 100)
    } else if (location.hash === "#about") {
      setTimeout(() => scrollToSection(testimonialsRef), 100)
    }
  }, [location])

  return (
    <div className="min-h-screen">
      <HeroSection
        onScrollToFeatures={() => scrollToSection(featuresRef)}
        onScrollToPreview={() => scrollToSection(previewRef)}
        onScrollToPackages={() => scrollToSection(packagesRef)}
        onScrollToTestimonials={() => scrollToSection(testimonialsRef)}
        onScrollToContact={() => scrollToSection(contactRef)}
      />
      <div ref={featuresRef} id="features">
        <FeaturesSection />
      </div>
      <StatsBar />
      <div ref={previewRef}>
        <ProductPreviewSection />
      </div>
      <WhyChooseSection />
      <div ref={howRef} id="how-it-works">
        <HowItWorksSection />
      </div>
      <div ref={testimonialsRef} id="about">
        <SocialProofSection />
      </div>
      <div ref={packagesRef} id="packages">
        <PackagesSection />
      </div>
      <FinalCTA onScrollToPackages={() => scrollToSection(packagesRef)} />
      <div ref={contactRef} id="contact">
        <ContactSection />
      </div>
      <Footer />
    </div>
  )
}

export default LandingPage
