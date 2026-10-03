import { readFileSync } from 'node:fs'

const INSERT_RE = /INSERT INTO `(\w+)` \(([^)]*)\) VALUES\s*/g

const ESCAPES = { n: '\n', r: '\r', t: '\t', 0: '\0', Z: '\x1a' }

const parseValues = (sql, start, columns) => {
  const rows = []
  let i = start
  let row = null
  let token = ''
  let quoted = false

  const pushValue = () => {
    if (quoted) {
      row.push(token)
    } else {
      const raw = token.trim()
      row.push(raw.toUpperCase() === 'NULL' ? null : raw)
    }
    token = ''
    quoted = false
  }

  while (i < sql.length) {
    const ch = sql[i]

    if (row === null) {
      if (ch === '(') {
        row = []
      } else if (ch === ';') {
        return { rows, end: i + 1 }
      }
      i++
      continue
    }

    if (ch === "'") {
      quoted = true
      token = ''
      i++
      while (i < sql.length) {
        const c = sql[i]
        if (c === '\\') {
          const next = sql[i + 1]
          token += ESCAPES[next] ?? next
          i += 2
        } else if (c === "'" && sql[i + 1] === "'") {
          token += "'"
          i += 2
        } else if (c === "'") {
          i++
          break
        } else {
          token += c
          i++
        }
      }
      continue
    }

    if (ch === ',') {
      pushValue()
    } else if (ch === ')') {
      pushValue()
      rows.push(Object.fromEntries(columns.map((col, idx) => [col, row[idx]])))
      row = null
    } else {
      token += ch
    }
    i++
  }

  return { rows, end: i }
}

export const parseMysqlDump = (filePath) => {
  const sql = readFileSync(filePath, 'utf8')
  const tables = {}

  INSERT_RE.lastIndex = 0
  let match
  while ((match = INSERT_RE.exec(sql))) {
    const table = match[1]
    const columns = match[2].split(',').map((c) => c.trim().replace(/`/g, ''))
    const { rows, end } = parseValues(sql, INSERT_RE.lastIndex, columns)
    tables[table] = (tables[table] || []).concat(rows)
    INSERT_RE.lastIndex = end
  }

  return tables
}
