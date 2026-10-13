import { Op, QueryTypes } from 'sequelize'
import { sequelize } from '@utils/db'
import InvoiceConfig from '@models/invoice_config'
import PurchaseModel from '@models/purchase'
import UserModel from '@models/user'
import { InvoiceNumberExistsError } from '@errors/invoice.errors'
import { tenantMasterId } from '@utils/tenant-scope'

const lastInvoiceNumber = async (masterId, prefix) => {
  const [row] = await sequelize.query(
    `SELECT MAX(CAST(SUBSTRING(invoice_number FROM :start) AS INTEGER)) AS last
       FROM purchases
      WHERE master_id = :masterId
        AND LEFT(invoice_number, :prefixLength) = :prefix
        AND SUBSTRING(invoice_number FROM :start) ~ '^[0-9]{1,9}$'`,
    {
      replacements: {
        masterId,
        prefix: `${prefix}-`,
        prefixLength: prefix.length + 1,
        start: prefix.length + 2,
      },
      type: QueryTypes.SELECT,
    }
  )
  return Number(row?.last) || 0
}

const getNextInvoiceNumber = async (currentUser) => {
  const masterId = tenantMasterId(currentUser)
  const config = await InvoiceConfig.findOne({
    where: { parent_id: masterId },
  })
  const name =
    config?.name || (await UserModel.findByPk(masterId))?.name || 'INV'
  const prefix = name.slice(0, 3)

  const last = await lastInvoiceNumber(masterId, prefix)
  return `${prefix}-${last + 1}`
}

const assertInvoiceNumberAvailable = async (
  { masterId, invoiceNumber, excludeId },
  currentUser
) => {
  const where = { master_id: masterId, invoice_number: invoiceNumber }
  if (excludeId) {
    where.id = { [Op.ne]: excludeId }
  }
  const existing = await PurchaseModel.findOne({ where, attributes: ['id'] })
  if (existing) {
    throw new InvoiceNumberExistsError(
      invoiceNumber,
      await getNextInvoiceNumber(currentUser)
    )
  }
}

const invoiceService = {
  getNextInvoiceNumber,
  assertInvoiceNumberAvailable,
}

export default invoiceService
