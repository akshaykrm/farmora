import { WHY_CHOOSE_FARMORA } from "../content/landing-content"
import SectionHeader from "../components/section-header"
import RevealDiv from "../components/reveal"

const WhyChooseSection = () => {
  return (
    <section className="landing-section px-6 bg-brand-mint font-sans">
      <div className="max-w-7xl mx-auto">
        <RevealDiv>
          <SectionHeader
            eyebrow="Why Farmora"
            title="Why choose Farmora for your livestock business"
            subtitle="Automation, clarity, and tools designed for farms that measure profit batch by batch."
          />
        </RevealDiv>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {WHY_CHOOSE_FARMORA.map((item, index) => {
            const Icon = item.icon
            return (
              <RevealDiv key={item.title} delay={index * 0.05}>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-brand-divider shadow-sm flex items-center justify-center text-brand-accent mb-3">
                    <Icon className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-semibold text-brand-charcoal mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-steel leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </RevealDiv>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseSection
