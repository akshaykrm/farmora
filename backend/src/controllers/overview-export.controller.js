import overviewExportService from '@services/exports/overview-export.service'
import exportHandler from '@utils/export/export-handler'
import {
  parseBatchOverviewFilter,
  parseInvestorFilter,
  parseInvestorLedgerFilter,
  parseSeasonOverviewFilter,
} from '@utils/list-filters'

const overviewExportController = {
  batchOverview: exportHandler(
    parseBatchOverviewFilter,
    overviewExportService.batchOverview
  ),
  seasonOverview: exportHandler(
    parseSeasonOverviewFilter,
    overviewExportService.seasonOverview
  ),
  investors: exportHandler(
    parseInvestorFilter,
    overviewExportService.investors
  ),
  investorLedger: exportHandler(
    parseInvestorLedgerFilter,
    overviewExportService.investorLedger
  ),
}

export default overviewExportController
