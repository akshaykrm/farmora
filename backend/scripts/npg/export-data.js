/**
 * Converts the legacy NPG MySQL dump into scripts/npg/npg-data.json, keeping
 * only the tables and columns the importer needs. Run locally; the server
 * only needs the generated JSON.
 *
 *   bun scripts/npg/export-data.js --file <npg_farm_db.sql> [--out <path>]
 */
import { writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { parseMysqlDump } from './parse-dump.js'
import { DEFAULT_DATA_FILE } from './data-file.js'

const TABLES = [
  'seasons',
  'season_close_report',
  'farms',
  'batchs',
  'batch_close_report',
  'vendors',
  'buyers',
  'expense',
  'purchase_book',
  'stock_return_issue',
  'integration_book',
  'workingcost_book',
  'sales',
  'sales_book',
  'general_transaction',
  'invester',
  'investment',
  'invester_season_profit',
]

const BUSINESS_PLUS_CASH_TYPES = [
  'rental_farm_cost',
  'rental_farm_salary',
  'egg_setting_book',
]

const USER_COLUMNS = [
  'id',
  'username',
  'name',
  'password',
  'phone',
  'banned',
  'created',
]

const { values: args } = parseArgs({
  options: {
    file: { type: 'string' },
    out: { type: 'string', default: DEFAULT_DATA_FILE },
  },
})

if (!args.file) {
  console.error('--file <path to npg_farm_db.sql> is required')
  process.exit(1)
}

const dump = parseMysqlDump(args.file)
const data = { exported_at: new Date().toISOString() }

for (const table of TABLES) {
  if (!dump[table]) {
    console.error(`Table "${table}" not found in dump`)
    process.exit(1)
  }
  data[table] = dump[table]
}
data.business_plus_cash = (dump.balanse_sheet || []).filter((r) =>
  BUSINESS_PLUS_CASH_TYPES.includes(r.type)
)
data.users = (dump.users || []).map((u) =>
  Object.fromEntries(USER_COLUMNS.map((col) => [col, u[col] ?? null]))
)

writeFileSync(args.out, JSON.stringify(data))
console.log(`Wrote ${args.out}`)
console.table(
  Object.fromEntries(
    Object.entries(data)
      .filter(([, rows]) => Array.isArray(rows))
      .map(([table, rows]) => [table, rows.length])
  )
)
