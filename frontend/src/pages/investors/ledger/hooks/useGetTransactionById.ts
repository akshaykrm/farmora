import { useEffect, useState } from 'react'
import type { InvestorTransaction } from '../types'
import investorLedgerApi from '../api'

const useGetTransactionById = (transactionId: number | null) => {
  const [transaction, setTransaction] = useState<InvestorTransaction | null>(
    null
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!transactionId) {
      setTransaction(null)
      return
    }

    setLoading(true)
    investorLedgerApi.getTransactionById(transactionId).then((res) => {
      if (res.status === 'success' && res.data) {
        setTransaction(res.data)
      }
      setLoading(false)
    })
  }, [transactionId])

  return { transaction, loading }
}

export default useGetTransactionById
