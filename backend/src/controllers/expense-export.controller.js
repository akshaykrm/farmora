import expenseExportService from '@services/exports/expense-export.service'
import exportHandler from '@utils/export/export-handler'
import {
  parseIntegrationBookFilter,
  parseItemReturnFilter,
  parsePurchaseBookFilter,
  parsePurchaseFilter,
  parseWorkingCostFilter,
} from '@utils/expense-filters'

const expenseExportController = {
  purchases: exportHandler(parsePurchaseFilter, expenseExportService.purchases),
  itemReturns: exportHandler(
    parseItemReturnFilter,
    expenseExportService.itemReturns
  ),
  purchaseBook: exportHandler(
    parsePurchaseBookFilter,
    expenseExportService.purchaseBook
  ),
  integrationBook: exportHandler(
    parseIntegrationBookFilter,
    expenseExportService.integrationBook
  ),
  workingCost: exportHandler(
    parseWorkingCostFilter,
    expenseExportService.workingCost
  ),
}

export default expenseExportController
