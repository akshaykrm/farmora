import configExportService from '@services/exports/config-export.service'
import exportHandler from '@utils/export/export-handler'
import {
  parseBatchFilter,
  parseFarmFilter,
  parseItemCategoryFilter,
  parseSeasonFilter,
  parseUserFilter,
  parseVendorFilter,
} from '@utils/list-filters'

const configExportController = {
  items: exportHandler(parseItemCategoryFilter, configExportService.items),
  farms: exportHandler(parseFarmFilter, configExportService.farms),
  seasons: exportHandler(parseSeasonFilter, configExportService.seasons),
  batches: exportHandler(parseBatchFilter, configExportService.batches),
  vendors: exportHandler(parseVendorFilter, configExportService.vendors),
  users: exportHandler(parseUserFilter, configExportService.users),
}

export default configExportController
