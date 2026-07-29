import { STATS_BAR } from "../content/landing-content"
import RevealDiv from "../components/reveal"

const StatsBar = () => {
  return (
    <section
      className="py-10 md:py-12 px-6 font-sans bg-brand-mint border-y border-brand-pale/40"
      aria-label="Platform statistics"
    >
      <div className="max-w-7xl mx-auto">
        <RevealDiv>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {STATS_BAR.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center gap-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/80 border border-brand-pale/60 flex items-center justify-center text-brand-accent shadow-sm">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-brand-charcoal tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-brand-steel max-w-[140px]">
                    {stat.label}
                  </p>
                </div>
              )
            })}
          </div>
        </RevealDiv>
      </div>
    </section>
  )
}

export default StatsBar
