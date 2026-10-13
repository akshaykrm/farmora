import { pick } from '@utils/list-filters'

export const parsePurchaseFilter = (query) =>
  pick(query, [
    'master_id',
    'status',
    'name',
    'category_id',
    'vendor_id',
    'batch_id',
    'start_date',
    'end_date',
  ])

export const parseItemReturnFilter = (query) => ({
  return_type: query.return_type || 'all',
  ...pick(query, [
    'item_category_id',
    'from_batch',
    'to_batch',
    'to_vendor',
    'start_date',
    'end_date',
  ]),
})

export const parsePurchaseBookFilter = (query) =>
  pick(query, ['vendor_id', 'start_date', 'end_date'])

export const parseIntegrationBookFilter = (query) =>
  pick(query, ['farm_id', 'start_date', 'end_date'])

export const parseWorkingCostFilter = (query) =>
  pick(query, ['season_id', 'start_date', 'end_date'])
