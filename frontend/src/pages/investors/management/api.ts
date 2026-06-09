import fetcherV2 from '@utils/fetcherV2'
import type { InvestorDetail, InvestorFormValues, InvestorListResponse } from './types'

const investorsApi = {
  fetchAll: (filter?: Record<string, string>) =>
    fetcherV2<InvestorListResponse>('investors', null, {
      method: 'GET',
      filter,
    }),

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
