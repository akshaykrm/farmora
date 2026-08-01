import { HOW_IT_WORKS_STEPS } from "../content/landing-content"
import SectionHeader from "../components/section-header"
import RevealDiv from "../components/reveal"

const HowItWorksSection = () => {
  return (
    <section className="landing-section px-6 bg-brand-card font-sans">
      <div className="max-w-7xl mx-auto">
        <RevealDiv>
          <SectionHeader
            eyebrow="How it works"
            title="From farm setup to investor-ready reports"
            subtitle="A clear workflow your team can follow—whether you run one shed or many farms."
          />
        </RevealDiv>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {HOW_IT_WORKS_STEPS.map((item, index) => (
            <RevealDiv key={item.step} delay={index * 0.08} className="relative">
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-2rem)] h-0.5 bg-brand-canvas"
                  aria-hidden
                />
              )}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-accent text-white text-xl font-bold mb-4 shadow-md shadow-brand-accent/25">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-brand-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-brand-ink-soft leading-relaxed">
                  {item.description}
                </p>
              </div>
            </RevealDiv>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
