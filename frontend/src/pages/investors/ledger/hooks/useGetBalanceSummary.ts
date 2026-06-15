import { useCallback, useEffect, useState } from 'react'
import investorLedgerApi from '../api'

type Params = {
  category: string
  investorId?: string
  startDate?: string
  endDate?: string
}

const useGetBalanceSummary = ({
  category,
  investorId,
  startDate,
  endDate,
}: Params) => {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchBalance = useCallback(
    async (cat: string, invId?: string, sDate?: string, eDate?: string) => {
      setLoading(true)
      const params: Record<string, string> = { category: cat }
      if (invId) params.investor_id = invId
      if (sDate) params.start_date = sDate
      if (eDate) params.end_date = eDate
      const res = await investorLedgerApi.getBalanceSummary(params)
      if (res.status === 'success' && res.data) {
        setBalance(res.data.balance)
      }
      setLoading(false)
    },
    []
  )

  useEffect(() => {
    fetchBalance(category, investorId, startDate, endDate)
  }, [category, investorId, startDate, endDate, fetchBalance])

  const refetch = useCallback(() => {
    fetchBalance(category, investorId, startDate, endDate)
  }, [category, investorId, startDate, endDate, fetchBalance])

  return { balance, loading, refetch }
}

export default useGetBalanceSummary
