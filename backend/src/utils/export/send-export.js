import dayjs from 'dayjs'
import { EXPORT_FORMATS } from './report.js'
import { renderXlsx, renderXlsxStream } from './excel.js'
import { renderPdf } from './pdf.js'

const renderers = {
  xlsx: renderXlsx,
  pdf: renderPdf,
}

export const XLSX_STREAM_THRESHOLD = 2000

const rowCount = (report) =>
  report.sections.reduce((sum, section) => sum + section.rows.length, 0)

/**
 * @param {import('express').Response} res
 * @param {'xlsx' | 'pdf'} format
 * @param {import('./report.js').Report} report
 */
export const sendExport = async (res, format, report) => {
  const { extension, contentType } = EXPORT_FORMATS[format]
  const filename = `${report.filename}-${dayjs().format('YYYY-MM-DD')}.${extension}`

  if (format === 'xlsx' && rowCount(report) > XLSX_STREAM_THRESHOLD) {
    res.status(200)
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    await renderXlsxStream(report, res)
    return
  }

  const buffer = await renderers[format](report)
  res.status(200)
  res.setHeader('Content-Type', contentType)
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('Content-Length', buffer.length)
  res.end(buffer)
}

export default sendExport
