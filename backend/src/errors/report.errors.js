export class ReportNotFoundError extends Error {
  constructor(key) {
    super(`Report ${key} not found`)
    this.name = 'ReportNotFoundError'
    this.code = 'REPORT_NOT_FOUND'
    this.statusCode = 404
  }
}

export class ReportFilterError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ReportFilterError'
    this.code = 'REPORT_FILTER_INVALID'
    this.statusCode = 400
  }
}

export class ReportCompanyRequiredError extends Error {
  constructor() {
    super('Select a company to view this report')
    this.name = 'ReportCompanyRequiredError'
    this.code = 'REPORT_COMPANY_REQUIRED'
    this.statusCode = 400
  }
}

export class ReportTooLargeError extends Error {
  constructor(count, limit) {
    super(
      `This report has ${count} rows, more than the ${limit} allowed in one export. Narrow the filters and try again.`
    )
    this.name = 'ReportTooLargeError'
    this.code = 'REPORT_TOO_LARGE'
    this.statusCode = 422
    this.details = { count, limit }
  }
}

export class ExportInProgressError extends Error {
  constructor() {
    super('Another export is still running. Please wait for it to finish.')
    this.name = 'ExportInProgressError'
    this.code = 'EXPORT_IN_PROGRESS'
    this.statusCode = 429
  }
}
