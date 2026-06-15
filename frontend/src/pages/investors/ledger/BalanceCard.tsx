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
    <div
      className={`rounded-xl border p-5 ${
        isCapital
          ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'
          : 'bg-gradient-to-br from-blue-50 to-white border-blue-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-xl ${
            isCapital ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
          }`}
        >
          {isCapital ? <Banknote size={28} /> : <TrendingUp size={28} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isCapital ? 'text-emerald-600' : 'text-blue-600'}`}>
            {isCapital ? 'Total Capital Balance' : 'Total Profit Balance'}
          </p>
          {loading ? (
            <div className="h-8 w-40 bg-gray-200 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">
              {formatter.format(balance)}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-400">{subtitle}</p>
            {dateRangeText && (
              <span className="text-xs text-gray-400">
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
