import salesService from '@services/sales.service'
import generalExpenseService from '@services/general-expense.service'
import expenseSalesService from '@services/expense-sales.service'
import balanceSheetService from '@services/balance-sheet.service'
import seasonService from '@services/season.service'
import batchService from '@services/batch.service'
import { compactMeta } from '@utils/export/report'
import { dateMeta, nameOf, sumOf, toPlain } from './helpers.js'

const sales = async (filter, currentUser) => {
  const { data } = await salesService.getAll(filter, currentUser)

  const rows = data.map((record) => {
    const sale = toPlain(record)
    return {
      date: sale.date,
      season: sale.season?.name,
      batch: sale.batch?.name,
      buyer: sale.buyer?.name,
      vehicle_no: sale.vehicle_no,
      weight: sale.weight,
      bird_no: sale.bird_no,
      avg_weight: sale.avg_weight,
      price: sale.price,
      amount: sale.amount,
      payment_type: sale.payment_type?.toUpperCase(),
      narration: sale.narration,
    }
  })

  const [season, batch] = await Promise.all([
    nameOf(seasonService.getById, filter.season_id, currentUser),
    nameOf(batchService.getById, filter.batch_id, currentUser),
  ])

  return {
    title: 'Sales',
    filename: 'sales',
    meta: compactMeta([
      { label: 'Season', value: season },
      { label: 'Batch', value: batch },
      { label: 'Buyer', value: filter.buyer_name },
      {
        label: 'Payment Type',
        value: filter.payment_type?.toUpperCase(),
      },
      dateMeta(filter.start_date, filter.end_date),
    ]),
    sections: [
      {
        title: 'Sales',
        columns: [
          { key: 'date', header: 'Date', type: 'date' },
          { key: 'season', header: 'Season' },
          { key: 'batch', header: 'Batch' },
          { key: 'buyer', header: 'Buyer', width: 1.3 },
          { key: 'vehicle_no', header: 'Vehicle No' },
          { key: 'weight', header: 'Weight (kg)', type: 'number' },
          { key: 'bird_no', header: 'Birds', type: 'number', width: 0.8 },
          { key: 'avg_weight', header: 'Avg Weight', type: 'number' },
          { key: 'price', header: 'Price', type: 'currency' },
          { key: 'amount', header: 'Amount', type: 'currency' },
          { key: 'payment_type', header: 'Payment', width: 0.8 },
          { key: 'narration', header: 'Narration', width: 1.5 },
        ],
        rows,
      },
    ],
    summary: [
      { label: 'Records', value: rows.length, type: 'number' },
      {
        label: 'Total Weight (kg)',
        value: sumOf(rows, 'weight'),
        type: 'number',
      },
      { label: 'Total Birds', value: sumOf(rows, 'bird_no'), type: 'number' },
      { label: 'Total Amount', value: sumOf(rows, 'amount'), type: 'currency' },
    ],
  }
}

const salesBook = async (filter, currentUser) => {
  const { buyer, transactions, closing_balance } =
    await salesService.buildSalesLedger(filter, currentUser)
  const totals = salesService.calculateTotals(transactions)

  const rows = [...transactions].reverse().map((row) => ({
    ...row,
    type: row.type?.toUpperCase(),
  }))

  return {
    title: 'Sales Book',
    filename: 'sales-book',
    meta: compactMeta([
      { label: 'Buyer', value: buyer?.name || `#${filter.buyer_id}` },
      {
        label: 'Opening Balance',
        value: buyer?.opening_balance || 0,
        type: 'currency',
      },
      dateMeta(filter.from_date, filter.end_date),
    ]),
    sections: [
      {
        title: 'Sales Book',
        columns: [
          { key: 'created_date', header: 'Date', type: 'date' },
          { key: 'bird_no', header: 'Birds', type: 'number' },
          { key: 'weight', header: 'Weight (kg)', type: 'number' },
          { key: 'price', header: 'Price', type: 'currency' },
          { key: 'amount', header: 'Amount', type: 'currency' },
          { key: 'type', header: 'Type' },
          { key: 'balance', header: 'Balance', type: 'currency' },
        ],
        rows,
      },
    ],
    summary: [
      { label: 'Total Birds', value: totals.birds, type: 'number' },
      { label: 'Total Weight (kg)', value: totals.weight, type: 'number' },
      { label: 'Total Amount', value: totals.amount, type: 'currency' },
      { label: 'Closing Balance', value: closing_balance, type: 'currency' },
    ],
  }
}

const generalEntries =
  ({ service, title, filename }) =>
  async (filter, currentUser) => {
    const { data, totalAmount } = await service.getAll(filter, currentUser)

    const rows = data.map((record) => {
      const entry = toPlain(record)
      return {
        date: entry.date,
        season: entry.season?.name,
        purpose: entry.purpose,
        amount: entry.amount,
        narration: entry.narration,
      }
    })

    const season = await nameOf(
      seasonService.getById,
      filter.season_id,
      currentUser
    )

    return {
      title,
      filename,
      meta: compactMeta([
        { label: 'Season', value: season },
        { label: 'Purpose', value: filter.purpose },
        dateMeta(filter.start_date, filter.end_date),
      ]),
      sections: [
        {
          title,
          columns: [
            { key: 'date', header: 'Date', type: 'date' },
            { key: 'season', header: 'Season' },
            { key: 'purpose', header: 'Purpose', width: 2 },
            { key: 'amount', header: 'Amount', type: 'currency' },
            { key: 'narration', header: 'Narration', width: 2 },
          ],
          rows,
        },
      ],
      summary: [
        { label: 'Records', value: rows.length, type: 'number' },
        { label: 'Total Amount', value: totalAmount || 0, type: 'currency' },
      ],
    }
  }

const generalExpenses = generalEntries({
  service: generalExpenseService,
  title: 'General Expense',
  filename: 'general-expenses',
})

const generalSales = generalEntries({
  service: expenseSalesService,
  title: 'General Sales',
  filename: 'general-sales',
})

const cashFlow = async (filter, currentUser) => {
  const data = await balanceSheetService.getBalanceSheet(filter, currentUser)
  const { summary } = data

  return {
    title: 'Cash Flow',
    filename: 'cash-flow',
    meta: compactMeta([
      { label: 'Purpose', value: filter.purpose },
      dateMeta(filter.from_date, filter.to_date),
    ]),
    sections: [
      {
        title: 'Cash Flow',
        columns: [
          { key: 'date', header: 'Date', type: 'date' },
          { key: 'purpose', header: 'Purpose', width: 3 },
          { key: 'type', header: 'Type', width: 0.6 },
          { key: 'amount', header: 'Amount', type: 'currency' },
          { key: 'balance', header: 'Balance', type: 'currency' },
        ],
        rows: (data.transactions || []).map((row) => ({
          ...row,
          type: String(row.type || '').toUpperCase(),
        })),
      },
    ],
    summary: [
      {
        label: 'Opening Balance',
        value: data.opening_balance,
        type: 'currency',
      },
      { label: 'Total In', value: summary.total_in, type: 'currency' },
      { label: 'Total Out', value: summary.total_out, type: 'currency' },
      { label: 'Liability', value: summary.liability, type: 'currency' },
      { label: 'Receivable', value: summary.receivable, type: 'currency' },
      {
        label: 'Closing Balance',
        value: summary.closing_balance,
        type: 'currency',
      },
    ],
  }
}

const salesExportService = {
  sales,
  salesBook,
  generalExpenses,
  generalSales,
  cashFlow,
}

export default salesExportService
