import dayjs from 'dayjs'
import { schemaOf } from '../filters.js'
import { query } from '../helpers.js'

const EXPIRED_LOOKBACK_DAYS = 30

const COLUMNS = [
  { key: 'company_name', header: 'Company', width: 1.5 },
  { key: 'email', header: 'Email', width: 1.5 },
  { key: 'phone', header: 'Phone' },
  { key: 'package_name', header: 'Package' },
  { key: 'valid_to', header: 'Valid To', type: 'date' },
  { key: 'days_left', header: 'Days Left', type: 'number', width: 0.7 },
  { key: 'state', header: 'Status', width: 0.8 },
]

/**
 * Each company's latest subscription, kept when it ends within `days` or has
 * already ended in the last 30 days.
 */
const build = async (filter) => {
  const days = filter.days || 30
  const today = dayjs().startOf('day')
  const latest = await query(
    `SELECT * FROM (
       SELECT DISTINCT ON (s.user_id) s.user_id, s.valid_to, u.name AS company_name,
              u.email, u.phone, pk.name AS package_name
       FROM subscriptions s
       JOIN users u ON u.id = s.user_id AND u.user_type = 'manager'
       LEFT JOIN packages pk ON pk.id = s.package_id
       WHERE s.deleted_at IS NULL
       ORDER BY s.user_id, s.valid_to DESC
     ) latest
     WHERE valid_to >= :from AND valid_to < :until
     ORDER BY valid_to ASC`,
    {
      from: today.subtract(EXPIRED_LOOKBACK_DAYS, 'day').toDate(),
      until: today.add(days + 1, 'day').toDate(),
    }
  )

  const rows = latest.map((row) => {
    const daysLeft = dayjs(row.valid_to).startOf('day').diff(today, 'day')
    return {
      company_name: row.company_name,
      email: row.email,
      phone: row.phone,
      package_name: row.package_name,
      valid_to: row.valid_to,
      days_left: daysLeft,
      state: daysLeft < 0 ? 'Expired' : 'Expiring',
    }
  })
  const expired = rows.filter((row) => row.days_left < 0).length

  return {
    meta: [
      { label: 'Expiring Within', value: `${days} days` },
      { label: 'Expired In Last', value: `${EXPIRED_LOOKBACK_DAYS} days` },
    ],
    summary: [
      { label: 'Expiring', value: rows.length - expired, type: 'number' },
      { label: 'Expired', value: expired, type: 'number' },
      {
        label: 'Within 7 Days',
        value: rows.filter((row) => row.days_left >= 0 && row.days_left <= 7)
          .length,
        type: 'number',
      },
    ],
    chart: null,
    sections: [
      { key: 'subscriptions', title: 'Subscriptions', columns: COLUMNS, rows },
    ],
  }
}

export default {
  key: 'expiring_subscriptions',
  title: 'Expiring Subscriptions',
  description:
    'Companies whose subscription ends soon or ended in the last 30 days.',
  group: 'Platform',
  audience: 'platform',
  schema: schemaOf('days'),
  scope: null,
  build,
}
