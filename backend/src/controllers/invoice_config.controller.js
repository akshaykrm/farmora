import invoiceService from '@services/invoice_config.service'
import asyncHandler from '@utils/async-handler'

const handleGetNextInvoiceNumber = async (req, res) => {
  const newNumber = await invoiceService.getNextInvoiceNumber(req.user)

  res.success(newNumber, {
    message: 'Next invoice number',
  })
}

const invoiceController = {
  handleGetNextInvoiceNumber: asyncHandler(handleGetNextInvoiceNumber),
}

export default invoiceController
