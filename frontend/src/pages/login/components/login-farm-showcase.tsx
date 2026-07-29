import { TrendingUp } from "lucide-react"

const KPIs = [
  { label: "Total Revenue", value: "₹24,85,200", delta: "+12.5%" },
  { label: "Total Profit", value: "₹8,45,600", delta: "+8.3%" },
  { label: "Active Farms", value: "12", delta: "+2" },
  { label: "Active Batches", value: "28", delta: "+5" },
] as const

const LoginFarmShowcase = () => {
  return (
    <div className="relative w-full max-w-lg mt-4 rounded-2xl overflow-hidden shadow-xl shadow-brand-charcoal/10 border border-brand-divider/80">
      <img
        src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80"
        alt=""
        className="w-full h-48 md:h-56 object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/50 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-auto md:max-w-[320px]">
        <div className="rounded-xl bg-white/95 backdrop-blur-sm border border-white/80 shadow-lg p-3 md:p-4">
          <p className="text-xs font-semibold text-brand-charcoal mb-2">
            Farm Overview
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {KPIs.map((kpi) => (
              <div key={kpi.label} className="min-w-0">
                <p className="text-[9px] text-brand-steel truncate">{kpi.label}</p>
                <p className="text-xs font-bold text-brand-charcoal tabular-nums truncate">
                  {kpi.value}
                </p>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-brand-accent">
                  <TrendingUp className="w-2.5 h-2.5" aria-hidden />
                  {kpi.delta}
                </span>
              </div>
            ))}
          </div>
          <div className="h-10 flex items-end gap-0.5">
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
