import itemService from '@services/items.service'
import farmService from '@services/farm.service'
import seasonService from '@services/season.service'
import batchService from '@services/batch.service'
import vendorService from '@services/vendor.service'
import userService from '@services/user.service'
import { compactMeta } from '@utils/export/report'
import { capitalize, nameOf, statusLabel, toPlain } from './helpers.js'

/**
 * Builds a single-table report from a list service that returns every row
 * when called without page/limit.
 */
const listReport =
  ({ title, filename, fetch, columns, toRow, meta = async () => [] }) =>
  async (filter, currentUser) => {
    const { data } = await fetch(filter, currentUser)
    const rows = data.map((record) => toRow(toPlain(record)))

    return {
      title,
      filename,
      meta: compactMeta(await meta(filter, currentUser)),
      sections: [{ title, columns, rows }],
      summary: [{ label: 'Records', value: rows.length, type: 'number' }],
    }
  }

const nameAndStatusMeta = (filter) => [
  { label: 'Name', value: filter.name },
  { label: 'Status', value: statusLabel(filter.status) },
]

const items = listReport({
  title: 'Items',
  filename: 'items',
  fetch: itemService.getAll,
  columns: [
    { key: 'name', header: 'Name', width: 1.5 },
    { key: 'base_price', header: 'Base Price', type: 'currency' },
    { key: 'type', header: 'Type' },
    { key: 'vendor', header: 'Vendor', width: 1.5 },
    { key: 'status', header: 'Status', width: 0.8 },
  ],
  toRow: (item) => ({
    name: item.name,
    base_price: item.base_price,
    type: capitalize(item.type),
    vendor: item.vendor?.name,
    status: statusLabel(item.status),
  }),
  meta: nameAndStatusMeta,
})

const farms = listReport({
  title: 'Farms',
  filename: 'farms',
  fetch: farmService.getAll,
  columns: [
    { key: 'name', header: 'Name', width: 1.5 },
    { key: 'place', header: 'Place', width: 1.5 },
    { key: 'capacity', header: 'Capacity', type: 'number' },
    { key: 'status', header: 'Status', width: 0.8 },
  ],
  toRow: (farm) => ({
    name: farm.name,
    place: farm.place,
    capacity: farm.capacity,
    status: statusLabel(farm.status),
  }),
  meta: nameAndStatusMeta,
})

const seasons = listReport({
  title: 'Seasons',
  filename: 'seasons',
  fetch: seasonService.getAll,
  columns: [
    { key: 'name', header: 'Name', width: 1.5 },
    { key: 'status', header: 'Status', width: 0.8 },
    { key: 'from_date', header: 'From Date', type: 'date' },
    { key: 'to_date', header: 'End Date', type: 'date' },
    { key: 'closed_on', header: 'Closed On', type: 'date' },
  ],
  toRow: (season) => ({
    name: season.name,
    status: statusLabel(season.status),
    from_date: season.from_date,
    to_date: season.to_date,
    closed_on: season.closed_on,
  }),
  meta: nameAndStatusMeta,
})

const batches = listReport({
  title: 'Batches',
  filename: 'batches',
  fetch: batchService.getAll,
  columns: [
    { key: 'name', header: 'Name', width: 1.5 },
    { key: 'status', header: 'Status', width: 0.8 },
    { key: 'farm', header: 'Farm', width: 1.3 },
    { key: 'season', header: 'Season', width: 1.3 },
    { key: 'closed_on', header: 'Closed On', type: 'date' },
  ],
  toRow: (batch) => ({
    name: batch.name,
    status: statusLabel(batch.status),
    farm: batch.farm?.name,
    season: batch.season?.name,
    closed_on: batch.closed_on,
  }),
  meta: async (filter, currentUser) => {
    const [season, farm] = await Promise.all([
      nameOf(seasonService.getById, filter.season_id, currentUser),
      nameOf(farmService.getById, filter.farm_id, currentUser),
    ])
    return [
      ...nameAndStatusMeta(filter),
      { label: 'Season', value: season },
      { label: 'Farm', value: farm },
    ]
  },
})

const vendors = listReport({
  title: 'Vendors',
  filename: 'vendors',
  fetch: vendorService.getAll,
  columns: [
    { key: 'name', header: 'Name', width: 1.5 },
    { key: 'status', header: 'Status', width: 0.8 },
    { key: 'address', header: 'Address', width: 2 },
    { key: 'opening_balance', header: 'Opening Balance', type: 'currency' },
    { key: 'vendor_type', header: 'Type' },
  ],
  toRow: (vendor) => ({
    name: vendor.name,
    status: statusLabel(vendor.status),
    address: vendor.address,
    opening_balance: vendor.opening_balance,
    vendor_type: capitalize(vendor.vendor_type),
  }),
  meta: (filter) => [
    ...nameAndStatusMeta(filter),
    { label: 'Type', value: capitalize(filter.vendor_type) },
  ],
})

const users = listReport({
  title: 'Users',
  filename: 'users',
  fetch: userService.getAll,
  columns: [
    { key: 'name', header: 'Name', width: 1.5 },
    { key: 'username', header: 'Username', width: 1.3 },
    { key: 'user_type', header: 'Type', width: 0.8 },
    { key: 'email', header: 'Email', width: 1.8 },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status', width: 0.8 },
  ],
  toRow: (user) => ({
    name: user.name,
    username: user.username,
    user_type: capitalize(user.user_type),
    email: user.email,
    phone: user.phone,
    status: statusLabel(user.status),
  }),
  meta: (filter) => [
    { label: 'Name', value: filter.name },
    { label: 'Type', value: capitalize(filter.user_type) },
    { label: 'Status', value: statusLabel(filter.status) },
  ],
})

const configExportService = {
  items,
  farms,
  seasons,
  batches,
  vendors,
  users,
}

export default configExportService
