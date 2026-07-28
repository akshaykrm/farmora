import { useCallback, useEffect, useState } from 'react'
import type { Investor } from '../types'
import investorsApi from '../api'
import { overrideFilters, type Filter } from '@utils/filters'

const useGetInvestors = (filter?: Filter) => {
  const [investors, setInvestors] = useState<{
    records: Investor[]
    totalPages: number
  }>({ records: [], totalPages: 0 })

  const { page, limit, search, start_date, end_date } = filter || {}

  const handleFetchAllInvestors = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override)
      const res = await investorsApi.fetchAll(opts)
      if (res.status === 'success') {
        if (res.data) {
          const { data, totalPages } = res.data
          setInvestors({ records: data, totalPages })
        }
      }
    },
    [page, limit, search, start_date, end_date],
  )

  useEffect(() => {
    handleFetchAllInvestors()
  }, [handleFetchAllInvestors])

  return { investors, refetch: handleFetchAllInvestors }
}

export default useGetInvestors
