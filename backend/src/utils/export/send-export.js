import dayjs from 'dayjs'
import { EXPORT_FORMATS } from './report.js'
import { renderXlsx } from './excel.js'
import { renderPdf } from './pdf.js'

const renderers = {
  xlsx: renderXlsx,
  pdf: renderPdf,
}

/**
 * @param {import('express').Response} res
 * @param {'xlsx' | 'pdf'} format
 * @param {import('./report.js').Report} report
 */
export const sendExport = async (res, format, report) => {
  const { extension, contentType } = EXPORT_FORMATS[format]
  const buffer = await renderers[format](report)
  const filename = `${report.filename}-${dayjs().format('YYYY-MM-DD')}.${extension}`

  res.status(200)
  res.setHeader('Content-Type', contentType)
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('Content-Length', buffer.length)
  res.end(buffer)
}

export default sendExport
