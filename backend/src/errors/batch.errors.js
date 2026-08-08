class BatchError extends Error {
  constructor(message) {
    super(message)
    this.name = 'BatchError'
  }
}

export class BatchNotFoundError extends BatchError {
  constructor(BatchID) {
    super(`Batch ${BatchID} not found`)
    this.code = 'BATCH_NOT_FOUND'
    this.statusCode = 404
  }
}

export class BatchClosedError extends BatchError {
  constructor() {
    super('Batch is already closed. Logs cannot be added.')
    this.code = 'BATCH_CLOSED'
    this.statusCode = 400
  }
}
