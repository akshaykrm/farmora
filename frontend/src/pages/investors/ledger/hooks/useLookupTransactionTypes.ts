import { useEffect, useState } from 'react'
import type { TransactionType } from '../types'
import investorLedgerApi from '../api'

const useLookupTransactionTypes = () => {
  const [types, setTypes] = useState<TransactionType[]>([])

  useEffect(() => {
    investorLedgerApi.lookupTransactionTypes().then((res) => {
      if (res.status === 'success' && res.data) {
        setTypes(res.data)
      }
    })
  }, [])

  return { data: types }
}

export default useLookupTransactionTypes
