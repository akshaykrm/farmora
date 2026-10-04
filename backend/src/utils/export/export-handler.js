import asyncHandler from '@utils/async-handler'
import sendExport from './send-export.js'

/**
 * Builds an Express handler that parses the list filters from the query,
 * builds a report and streams it in the requested format.
 *
 * @param {(query: Object, req: import('express').Request) => Object} parseFilter
 * @param {(filter: Object, currentUser: Object, req: import('express').Request) => Promise<import('./report.js').Report>} buildReport
 */
export const exportHandler = (parseFilter, buildReport) =>
  asyncHandler(async (req, res) => {
    const filter = parseFilter(req.query, req)
    const report = await buildReport(filter, req.user, req)
    await sendExport(res, req.query.format, report)
  })

export default exportHandler
