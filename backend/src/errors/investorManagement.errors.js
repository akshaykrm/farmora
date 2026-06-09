class InvestorManagementError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvestorManagementError'
  }
}

export class InvestorNotFoundError extends InvestorManagementError {
  constructor(investorId) {
    super(`Investor ${investorId} not found`)
    this.code = 'INVESTOR_NOT_FOUND'
    this.statusCode = 404
  }
}

export class InvestorPhoneConflictError extends InvestorManagementError {
  constructor(phone) {
    super(`Investor with phone ${phone} already exists`)
    this.code = 'INVESTOR_PHONE_CONFLICT'
    this.statusCode = 409
  }
}
