import ExcelJS from 'exceljs'
import dayjs from 'dayjs'
import { formatValue, toDate, toNumber } from './report.js'

const CURRENCY_FORMAT = '#,##0.00'
const DATE_FORMAT = 'dd-mm-yyyy'
const MIN_WIDTH = 10
const MAX_WIDTH = 50

const sheetName = (title, used) => {
  const base = (title || 'Sheet').replace(/[\\/*?:[\]]/g, ' ').slice(0, 31)
  let name = base
  let i = 2
  while (used.has(name)) {
    const suffix = ` (${i++})`
    name = base.slice(0, 31 - suffix.length) + suffix
  }
  used.add(name)
  return name
}

const cellValue = (value, type) => {
  if (type === 'date') return toDate(value)
  if (type === 'currency' || type === 'number') return toNumber(value)
  return value === null || value === undefined ? '' : String(value)
}

const writeEntries = (sheet, entries, startRow) => {
  let rowIndex = startRow
  for (const entry of entries) {
    const row = sheet.getRow(rowIndex++)
    row.getCell(1).value = entry.label
    row.getCell(1).font = { bold: true }
    row.getCell(2).value = cellValue(entry.value, entry.type || 'text')
    if (entry.type === 'currency') row.getCell(2).numFmt = CURRENCY_FORMAT
    if (entry.type === 'date') row.getCell(2).numFmt = DATE_FORMAT
  }
  return rowIndex
}

const writeSection = (sheet, report, section, { includeSummary }) => {
  sheet.getCell(1, 1).value = report.title
  sheet.getCell(1, 1).font = { bold: true, size: 14 }

  let rowIndex = 2
  if (report.sections.length > 1) {
    sheet.getCell(rowIndex, 1).value = section.title
    sheet.getCell(rowIndex, 1).font = { bold: true, size: 12 }
    rowIndex++
  }

  rowIndex = writeEntries(
    sheet,
    [
      ...report.meta,
      { label: 'Generated At', value: dayjs().format('DD-MM-YYYY HH:mm') },
    ],
    rowIndex
  )

  if (includeSummary && report.summary?.length) {
    rowIndex++
    sheet.getCell(rowIndex, 1).value = 'Summary'
    sheet.getCell(rowIndex, 1).font = { bold: true, size: 12 }
    rowIndex = writeEntries(sheet, report.summary, rowIndex + 1)
  }

  rowIndex++
  const headerRowIndex = rowIndex
  const headerRow = sheet.getRow(headerRowIndex)
  section.columns.forEach((column, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = column.header
    cell.font = { bold: true }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    }
    cell.border = { bottom: { style: 'thin' } }
  })

  for (const record of section.rows) {
    const row = sheet.getRow(++rowIndex)
    section.columns.forEach((column, i) => {
      const cell = row.getCell(i + 1)
      cell.value = cellValue(record[column.key], column.type)
      if (column.type === 'currency') cell.numFmt = CURRENCY_FORMAT
      if (column.type === 'date') cell.numFmt = DATE_FORMAT
    })
  }

  if (!section.rows.length) {
    sheet.getCell(rowIndex + 1, 1).value = 'No records found'
    sheet.getCell(rowIndex + 1, 1).font = { italic: true }
  }

  sheet.views = [{ state: 'frozen', ySplit: headerRowIndex }]

  section.columns.forEach((column, i) => {
    const longest = section.rows.reduce(
      (max, record) =>
        Math.max(max, formatValue(record[column.key], column.type).length),
      column.header.length
    )
    sheet.getColumn(i + 1).width = Math.min(
      MAX_WIDTH,
      Math.max(MIN_WIDTH, longest + 2)
    )
  })
  if (sheet.getColumn(1).width < 18) sheet.getColumn(1).width = 18
}

/**
 * @param {import('./report.js').Report} report
 * @returns {Promise<Buffer>}
 */
export const renderXlsx = async (report) => {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Farmora'
  workbook.created = new Date()

  const used = new Set()
  report.sections.forEach((section, index) => {
    const sheet = workbook.addWorksheet(sheetName(section.title, used))
    writeSection(sheet, report, section, { includeSummary: index === 0 })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
