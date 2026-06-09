import { useEffect, useState } from 'react'
import type { InvestorFormValues } from '../types'
import investorsApi from '../api'

const defaultValues: InvestorFormValues = {
  investor_name: '',
  investor_phone: '',
  investor_email: '',
  is_active: true,
}

const useGetInvestorById = (selectedId: number | null) => {
  const [dataLoaded, setDataLoaded] = useState(false)
  const [selectedData, setSelectedData] =
    useState<InvestorFormValues>(defaultValues)

  useEffect(() => {
    const handleGetInvestorById = async (id: number) => {
      const res = await investorsApi.fetchById(id)
      if (res.status === 'success') {
        if (res.data) {
          const { investor_name, investor_phone, investor_email, is_active } =
            res.data
          setSelectedData({
            investor_name,
            investor_phone,
            investor_email: investor_email ?? '',
            is_active,
          })
          setDataLoaded(true)
        }
      }
    }

    if (selectedId) {
      handleGetInvestorById(selectedId)
    } else {
      setSelectedData(defaultValues)
    }
  }, [selectedId])

  return { dataLoaded, selectedData }
}

export default useGetInvestorById
