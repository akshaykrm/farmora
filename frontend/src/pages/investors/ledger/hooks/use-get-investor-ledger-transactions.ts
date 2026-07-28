import { useCallback, useEffect, useState } from 'react'
import type { InvestorTransaction } from '../types'
import investorLedgerApi from '../api'
import { overrideFilters, type Filter } from '@utils/filters'

const useGetInvestorLedgerTransactions = (filter?: Filter) => {
  const [transactions, setTransactions] = useState<{
    records: InvestorTransaction[]
    totalPages: number
  }>({ records: [], totalPages: 0 })

  const {
    page,
    limit,
    investor_id,
    transaction_type_id,
    start_date,
    end_date,
  } = filter || {}

  const handleFetchTransactions = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override)
      const res = await investorLedgerApi.listTransactions(opts)
      if (res.status === 'success' && res.data) {
        const { data, totalPages } = res.data
        setTransactions({ records: data, totalPages })
      }
    },
    [page, limit, investor_id, transaction_type_id, start_date, end_date],
  )

  useEffect(() => {
    handleFetchTransactions()
  }, [handleFetchTransactions])

  return { transactions, refetch: handleFetchTransactions }
}

export default useGetInvestorLedgerTransactions
