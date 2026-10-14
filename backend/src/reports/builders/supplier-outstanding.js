import dayjs from 'dayjs'
import { schemaOf } from '../filters.js'
import { nextDayStart, num, query, round, sumRows } from '../helpers.js'
import { formatValue } from '@utils/export/report'

const COLUMNS = [
  { key: 'vendor_name', header: 'Supplier', width: 1.6 },
  { key: 'opening_balance', header: 'Opening', type: 'currency' },
  { key: 'credit_purchases', header: 'Credit Purchases', type: 'currency' },
  { key: 'returns', header: 'Paid Returns', type: 'currency' },
  { key: 'payments', header: 'Payments', type: 'currency' },
  { key: 'balance', header: 'Outstanding', type: 'currency' },
  { key: 'last_payment', header: 'Last Payment', type: 'date' },
]

/**
 * Same ledger as the purchase book (buildPurchaseBookLedger): opening balance
 * plus credit purchases, minus paid returns and payments, up to `as_of`.
 */
const build = async (filter, { masterId }) => {
  const asOf = filter.as_of || dayjs().format('YYYY-MM-DD')
  const replacements = {
    masterId,
    until: nextDayStart(asOf),
    vendorId: filter.vendor_id,
  }
  const vendorSql = filter.vendor_id ? ' AND v.id = :vendorId' : ''

  const vendors = await query(
    `SELECT v.id, v.name AS vendor_name, v.opening_balance,
            (SELECT SUM(p.total_price) FROM purchases p
              WHERE p.master_id = :masterId AND p.vendor_id = v.id
                AND p.payment_type = 'credit' AND p.invoice_date < :until) AS credit_purchases,
            (SELECT SUM(r.total_amount) FROM purchase_returns r
              WHERE r.master_id = :masterId AND r.to_vendor = v.id
                AND r.payment_type = 'paid' AND r.date < :until) AS returns,
            (SELECT SUM(b.amount) FROM purchase_books b
              WHERE b.master_id = :masterId AND b.vendor_id = v.id
                AND b.date < :until) AS payments,
            (SELECT MAX(b.date) FROM purchase_books b
              WHERE b.master_id = :masterId AND b.vendor_id = v.id
                AND b.date < :until) AS last_payment
     FROM vendors v
     WHERE v.master_id = :masterId AND v.vendor_type = 'supplier'${vendorSql}
     ORDER BY v.name ASC`,
    replacements
  )

  const rows = vendors
    .map((vendor) => {
      const opening = num(vendor.opening_balance)
      const credit = num(vendor.credit_purchases)
      const returns = num(vendor.returns)
      const payments = num(vendor.payments)
      return {
        vendor_name: vendor.vendor_name,
        opening_balance: round(opening),
        credit_purchases: round(credit),
        returns: round(returns),
        payments: round(payments),
        balance: round(opening + credit - returns - payments),
        last_payment: vendor.last_payment,
      }
    })
    .filter(
      (row) =>
        filter.vendor_id ||
        row.balance ||
        row.credit_purchases ||
        row.payments ||
        row.opening_balance
    )
    .sort((a, b) => b.balance - a.balance)

  const totals = sumRows(rows, [
    'opening_balance',
    'credit_purchases',
    'returns',
    'payments',
    'balance',
  ])

  return {
    meta: [{ label: 'As of', value: formatValue(asOf, 'date') }],
    summary: [
      { label: 'Suppliers', value: rows.length, type: 'number' },
      {
        label: 'With Balance',
        value: rows.filter((row) => row.balance > 0).length,
        type: 'number',
      },
      { label: 'Total Outstanding', value: totals.balance, type: 'currency' },
      { label: 'Paid', value: totals.payments, type: 'currency' },
    ],
    chart: {
      type: 'bar',
      title: 'Top 10 outstanding suppliers',
      x: 'vendor_name',
      series: [{ key: 'balance', label: 'Outstanding' }],
      data: rows.filter((row) => row.balance > 0).slice(0, 10),
    },
    sections: [
      {
        key: 'suppliers',
        title: 'Suppliers',
        columns: COLUMNS,
        rows,
        total: { vendor_name: 'Total', ...totals },
      },
    ],
  }
}

export default {
  key: 'supplier_outstanding',
  title: 'Supplier Outstanding',
  description:
    'Amount owed to each supplier as of a date, matching the purchase book.',
  group: 'Purchases',
  audience: 'tenant',
  schema: schemaOf('vendor_id', 'as_of'),
  scope: null,
  build,
}
