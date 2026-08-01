import { Banknote, TrendingUp } from 'lucide-react'
import dayjs from 'dayjs'

type Props = {
  balance: number
  loading: boolean
  category: 'CAPITAL' | 'PROFIT'
  hasInvestorFilter: boolean
  filterStartDate?: string
  filterEndDate?: string
}

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const BalanceCard = ({
  balance,
  loading,
  category,
  hasInvestorFilter,
  filterStartDate,
  filterEndDate,
}: Props) => {
  const isCapital = category === 'CAPITAL'

  const subtitle = hasInvestorFilter
    ? 'Balance for selected investor'
    : 'Balance across all investors'

  const dateRangeText =
    filterStartDate || filterEndDate
      ? `${filterStartDate ? dayjs(filterStartDate).format('DD-MM-YYYY') : '…'} – ${
          filterEndDate ? dayjs(filterEndDate).format('DD-MM-YYYY') : '…'
        }`
      : null

  return (
    <div className="h-full rounded-xl border border-brand-border bg-brand-card p-4 shadow-xs">
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-lg ${
            isCapital
              ? 'bg-brand-primary-soft text-brand-accent'
              : 'bg-brand-info-soft text-brand-info'
          }`}
        >
          {isCapital ? <Banknote size={28} /> : <TrendingUp size={28} />}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium ${
              isCapital ? 'text-brand-accent' : 'text-brand-info'
            }`}
          >
            {isCapital ? 'Total Capital Balance' : 'Total Profit Balance'}
          </p>
          {loading ? (
            <div className="mt-1 h-8 w-40 animate-pulse rounded bg-brand-border" />
          ) : (
            <p className="mt-1 text-2xl font-bold tabular-nums text-brand-ink">
              {formatter.format(balance)}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-brand-ink-muted">{subtitle}</p>
            {dateRangeText && (
              <span className="text-xs text-brand-ink-muted">
                · {dateRangeText}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BalanceCard
