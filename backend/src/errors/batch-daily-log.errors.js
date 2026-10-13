class BatchDailyLogError extends Error {
  constructor(message) {
    super(message)
    this.name = 'BatchDailyLogError'
  }
}

export class DailyLogNotFoundError extends BatchDailyLogError {
  constructor(logId) {
    super(`Daily log ${logId} not found`)
    this.code = 'DAILY_LOG_NOT_FOUND'
    this.statusCode = 404
  }
}

export class DailyLogDuplicateDateError extends BatchDailyLogError {
  constructor(date) {
    super(`A daily log already exists for ${date}`)
    this.code = 'DAILY_LOG_DUPLICATE_DATE'
    this.statusCode = 409
  }
}

export class DailyLogBatchClosedError extends BatchDailyLogError {
  constructor() {
    super('Batch is closed. The daily log can no longer be changed.')
    this.code = 'DAILY_LOG_BATCH_CLOSED'
    this.statusCode = 400
  }
}

export class DailyLogStartDateMissingError extends BatchDailyLogError {
  constructor() {
    super('Set the daily sheet start date before adding daily logs')
    this.code = 'DAILY_LOG_START_DATE_MISSING'
    this.statusCode = 400
  }
}

export class DailyLogDateError extends BatchDailyLogError {
  constructor(message) {
    super(message)
    this.code = 'DAILY_LOG_INVALID_DATE'
    this.statusCode = 400
  }
}
