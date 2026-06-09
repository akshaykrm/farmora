class LedgerError extends Error {
  constructor(message) {
    super(message)
    this.name = 'LedgerError'
  }
}

export class LedgerTransactionNotFoundError extends LedgerError {
  constructor(transactionId) {
    super(`Transaction ${transactionId} not found`)
    this.code = 'LEDGER_TRANSACTION_NOT_FOUND'
    this.statusCode = 404
  }
}

export class LedgerCapitalExceedsBalanceError extends LedgerError {
  constructor() {
    super('Insufficient capital balance for withdrawal')
    this.code = 'LEDGER_CAPITAL_EXCEEDS_BALANCE'
    this.statusCode = 400
  }
}

export class LedgerProfitExceedsBalanceError extends LedgerError {
  constructor() {
    super('Insufficient profit balance for withdrawal')
    this.code = 'LEDGER_PROFIT_EXCEEDS_BALANCE'
    this.statusCode = 400
  }
}

export class LedgerReversalRequiresReferenceError extends LedgerError {
  constructor() {
    super('Reversal transactions must reference an existing transaction')
    this.code = 'LEDGER_REVERSAL_REQUIRES_REFERENCE'
    this.statusCode = 400
  }
}

export class LedgerReversalReferenceNotFoundError extends LedgerError {
  constructor(referenceId) {
    super(`Referenced transaction ${referenceId} not found`)
    this.code = 'LEDGER_REVERSAL_REFERENCE_NOT_FOUND'
    this.statusCode = 404
  }
}

export class LedgerReversalAmountMustBeNegativeError extends LedgerError {
  constructor() {
    super('Reversal transaction amount must be negative')
    this.code = 'LEDGER_REVERSAL_AMOUNT_MUST_BE_NEGATIVE'
    this.statusCode = 400
  }
}

export class LedgerNonReversalReferenceMustBeNullError extends LedgerError {
  constructor() {
    super('Non-reversal transactions must not have a reference transaction')
    this.code = 'LEDGER_NON_REVERSAL_REFERENCE_MUST_BE_NULL'
    this.statusCode = 400
  }
}

export class LedgerAmountMustBePositiveError extends LedgerError {
  constructor() {
    super('Transaction amount must be positive')
    this.code = 'LEDGER_AMOUNT_MUST_BE_POSITIVE'
    this.statusCode = 400
  }
}
