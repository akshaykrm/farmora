/** Decorative mini UIs for landing dashboard preview gallery */

const WindowChrome = () => (
  <div className="flex items-center gap-1.5 px-3 py-2 bg-brand-card border-b border-brand-border">
    <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
    <span className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
    <span className="w-2 h-2 rounded-full bg-[#28CA42]" />
    <span className="ml-2 text-[9px] text-brand-ink-muted font-medium truncate">
      Farmora
    </span>
  </div>
)

export function OverviewPreview() {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card shadow-lg overflow-hidden select-none">
      <WindowChrome />
      <div className="p-3 bg-brand-canvas space-y-2.5">
        <div>
          <div className="h-2 w-24 bg-brand-ink/20 rounded" />
          <div className="h-1.5 w-32 bg-brand-ink-muted/30 rounded mt-1.5" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {["Sales", "Stock", "Batches", "Staff"].map((label) => (
            <div
              key={label}
              className="rounded-lg bg-brand-card border border-brand-border p-2"
            >
              <p className="text-[8px] text-brand-ink-soft uppercase">{label}</p>
              <p className="text-sm font-bold text-brand-ink tabular-nums">
                {label === "Sales" ? "₹2.4L" : label === "Stock" ? "86" : label === "Batches" ? "12" : "24"}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-brand-card border border-brand-border p-2 h-16 flex items-end gap-1">
          {[40, 65, 45, 80, 55, 70, 90, 60].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-brand-accent/70"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ManagerDashboardPreview() {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card shadow-lg overflow-hidden select-none">
      <WindowChrome />
      <div className="p-3 bg-brand-canvas space-y-2">
        <div className="rounded-xl bg-gradient-to-br from-brand-accent to-brand-primary p-3 text-white">
          <p className="text-[8px] uppercase tracking-wider opacity-90">
            Cash balance
          </p>
          <p className="text-lg font-bold tabular-nums">₹ 8,42,500</p>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {["Purchases", "Sales", "Profit"].map((t, i) => (
            <div
              key={t}
              className="rounded-md bg-brand-card border border-brand-border p-1.5"
            >
              <p className="text-[7px] text-brand-ink-soft">{t}</p>
              <p className="text-[10px] font-semibold text-brand-ink">
                {i === 0 ? "₹1.2L" : i === 1 ? "₹2.8L" : "₹45K"}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-brand-card border border-brand-border divide-y divide-brand-border">
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex justify-between px-2 py-1.5">
              <div className="h-1.5 w-16 bg-brand-ink-muted/25 rounded" />
              <div className="h-1.5 w-10 bg-brand-accent/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SeasonOverviewPreview() {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card shadow-lg overflow-hidden select-none">
      <WindowChrome />
      <div className="p-3 bg-brand-canvas space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-semibold text-brand-ink">
            Season overview
          </p>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-canvas text-brand-primary font-medium">
            Active
          </span>
        </div>
        <div className="flex gap-2 h-14">
          <div className="flex-1 rounded-lg border border-brand-border bg-brand-card p-1.5 flex flex-col justify-end">
            <svg viewBox="0 0 100 40" className="w-full h-10 text-brand-accent">
              <path
                d="M0 35 L20 28 L40 32 L60 18 L80 22 L100 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="w-16 rounded-lg border border-brand-border bg-brand-card p-1.5 space-y-1">
            <div className="h-1.5 w-full bg-brand-canvas rounded" />
            <div className="h-1.5 w-[75%] bg-brand-border-strong/60 rounded" />
            <div className="h-1.5 w-full bg-brand-canvas rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[8px]">
          <div className="rounded bg-brand-card border border-brand-border p-1.5">
            <span className="text-brand-ink-soft">Yield</span>
            <p className="font-bold text-brand-ink">+12%</p>
          </div>
          <div className="rounded bg-brand-card border border-brand-border p-1.5">
            <span className="text-brand-ink-soft">Costs</span>
            <p className="font-bold text-brand-ink">₹3.1L</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BatchPLPreview() {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card shadow-lg overflow-hidden select-none">
      <WindowChrome />
      <div className="p-3 bg-brand-canvas space-y-2">
        <p className="text-[10px] font-semibold text-brand-ink">
          Batch #104 — P&L
        </p>
        <div className="grid grid-cols-2 gap-2 text-[8px]">
          <div className="rounded-lg bg-brand-card border border-brand-border p-2">
            <span className="text-brand-ink-soft">Revenue</span>
            <p className="text-sm font-bold text-brand-accent tabular-nums">₹4.2L</p>
          </div>
          <div className="rounded-lg bg-brand-card border border-brand-border p-2">
            <span className="text-brand-ink-soft">Expenses</span>
            <p className="text-sm font-bold text-brand-ink tabular-nums">₹3.1L</p>
          </div>
        </div>
        <div className="rounded-lg bg-brand-canvas/60 border border-brand-border-strong/50 p-2 flex justify-between items-center">
          <span className="text-[9px] font-medium text-brand-ink-soft">Net profit</span>
          <span className="text-sm font-bold text-brand-primary tabular-nums">₹1.1L</span>
        </div>
        <div className="rounded-lg bg-brand-card border border-brand-border p-2">
          <span className="text-[8px] text-brand-ink-soft">Cost per kg</span>
          <p className="text-base font-bold text-brand-ink tabular-nums">₹ 142.50</p>
        </div>
      </div>
    </div>
  )
}
