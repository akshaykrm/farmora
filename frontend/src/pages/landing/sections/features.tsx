import { LANDING_FEATURES } from "../content/landing-content"
import SectionHeader from "../components/section-header"
import FeatureCard from "../components/feature-card"
import RevealDiv from "../components/reveal"

const FeaturesSection = () => {
  return (
    <section className="landing-section px-6 bg-brand-card font-sans">
      <div className="max-w-7xl mx-auto">
        <RevealDiv>
          <SectionHeader
            eyebrow="Features"
            title="Everything you need to manage your farm efficiently"
            subtitle="From multi-farm operations to investor-ready reports—Farmora connects batches, seasons, and money in one system."
          />
        </RevealDiv>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {LANDING_FEATURES.map((feature, index) => (
            <RevealDiv key={feature.title} delay={index * 0.05}>
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                group={feature.group}
              />
            </RevealDiv>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
