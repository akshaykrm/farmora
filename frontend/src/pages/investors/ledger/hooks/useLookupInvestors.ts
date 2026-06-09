import { useEffect, useState } from 'react'
import type { NameResponse } from '@app-types/gen.types'
import investorLedgerApi from '../api'

const useLookupInvestors = () => {
  const [investors, setInvestors] = useState<NameResponse[]>([])

  useEffect(() => {
    investorLedgerApi.lookupInvestors().then((res) => {
      if (res.status === 'success' && res.data) {
        setInvestors(res.data)
      }
    })
  }, [])

  return { data: investors }
}

export default useLookupInvestors
