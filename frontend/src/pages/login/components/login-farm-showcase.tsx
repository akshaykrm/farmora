import { TrendingUp } from "lucide-react"

const KPIs = [
  { label: "Total Revenue", value: "₹24,85,200", delta: "+12.5%" },
  { label: "Total Profit", value: "₹8,45,600", delta: "+8.3%" },
  { label: "Active Farms", value: "12", delta: "+2" },
  { label: "Active Batches", value: "28", delta: "+5" },
] as const

const LoginFarmShowcase = () => {
  return (
    <div className="relative mt-4 w-full max-w-lg overflow-hidden rounded-2xl border border-brand-border shadow-brand-xl">
      <img
        src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80"
        alt=""
        className="h-48 w-full object-cover md:h-56"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div className="absolute right-3 bottom-3 left-3 md:right-auto md:bottom-4 md:left-4 md:max-w-[320px]">
        <div className="rounded-xl border border-brand-border bg-brand-card/95 p-3 shadow-brand-lg backdrop-blur-sm md:p-4">
          <p className="mb-2 text-xs font-semibold text-brand-ink">
            Farm Overview
          </p>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {KPIs.map((kpi) => (
              <div key={kpi.label} className="min-w-0">
                <p className="truncate text-[9px] text-brand-ink-soft">
                  {kpi.label}
                </p>
                <p className="truncate text-xs font-bold text-brand-ink tabular-nums">
                  {kpi.value}
                </p>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-brand-accent">
                  <TrendingUp className="h-2.5 w-2.5" aria-hidden />
                  {kpi.delta}
                </span>
              </div>
            ))}
          </div>
          <div className="flex h-10 items-end gap-0.5">
            {[30, 45, 38, 55, 48, 62, 58, 72, 68, 85].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-brand-primary to-brand-accent"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginFarmShowcase
