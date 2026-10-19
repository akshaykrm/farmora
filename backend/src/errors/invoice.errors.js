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
