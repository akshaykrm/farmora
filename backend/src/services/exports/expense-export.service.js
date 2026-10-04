import purchaseService from '@services/purchase.service'
import purchaseReturnService from '@services/purchase-return.service'
import integrationService from '@services/itegration-book.service'
import workingCostService from '@services/working-cost.service'
import vendorService from '@services/vendor.service'
import batchService from '@services/batch.service'
import farmService from '@services/farm.service'
import seasonService from '@services/season.service'
import itemService from '@services/items.service'
import { compactMeta } from '@utils/export/report'
import { capitalize, dateMeta as rangeMeta, nameOf } from './helpers.js'

const dateMeta = (filter) => rangeMeta(filter.start_date, filter.end_date)

const purchases = async (filter, currentUser) => {
  const { data } = await purchaseService.getAll(filter, currentUser)

  const rows = data.map((record) => {
    const item = record.toJSON()
    return {
      invoice_number: item.invoice_number,
      invoice_date: item.invoice_date,
      supplier: item.vendor?.name,
      type: capitalize(item.category?.type),
      category: item.category?.name,
      quantity: item.quantity,
      price: item.price_per_unit,
      total_amount: item.total_price,
      farm: item.farm?.name,
      batch: item.batch?.name,
      narration: item.narration,
    }
  })

  const [vendor, batch, category] = await Promise.all([
    nameOf(vendorService.getById, filter.vendor_id, currentUser),
    nameOf(batchService.getById, filter.batch_id, currentUser),
    nameOf(itemService.getById, filter.category_id, currentUser),
  ])

  return {
    title: 'Purchases',
    filename: 'purchases',
    meta: compactMeta([
      { label: 'Supplier', value: vendor },
      { label: 'Batch', value: batch },
      { label: 'Category', value: category },
      dateMeta(filter),
    ]),
    sections: [
      {
        title: 'Purchases',
        columns: [
          { key: 'invoice_number', header: 'Invoice Number', width: 1.2 },
          { key: 'invoice_date', header: 'Invoice Date', type: 'date' },
          { key: 'supplier', header: 'Supplier Name', width: 1.4 },
          { key: 'type', header: 'Type' },
          { key: 'category', header: 'Item', width: 1.2 },
          { key: 'farm', header: 'Farm' },
          { key: 'batch', header: 'Batch' },
          { key: 'quantity', header: 'Quantity', type: 'number', width: 0.8 },
          { key: 'price', header: 'Price', type: 'currency' },
          { key: 'total_amount', header: 'Total Amount', type: 'currency' },
          { key: 'narration', header: 'Narration', width: 1.6 },
        ],
        rows,
      },
    ],
    summary: [
      { label: 'Records', value: rows.length, type: 'number' },
      {
        label: 'Total Amount',
        value: rows.reduce(
          (sum, r) => sum + (parseFloat(r.total_amount) || 0),
          0
        ),
        type: 'currency',
      },
    ],
  }
}

const itemReturns = async (filter, currentUser) => {
  const { data } = await purchaseReturnService.getAll(filter, currentUser)

  const rows = data.map((record) => {
    const item = record.toJSON()
    const isVendor = item.return_type === 'vendor'
    return {
      return_type: capitalize(item.return_type),
      date: item.date,
      quantity: item.quantity,
      rate: item.rate_per_bag,
      total_amount: item.total_amount,
      category: capitalize(item.category?.type),
      from_batch: item.from_batch_data?.name,
      destination: isVendor
        ? item.to_vendor_data?.name
        : item.to_batch_data?.name,
      payment_type: isVendor ? capitalize(item.payment_type) : '',
    }
  })

  const [category, fromBatch, toBatch, toVendor] = await Promise.all([
    nameOf(itemService.getById, filter.item_category_id, currentUser),
    nameOf(batchService.getById, filter.from_batch, currentUser),
    nameOf(batchService.getById, filter.to_batch, currentUser),
    nameOf(vendorService.getById, filter.to_vendor, currentUser),
  ])

  return {
    title: 'Returns',
    filename: 'returns',
    meta: compactMeta([
      {
        label: 'Return Type',
        value:
          filter.return_type === 'all' ? null : capitalize(filter.return_type),
      },
      { label: 'Category', value: category },
      { label: 'From Batch', value: fromBatch },
      { label: 'To Batch', value: toBatch },
      { label: 'To Vendor', value: toVendor },
      dateMeta(filter),
    ]),
    sections: [
      {
        title: 'Returns',
        columns: [
          { key: 'return_type', header: 'Return Type' },
          { key: 'date', header: 'Date', type: 'date' },
          { key: 'quantity', header: 'Quantity', type: 'number', width: 0.8 },
          { key: 'rate', header: 'Rate', type: 'currency' },
          { key: 'total_amount', header: 'Total Amount', type: 'currency' },
          { key: 'category', header: 'Category' },
          { key: 'from_batch', header: 'From Batch' },
          { key: 'destination', header: 'To Batch/Vendor', width: 1.3 },
          { key: 'payment_type', header: 'Payment Type' },
        ],
        rows,
      },
    ],
    summary: [
      { label: 'Records', value: rows.length, type: 'number' },
      {
        label: 'Total Amount',
        value: rows.reduce(
          (sum, r) => sum + (parseFloat(r.total_amount) || 0),
          0
        ),
        type: 'currency',
      },
    ],
  }
}

