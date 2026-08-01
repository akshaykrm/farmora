import { Star } from "lucide-react"
import { TESTIMONIALS } from "../content/landing-content"
import SectionHeader from "../components/section-header"
import RevealDiv from "../components/reveal"

const Stars = () => (
  <div className="flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className="w-4 h-4 fill-current" />
    ))}
  </div>
)

const SocialProofSection = () => {
  return (
    <section className="landing-section px-6 bg-white font-sans">
      <div className="max-w-7xl mx-auto">
        <RevealDiv>
          <SectionHeader
            eyebrow="Testimonials"
            title="Loved by farm owners and managers"
            subtitle="See why livestock operators switch from spreadsheets to Farmora."
          />
        </RevealDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t, index) => (
            <RevealDiv key={t.author} delay={index * 0.06}>
              <article className="h-full rounded-2xl bg-brand-mint border border-brand-divider p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <Stars />
                <p className="text-sm text-brand-slate leading-relaxed mt-4 flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-brand-divider">
                  <div className="w-10 h-10 rounded-full bg-brand-mint text-brand-primary text-xs font-bold flex items-center justify-center">
                    {t.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-charcoal text-sm">
                      {t.author}
                    </p>
                    <p className="text-xs text-brand-steel">{t.role}</p>
                  </div>
                </div>
              </article>
            </RevealDiv>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SocialProofSection
