export class InvoiceNumberExistsError extends Error {
  constructor(invoiceNumber, nextInvoiceNumber) {
    super(`Invoice number ${invoiceNumber} already exists`)
    this.name = 'InvoiceNumberExistsError'
    this.code = 'INVOICE_NUMBER_EXISTS'
    this.statusCode = 409
    this.details = {
      invoice_number: invoiceNumber,
      next_invoice_number: nextInvoiceNumber,
    }
  }
}

export class IncompleteInvoicesError extends Error {
  constructor(scope, summary) {
    super(
      `Cannot close ${scope}: ${summary.total} incomplete invoice(s) must be completed first`
    )
    this.name = 'IncompleteInvoicesError'
    this.code = 'INCOMPLETE_INVOICES'
    this.statusCode = 409
    this.details = summary
  }
}
