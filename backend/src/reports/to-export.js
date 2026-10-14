import { compactMeta, formatValue } from '@utils/export/report'

/**
 * The total row puts "Total" in the first column, so a first column typed as
 * a date or number is exported as pre-formatted text instead.
 */
const withTotalRow = (section) => {
  if (!section.total) return { columns: section.columns, rows: section.rows }
  const [first, ...rest] = section.columns
  if (!first.type || first.type === 'text') {
    return { columns: section.columns, rows: [...section.rows, section.total] }
  }
  return {
    columns: [{ ...first, type: 'text' }, ...rest],
    rows: [
      ...section.rows.map((row) => ({
        ...row,
        [first.key]: formatValue(row[first.key], first.type),
      })),
      section.total,
    ],
  }
}

/** Converts a report result into the shared export Report shape. */
export const toExportReport = (definition, result) => ({
  title: definition.title,
  filename: `report-${definition.key.replace(/_/g, '-')}`,
  meta: compactMeta(result.meta || []),
  summary: result.summary || [],
  sections: result.sections.map((section) => ({
    title: section.title,
    ...withTotalRow(section),
  })),
})

export const exportRowCount = (report) =>
  report.sections.reduce((sum, section) => sum + section.rows.length, 0)
