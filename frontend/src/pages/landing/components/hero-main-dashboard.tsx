/** Wide dashboard mock for landing hero */
export function HeroMainDashboard() {
  return (
    <div className="relative w-full max-w-5xl mx-auto hero-card-float motion-reduce:animate-none select-none pointer-events-none">
      <div className="rounded-2xl md:rounded-3xl border border-brand-border bg-brand-card shadow-2xl shadow-brand-12 overflow-hidden">
        <div className="flex min-h-[260px] md:min-h-[320px]">
          <aside className="hidden sm:flex w-[120px] md:w-[140px] shrink-0 flex-col gap-2 p-3 bg-brand-canvas border-r border-brand-border self-stretch">
            <div className="h-2 w-16 rounded bg-brand-accent/30 mb-2" />
            {["Overview", "Farms", "Batches", "Reports", "Investors"].map(
              (item, i) => (
                <div
                  key={item}
                  className={`text-[9px] md:text-[10px] px-2 py-1.5 rounded-md ${
                    i === 0
                      ? "bg-brand-card font-semibold text-brand-primary shadow-sm"
                      : "text-brand-ink-soft"
                  }`}
                >
                  {item}
                </div>
              ),
            )}
          </aside>
          <div className="flex-1 p-3 md:p-5 space-y-3 md:space-y-4 bg-brand-canvas">
            <div className="flex flex-wrap gap-2 justify-between items-start">
              <div>
                <div className="h-2.5 w-28 md:w-36 rounded bg-brand-ink/15" />
                <div className="h-1.5 w-40 md:w-48 rounded bg-brand-ink-muted/25 mt-1.5" />
              </div>
              <div className="h-7 w-20 rounded-lg bg-brand-accent/20" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
              {[
                { label: "Revenue", value: "₹12.4L" },
                { label: "Profit", value: "₹2.8L" },
                { label: "Expenses", value: "₹9.6L" },
                { label: "Active batches", value: "18" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl bg-brand-card border border-brand-border p-2.5 md:p-3"
                >
                  <p className="text-[8px] md:text-[9px] text-brand-ink-soft uppercase tracking-wide">
                    {kpi.label}
                  </p>
                  <p className="text-sm md:text-lg font-bold text-brand-ink tabular-nums">
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-2 md:gap-3">
              <div className="lg:col-span-2 rounded-xl bg-brand-card border border-brand-border p-2 md:p-3">
                <p className="text-[9px] md:text-[10px] font-semibold text-brand-ink mb-2">
                  Revenue overview
                </p>
                <div className="h-20 md:h-28 flex items-end gap-1">
                  {[35, 55, 42, 70, 48, 82, 58, 90, 65, 78].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-brand-primary to-brand-accent/80"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-brand-card border border-brand-border p-2 md:p-3">
                <p className="text-[9px] md:text-[10px] font-semibold text-brand-ink mb-2">
                  Expense breakdown
                </p>
                <div className="flex items-center justify-center py-1">
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[6px] border-brand-accent border-r-brand-border-strong border-b-brand-canvas"
                    aria-hidden
                  />
                </div>
                <div className="space-y-1 mt-1">
                  {["Feed", "Labour", "Other"].map((l) => (
                    <div
                      key={l}
                      className="flex justify-between text-[8px] text-brand-ink-soft"
                    >
                      <span>{l}</span>
                      <span className="text-brand-ink font-medium">—</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-3">
              <div className="rounded-xl bg-brand-card border border-brand-border p-2 md:p-3">
                <p className="text-[9px] md:text-[10px] font-semibold text-brand-ink mb-2">
                  Batch performance
                </p>
                <div className="space-y-1.5">
                  {["Batch #104", "Batch #105", "Batch #106"].map((b, i) => (
                    <div
                      key={b}
                      className="flex items-center justify-between text-[9px] py-1 border-b border-brand-border last:border-0"
                    >
                      <span className="text-brand-ink-soft">{b}</span>
                      <span
                        className={`font-semibold tabular-nums ${i === 0 ? "text-brand-accent" : "text-brand-ink"}`}
                      >
                        {i === 0 ? "+18%" : i === 1 ? "+6%" : "-2%"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-brand-card border border-brand-border p-2 md:p-3">
                <p className="text-[9px] md:text-[10px] font-semibold text-brand-ink mb-2">
                  Recent transactions
                </p>
                {[1, 2, 3].map((row) => (
                  <div
                    key={row}
                    className="flex justify-between py-1.5 border-b border-brand-border last:border-0 text-[9px]"
                  >
                    <span className="text-brand-ink-soft">Feed purchase</span>
                    <span className="font-medium text-brand-ink tabular-nums">
                      -₹{(row * 12.5).toFixed(1)}K
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroMainDashboard
