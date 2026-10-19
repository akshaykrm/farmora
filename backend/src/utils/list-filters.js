/**
 * Copies the given keys from a query object, skipping missing and empty values.
 */
export const pick = (query, keys) => {
  const filter = {}
  for (const key of keys) {
    if (query[key] !== undefined && query[key] !== '') {
      filter[key] = query[key]
    }
  }
  return filter
}

export const parseSaleFilter = (query) =>
  pick(query, [
    'master_id',
    'status',
    'season_id',
    'batch_id',
    'buyer_name',
    'payment_type',
    'start_date',
    'end_date',
  ])

export const parseSalesBookFilter = (query) =>
  pick(query, ['buyer_id', 'from_date', 'end_date'])

export const parseGeneralEntryFilter = (query) =>
  pick(query, ['season_id', 'purpose', 'start_date', 'end_date'])

export const parseCashFlowFilter = (query) =>
  pick(query, ['from_date', 'to_date', 'purpose'])

export const parseSeasonOverviewFilter = (query) => ({
  season_id: parseInt(query.season_id),
  ...pick(query, ['gc_purpose', 'gs_purpose']),
})

export const parseBatchOverviewFilter = (query) => ({
  batch_id: parseInt(query.batch_id),
})

export const parseInvestorFilter = (query) => {
  const filter = pick(query, ['search', 'start_date', 'end_date'])
  if (query.is_active !== undefined) {
    filter.is_active = query.is_active === 'true'
  }
  return filter
}

export const parseInvestorLedgerFilter = (query) =>
  pick(query, [
    'investor_id',
    'transaction_type_id',
    'category',
    'start_date',
    'end_date',
  ])

export const parseItemCategoryFilter = (query) =>
  pick(query, ['master_id', 'status', 'name'])

export const parseFarmFilter = (query) =>
  pick(query, ['master_id', 'status', 'name'])

export const parseSeasonFilter = (query) =>
  pick(query, ['master_id', 'status', 'name'])

export const parseBatchFilter = (query) =>
  pick(query, ['master_id', 'season_id', 'farm_id', 'status', 'name'])

export const parseVendorFilter = (query) =>
  pick(query, ['master_id', 'status', 'name', 'vendor_type'])

export const parseUserFilter = (query) => {
  const filter = pick(query, ['name', 'user_type'])
  if (query.status) filter.status = parseInt(query.status)
  if (query.parent_id) filter.parent_id = parseInt(query.parent_id)
  return filter
}

export const parsePackageFilter = (query) => pick(query, ['status', 'name'])

export const parseReferralFilter = (query) => pick(query, ['name', 'status'])