const purchaseBook = async (filter, currentUser) => {
  const { vendor, rows, summary } =
    await purchaseService.buildPurchaseBookLedger(filter, currentUser)

  return {
    title: 'Purchase Book',
    filename: 'purchase-book',
    meta: compactMeta([
      { label: 'Vendor', value: vendor.name },
      {
        label: 'Opening Balance',
        value: vendor.opening_balance || 0,
        type: 'currency',
      },
      dateMeta(filter),
    ]),
    sections: [
      {
        title: 'Purchase Book',
        columns: [
          { key: 'date', header: 'Date', type: 'date' },
          { key: 'quantity', header: 'Quantity', type: 'number' },
          { key: 'price', header: 'Price', type: 'currency' },
          { key: 'amount', header: 'Amount', type: 'currency' },
          { key: 'type', header: 'Type' },
          { key: 'balance', header: 'Balance', type: 'currency' },
        ],
        rows: rows.map((row) => ({ ...row, type: capitalize(row.type) })),
      },
    ],
    summary: [
      { label: 'Credit', value: summary.credit, type: 'currency' },
      { label: 'Paid', value: summary.paid, type: 'currency' },
      { label: 'Balance', value: summary.balance, type: 'currency' },
    ],
  }
}

const bookColumns = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'purpose', header: 'Purpose', width: 3 },
  { key: 'amount', header: 'Amount', type: 'currency', width: 1.2 },
]

const integrationBook = async (filter, currentUser) => {
  const { credit, paid, summary } =
    await integrationService.buildIntegrationBook(filter, currentUser)
  const farm = await farmService.getById(filter.farm_id, currentUser)

  const toRow = (row) => ({
    date: row.date,
    purpose: row.name,
    amount: row.net_amount,
  })

  return {
    title: 'Integration Book',
    filename: 'integration-book',
    meta: compactMeta([{ label: 'Farm', value: farm.name }, dateMeta(filter)]),
    sections: [
      { title: 'Paid', columns: bookColumns, rows: paid.map(toRow) },
      { title: 'Credit', columns: bookColumns, rows: credit.map(toRow) },
    ],
    summary: [
      { label: 'Total In', value: summary.credit, type: 'currency' },
      { label: 'Total Out', value: summary.paid, type: 'currency' },
      { label: 'Balance', value: summary.balance, type: 'currency' },
    ],
  }
}

const workingCost = async (filter, currentUser) => {
  const { income, expense, summary } =
    await workingCostService.buildWorkingCost(filter, currentUser)
  const season = await seasonService.getById(filter.season_id, currentUser)

  return {
    title: 'Working Cost Book',
    filename: 'working-cost-book',
    meta: compactMeta([
      { label: 'Season', value: season.name },
      dateMeta(filter),
    ]),
    sections: [
      { title: 'Expense', columns: bookColumns, rows: expense },
      { title: 'Income', columns: bookColumns, rows: income },
    ],
    summary: [
      { label: 'Income', value: summary.income, type: 'currency' },
      { label: 'Expense', value: summary.expense, type: 'currency' },
      { label: 'Balance', value: summary.balance, type: 'currency' },
    ],
  }
}

const expenseExportService = {
  purchases,
  itemReturns,
  purchaseBook,
  integrationBook,
  workingCost,
}

export default expenseExportService
