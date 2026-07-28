import fetcherV2 from '@utils/fetcherV2'
import type { InvestorDetail, InvestorFormValues, Investor } from './types'
import type { Filter } from '@utils/filters'

const investorsApi = {
  fetchAll: (filter?: Filter) => {
    const opts = {
      method: 'GET' as const,
      filter: filter,
    }
    return fetcherV2<{ data: Investor[]; totalPages: number }>('investors', null, opts)
  },

  fetchById: (id: number) =>
    fetcherV2<InvestorDetail>(`investors/${id}`),

  create: (payload: InvestorFormValues) =>
    fetcherV2<unknown>('investors', JSON.stringify(payload), {
      method: 'POST',
    }),

  updateById: (id: number, payload: InvestorFormValues) =>
    fetcherV2<unknown>(`investors/${id}`, JSON.stringify(payload), {
      method: 'PUT',
    }),
}

export default investorsApi
