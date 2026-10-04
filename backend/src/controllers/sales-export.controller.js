import salesExportService from '@services/exports/sales-export.service'
import exportHandler from '@utils/export/export-handler'
import {
  parseCashFlowFilter,
  parseGeneralEntryFilter,
  parseSaleFilter,
  parseSalesBookFilter,
} from '@utils/list-filters'

const salesExportController = {
  sales: exportHandler(parseSaleFilter, salesExportService.sales),
  salesBook: exportHandler(parseSalesBookFilter, salesExportService.salesBook),
  generalExpenses: exportHandler(
    parseGeneralEntryFilter,
    salesExportService.generalExpenses
  ),
  generalSales: exportHandler(
    parseGeneralEntryFilter,
    salesExportService.generalSales
  ),
  cashFlow: exportHandler(parseCashFlowFilter, salesExportService.cashFlow),
}

export default salesExportController
