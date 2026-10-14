import dayjs from 'dayjs'
import { schemaOf } from '../filters.js'
import { num, query, sumRows } from '../helpers.js'

const COLUMNS = [
  { key: 'company_name', header: 'Company', width: 1.5 },
  { key: 'package_name', header: 'Package' },
  { key: 'valid_to', header: 'Valid To', type: 'date' },
  { key: 'farms', header: 'Farms', type: 'number', width: 0.6 },
  { key: 'open_batches', header: 'Open Batches', type: 'number', width: 0.8 },
  { key: 'batches', header: 'All Batches', type: 'number', width: 0.8 },
  { key: 'staff', header: 'Staff', type: 'number', width: 0.6 },
  { key: 'daily_logs_30d', header: 'Logs (30d)', type: 'number', width: 0.8 },
  { key: 'sales_30d', header: 'Sales (30d)', type: 'number', width: 0.8 },
  { key: 'last_login', header: 'Last Login', type: 'date' },
]

const build = async () => {
  const since = dayjs().subtract(30, 'day').startOf('day').toDate()
  const companies = await query(
    `SELECT u.id, u.name AS company_name, u.last_login, sub.valid_to, sub.package_name,
            (SELECT COUNT(*) FROM farms f WHERE f.master_id = u.id) AS farms,
            (SELECT COUNT(*) FROM batches b WHERE b.master_id = u.id) AS batches,
            (SELECT COUNT(*) FROM batches b
              WHERE b.master_id = u.id AND b.closed_on IS NULL) AS open_batches,
            (SELECT COUNT(*) FROM users st
              WHERE st.parent_id = u.id AND st.user_type = 'staff') AS staff,
            (SELECT COUNT(*) FROM batch_daily_logs l
              WHERE l.master_id = u.id AND l.created_at >= :since) AS daily_logs_30d,
            (SELECT COUNT(*) FROM sales s
              WHERE s.master_id = u.id AND s.deleted_at IS NULL
                AND s.date >= :since) AS sales_30d
     FROM users u
     LEFT JOIN LATERAL (
       SELECT s.valid_to, pk.name AS package_name
       FROM subscriptions s LEFT JOIN packages pk ON pk.id = s.package_id
       WHERE s.user_id = u.id AND s.deleted_at IS NULL
       ORDER BY s.valid_to DESC LIMIT 1
     ) sub ON TRUE
     WHERE u.user_type = 'manager'
     ORDER BY u.name ASC`,
    { since }
  )

  const rows = companies.map((row) => ({
    company_name: row.company_name,
    package_name: row.package_name,
    valid_to: row.valid_to,
    farms: num(row.farms),
    open_batches: num(row.open_batches),
    batches: num(row.batches),
    staff: num(row.staff),
    daily_logs_30d: num(row.daily_logs_30d),
    sales_30d: num(row.sales_30d),
    last_login: row.last_login,
  }))
  const totals = sumRows(rows, [
    'farms',
    'open_batches',
    'batches',
    'staff',
    'daily_logs_30d',
    'sales_30d',
  ])
  const active = rows.filter(
    (row) => row.valid_to && dayjs(row.valid_to).isAfter(dayjs())
  ).length
  const inactive = rows.filter(
    (row) => !row.daily_logs_30d && !row.sales_30d
  ).length

  return {
    meta: [{ label: 'Activity Window', value: 'Last 30 days' }],
    summary: [
      { label: 'Companies', value: rows.length, type: 'number' },
      { label: 'Active Subscriptions', value: active, type: 'number' },
      { label: 'No Activity (30d)', value: inactive, type: 'number' },
      { label: 'Open Batches', value: totals.open_batches, type: 'number' },
    ],
    chart: {
      type: 'bar',
      title: 'Most active companies (last 30 days)',
      x: 'company_name',
      series: [
        { key: 'daily_logs_30d', label: 'Daily logs' },
        { key: 'sales_30d', label: 'Sales' },
      ],
      data: [...rows]
        .sort(
          (a, b) =>
            b.daily_logs_30d + b.sales_30d - (a.daily_logs_30d + a.sales_30d)
        )
        .slice(0, 10),
    },
    sections: [
      {
        key: 'companies',
        title: 'Companies',
        columns: COLUMNS,
        rows,
        total: { company_name: 'Total', ...totals },
      },
    ],
  }
}

export default {
  key: 'tenant_usage',
  title: 'Tenant Usage',
  description: 'Farms, batches, staff and recent activity for each company.',
  group: 'Platform',
  audience: 'platform',
  schema: schemaOf(),
  scope: null,
  build,
}
