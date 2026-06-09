import { useEffect, useState } from 'react'
import type { InvestorListResponse } from '../types'
import investorsApi from '../api'

const useGetInvestors = () => {
  const [investorList, setInvestorList] = useState<InvestorListResponse>({
    data: [],
    limit: 0,
    page: 0,
    total: 0,
  })

  const handleFetchAllInvestors = async (filter?: Record<string, string>) => {
    const res = await investorsApi.fetchAll(filter)
    if (res.status === 'success') {
      if (res.data) {
        setInvestorList(res.data)
      }
    }
  }

  useEffect(() => {
    handleFetchAllInvestors()
  }, [])

  return { investorList, handleFetchAllInvestors }
}

export default useGetInvestors
