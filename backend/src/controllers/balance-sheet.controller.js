import balanceSheetService from '@services/balance-sheet.service'
import asyncHandler from '@utils/async-handler'
import logger from '@utils/logger'
import { parseCashFlowFilter } from '@utils/list-filters'

const getBalanceSheet = async (req, res) => {
  const filter = parseCashFlowFilter(req.query)

  logger.info(
    { filter, actor_id: req.user.id },
    'Balance sheet request received'
  )

  const data = await balanceSheetService.getBalanceSheet(filter, req.user)

  res.success(data, {
    message: 'Balance sheet fetched successfully',
  })
}

const balanceSheetController = {
  getBalanceSheet: asyncHandler(getBalanceSheet),
}

export default balanceSheetController
