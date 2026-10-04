import PDFDocument from 'pdfkit'
import dayjs from 'dayjs'
import { formatValue } from './report.js'

const MARGIN = 30
const FONT = 'Helvetica'
const FONT_BOLD = 'Helvetica-Bold'
const FONT_SIZE = 9
const CELL_PADDING = 4
const HEADER_FILL = '#E5E7EB'
const BORDER_COLOR = '#D1D5DB'

const isNumeric = (type) => type === 'currency' || type === 'number'

const columnWidths = (doc, columns) => {
  const available = doc.page.width - MARGIN * 2
  const totalWeight = columns.reduce((sum, c) => sum + (c.width || 1), 0)
  return columns.map((c) => ((c.width || 1) / totalWeight) * available)
}

const pageBottom = (doc) => doc.page.height - MARGIN - 20

const rowHeight = (doc, values, widths, font) => {
  doc.font(font).fontSize(FONT_SIZE)
  const heights = values.map((text, i) =>
    doc.heightOfString(text, { width: widths[i] - CELL_PADDING * 2 })
  )
  return Math.max(...heights, FONT_SIZE) + CELL_PADDING * 2
}

const drawRow = (doc, values, widths, columns, { header = false } = {}) => {
  const font = header ? FONT_BOLD : FONT
  const height = rowHeight(doc, values, widths, font)
  const y = doc.y
  let x = MARGIN

  if (header) {
    doc
      .rect(
        MARGIN,
        y,
        widths.reduce((a, b) => a + b, 0),
        height
      )
      .fill(HEADER_FILL)
  }

  doc.fillColor('#111827').font(font).fontSize(FONT_SIZE)
  values.forEach((text, i) => {
    doc.text(text, x + CELL_PADDING, y + CELL_PADDING, {
      width: widths[i] - CELL_PADDING * 2,
      align: isNumeric(columns[i].type) ? 'right' : 'left',
    })
    x += widths[i]
  })

  doc
    .moveTo(MARGIN, y + height)
    .lineTo(x, y + height)
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.5)
    .stroke()

  doc.x = MARGIN
  doc.y = y + height
}

const drawSection = (doc, section, showTitle) => {
  const widths = columnWidths(doc, section.columns)
  const headers = section.columns.map((c) => c.header)

  if (doc.y + 60 > pageBottom(doc)) doc.addPage()

  if (showTitle) {
    doc.moveDown(0.5)
    doc.font(FONT_BOLD).fontSize(12).fillColor('#111827')
    doc.text(section.title, MARGIN)
    doc.moveDown(0.3)
  }

  drawRow(doc, headers, widths, section.columns, { header: true })

  if (!section.rows.length) {
    doc.font(FONT).fontSize(FONT_SIZE).fillColor('#6B7280')
    doc.text('No records found', MARGIN + CELL_PADDING, doc.y + CELL_PADDING)
    doc.moveDown(0.5)
    return
  }

  for (const record of section.rows) {
    const values = section.columns.map((c) =>
      formatValue(record[c.key], c.type)
    )
    const height = rowHeight(doc, values, widths, FONT)
    if (doc.y + height > pageBottom(doc)) {
      doc.addPage()
      drawRow(doc, headers, widths, section.columns, { header: true })
    }
    drawRow(doc, values, widths, section.columns)
  }
}

const drawEntries = (doc, entries) => {
  for (const entry of entries) {
    doc.font(FONT_BOLD).fontSize(FONT_SIZE).fillColor('#111827')
    doc.text(`${entry.label}: `, MARGIN, doc.y, { continued: true })
    doc.font(FONT).text(formatValue(entry.value, entry.type || 'text'))
  }
}

/**
 * @param {import('./report.js').Report} report
 * @returns {Promise<Buffer>}
 */
export const renderPdf = (report) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: MARGIN,
      bufferPages: true,
      info: { Title: report.title, Creator: 'Farmora' },
    })

    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.font(FONT_BOLD).fontSize(16).fillColor('#111827').text(report.title)
    doc
      .font(FONT)
      .fontSize(FONT_SIZE)
      .fillColor('#6B7280')
      .text(`Generated at ${dayjs().format('DD-MM-YYYY HH:mm')}`)
    doc.moveDown(0.5)

    if (report.meta.length) drawEntries(doc, report.meta)

    if (report.summary?.length) {
      doc.moveDown(0.5)
      doc.font(FONT_BOLD).fontSize(12).fillColor('#111827').text('Summary')
      drawEntries(doc, report.summary)
    }

    doc.moveDown(0.5)
    const showTitles = report.sections.length > 1
    for (const section of report.sections) {
      drawSection(doc, section, showTitles)
    }

    const range = doc.bufferedPageRange()
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i)
      doc
        .font(FONT)
        .fontSize(8)
        .fillColor('#6B7280')
        .text(
          `Page ${i + 1} of ${range.count}`,
          MARGIN,
          doc.page.height - MARGIN - 10,
          {
            width: doc.page.width - MARGIN * 2,
            align: 'right',
            lineBreak: false,
          }
        )
    }

    doc.end()
  })
