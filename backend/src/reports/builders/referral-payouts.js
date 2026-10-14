import { schemaOf } from '../filters.js'
import {
  dayStart,
  nextDayStart,
  num,
  query,
  round,
  sumRows,
} from '../helpers.js'
import { dateMeta } from '@services/exports/helpers'

const COLUMNS = [
  { key: 'partner_name', header: 'Partner', width: 1.5 },
  { key: 'code', header: 'Code' },
  { key: 'companies', header: 'Companies', type: 'number', width: 0.8 },
  { key: 'earned_period', header: 'Earned (Period)', type: 'currency' },
  { key: 'paid_period', header: 'Paid (Period)', type: 'currency' },
  { key: 'earned', header: 'Total Earned', type: 'currency' },
  { key: 'paid', header: 'Total Paid', type: 'currency' },
  { key: 'balance', header: 'Balance Due', type: 'currency' },
]

/** Same totals as the referral partner list: bonuses earned minus payments. */
const build = async (filter) => {
  const start = filter.start_date ? dayStart(filter.start_date) : new Date(0)
  const end = filter.end_date
    ? nextDayStart(filter.end_date)
    : new Date('9999-12-31')
  const partners = await query(
    `SELECT p.id, p.name AS partner_name, p.code,
            (SELECT COUNT(*) FROM users u
              WHERE u.referral_partner_id = p.id AND u.user_type = 'manager') AS companies,
            SUM(t.amount) FILTER (WHERE t.type <> 'payment') AS earned,
            SUM(t.amount) FILTER (WHERE t.type = 'payment') AS paid,
            SUM(t.amount) FILTER (WHERE t.type <> 'payment'
              AND t.created_at >= :start AND t.created_at < :end) AS earned_period,
            SUM(t.amount) FILTER (WHERE t.type = 'payment'
              AND t.created_at >= :start AND t.created_at < :end) AS paid_period
     FROM referral_partners p
     LEFT JOIN referral_ledger_transactions t ON t.referral_partner_id = p.id
     GROUP BY p.id, p.name, p.code
     ORDER BY p.name ASC`,
    { start, end }
  )

  const rows = partners.map((row) => ({
    partner_name: row.partner_name,
    code: row.code,
    companies: num(row.companies),
    earned_period: round(row.earned_period),
    paid_period: round(row.paid_period),
    earned: round(row.earned),
    paid: round(row.paid),
    balance: round(num(row.earned) - num(row.paid)),
  }))
  const totals = sumRows(rows, [
    'companies',
    'earned_period',
    'paid_period',
    'earned',
    'paid',
    'balance',
  ])

  return {
    meta: [dateMeta(filter.start_date, filter.end_date, 'Period')],
    summary: [
      { label: 'Partners', value: rows.length, type: 'number' },
      {
        label: 'Earned (Period)',
        value: totals.earned_period,
        type: 'currency',
      },
      { label: 'Paid (Period)', value: totals.paid_period, type: 'currency' },
      { label: 'Balance Due', value: totals.balance, type: 'currency' },
    ],
    chart: {
      type: 'bar',
      title: 'Balance due by partner',
      x: 'partner_name',
      series: [{ key: 'balance', label: 'Balance due' }],
      data: [...rows].sort((a, b) => b.balance - a.balance).slice(0, 10),
    },
    sections: [
      {
        key: 'partners',
        title: 'Referral Partners',
        columns: COLUMNS,
        rows,
        total: { partner_name: 'Total', ...totals },
      },
    ],
  }
}

export default {
  key: 'referral_payouts',
  title: 'Referral Payouts',
  description:
    'Bonuses earned and paid per referral partner, with balance due.',
  group: 'Platform',
  audience: 'platform',
  schema: schemaOf('start_date', 'end_date'),
  scope: null,
  build,
}
