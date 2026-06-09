import { useEffect, useState } from 'react'
import type { InvestorTransactionListResponse } from '../types'
import investorLedgerApi from '../api'

const defaultState: InvestorTransactionListResponse = {
  data: [],
  limit: 0,
  page: 0,
  total: 0,
}

const useGetInvestorLedgerTransactions = (
  initialFilter?: Record<string, string>
) => {
  const [transactionList, setTransactionList] =
    useState<InvestorTransactionListResponse>(defaultState)

  const handleFetchTransactions = async (
    filter?: Record<string, string>
  ) => {
    const res = await investorLedgerApi.listTransactions(filter)
    if (res.status === 'success' && res.data) {
      setTransactionList(res.data)
    }
  }

  useEffect(() => {
    handleFetchTransactions(initialFilter)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { transactionList, handleFetchTransactions }
}

export default useGetInvestorLedgerTransactions
