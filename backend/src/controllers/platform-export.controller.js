import platformExportService from '@services/exports/platform-export.service'
import exportHandler from '@utils/export/export-handler'
import {
  parsePackageFilter,
  parseReferralFilter,
  parseUserFilter,
} from '@utils/list-filters'

const platformExportController = {
  subscribers: exportHandler(
    parseUserFilter,
    platformExportService.subscribers
  ),
  packages: exportHandler(parsePackageFilter, platformExportService.packages),
  referrals: exportHandler(
    parseReferralFilter,
    platformExportService.referrals
  ),
  referralLedger: exportHandler(
    (query, req) => req.params.partner_id,
    platformExportService.referralLedger
  ),
}

export default platformExportController
