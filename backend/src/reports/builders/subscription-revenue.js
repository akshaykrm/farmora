import dayjs from 'dayjs'
import { schemaOf } from '../filters.js'
import { dateRangeSql, num, query, round, sumRows } from '../helpers.js'
import { dateMeta } from '@services/exports/helpers'

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const build = async (filter) => {
  const range = dateRangeSql('pay.created_at', filter, 'pay')
  const where = `pay.status = 'completed' AND pay.deleted_at IS NULL${range.sql}`
  const replacements = { tz: TIMEZONE, ...range.replacements }
  const from = `FROM payments pay
     LEFT JOIN subscriptions s ON s.id = pay.subscription_id
     LEFT JOIN packages pk ON pk.id = s.package_id`

  const [months, packages] = await Promise.all([
    query(
      `SELECT to_char(pay.created_at AT TIME ZONE :tz, 'YYYY-MM') AS month,
              COUNT(*) AS payments,
              SUM(pay.amount) FILTER (WHERE s.kind = 'initial') AS initial,
              SUM(pay.amount) FILTER (WHERE s.kind = 'renewal') AS renewal,
              SUM(pay.amount) FILTER (WHERE s.kind IS NULL) AS other,
              SUM(pay.amount) AS amount
       ${from} WHERE ${where}
       GROUP BY 1 ORDER BY 1`,
      replacements
    ),
    query(
      `SELECT COALESCE(pk.name, 'Unknown') AS package_name, COUNT(*) AS payments,
              COUNT(*) FILTER (WHERE s.kind = 'initial') AS new_subscriptions,
              COUNT(*) FILTER (WHERE s.kind = 'renewal') AS renewals,
              SUM(pay.amount) AS amount
       ${from} WHERE ${where}
       GROUP BY pk.name ORDER BY SUM(pay.amount) DESC`,
      replacements
    ),
  ])

  const monthRows = months.map((row) => ({
    month: dayjs(`${row.month}-01`).format('MMM YYYY'),
    payments: num(row.payments),
    initial: round(row.initial),
    renewal: round(row.renewal),
    other: round(row.other),
    amount: round(row.amount),
  }))
  const packageRows = packages.map((row) => ({
    package_name: row.package_name,
    payments: num(row.payments),
    new_subscriptions: num(row.new_subscriptions),
    renewals: num(row.renewals),
    amount: round(row.amount),
  }))
  const monthTotals = sumRows(monthRows, [
    'payments',
    'initial',
    'renewal',
    'other',
    'amount',
  ])
  const packageTotals = sumRows(packageRows, [
    'payments',
    'new_subscriptions',
    'renewals',
    'amount',
  ])

  return {
    meta: [dateMeta(filter.start_date, filter.end_date)],
    summary: [
      { label: 'Revenue', value: monthTotals.amount, type: 'currency' },
      {
        label: 'New Subscriptions',
        value: monthTotals.initial,
        type: 'currency',
      },
      { label: 'Renewals', value: monthTotals.renewal, type: 'currency' },
      { label: 'Other', value: monthTotals.other, type: 'currency' },
      { label: 'Payments', value: monthTotals.payments, type: 'number' },
    ],
    chart: {
      type: 'bar',
      title: 'Revenue by month',
      x: 'month',
      series: [
        { key: 'initial', label: 'New' },
        { key: 'renewal', label: 'Renewal' },
        { key: 'other', label: 'Other' },
      ],
      stacked: true,
      data: monthRows,
    },
    sections: [
      {
        key: 'months',
        title: 'By Month',
        columns: [
          { key: 'month', header: 'Month', width: 1.3 },
          { key: 'payments', header: 'Payments', type: 'number' },
          { key: 'initial', header: 'New', type: 'currency' },
          { key: 'renewal', header: 'Renewal', type: 'currency' },
          { key: 'other', header: 'Other', type: 'currency' },
          { key: 'amount', header: 'Total', type: 'currency' },
        ],
        rows: monthRows,
        total: { month: 'Total', ...monthTotals },
      },
      {
        key: 'packages',
        title: 'By Package',
        columns: [
          { key: 'package_name', header: 'Package', width: 1.5 },
          { key: 'payments', header: 'Payments', type: 'number' },
          { key: 'new_subscriptions', header: 'New', type: 'number' },
          { key: 'renewals', header: 'Renewals', type: 'number' },
          { key: 'amount', header: 'Revenue', type: 'currency' },
        ],
        rows: packageRows,
        total: { package_name: 'Total', ...packageTotals },
      },
    ],
  }
}

export default {
  key: 'subscription_revenue',
  title: 'Subscription Revenue',
  description:
    'Completed subscription payments by month and package, new vs renewal.',
  group: 'Platform',
  audience: 'platform',
  schema: schemaOf('start_date', 'end_date'),
  scope: null,
  build,
}
