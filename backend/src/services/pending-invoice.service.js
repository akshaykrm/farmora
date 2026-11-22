import PurchaseModel from '@models/purchase'
import SalesModel from '@models/sales'
import BatchModel from '@models/batch'
import SeasonModel from '@models/season'
import VendorModel from '@models/vendor'
import { Op } from 'sequelize'
import { applyTenantMasterId } from '@utils/tenant-scope'
import { IncompleteInvoicesError } from '@errors/invoice.errors'

const PREVIEW_LIMIT = 50

/**
 * Lists purchases and sales flagged as incomplete (not finalized).
 * Optionally scoped to a batch or a season. Closed batches are excluded
 * unless a batch/season is explicitly requested.
 */
const getPending = async (
  scope,
  currentUser,
  { limit = PREVIEW_LIMIT } = {}
) => {
  const where = { is_incomplete: true }
  if (scope.batch_id) where.batch_id = scope.batch_id
  if (scope.season_id) where.season_id = scope.season_id
  applyTenantMasterId(where, currentUser)

  const batchInclude = {
    model: BatchModel,
    as: 'batch',
    attributes: ['id', 'name', 'closed_on'],
    required: true,
  }
  if (!scope.batch_id && !scope.season_id) {
    batchInclude.where = { closed_on: { [Op.is]: null } }
  }

  const [purchases, sales] = await Promise.all([
    PurchaseModel.findAndCountAll({
      where,
      limit,
      order: [['invoice_date', 'DESC']],
      attributes: [
        'id',
        'invoice_number',
        'invoice_date',
        'net_amount',
        'payment_type',
      ],
      include: [
        batchInclude,
        {
          model: SeasonModel,
          as: 'season',
          attributes: ['id', 'name'],
          required: false,
        },
        {
          model: VendorModel,
          as: 'vendor',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
    }),
    SalesModel.findAndCountAll({
      where,
      limit,
      order: [['date', 'DESC']],
      attributes: ['id', 'date', 'amount', 'payment_type'],
      include: [
        batchInclude,
        {
          model: SeasonModel,
          as: 'season',
          attributes: ['id', 'name'],
          required: false,
        },
        {
          model: VendorModel,
          as: 'buyer',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
    }),
  ])

  const items = [
    ...purchases.rows.map((p) => ({
      type: 'purchase',
      id: p.id,
      reference: p.invoice_number,
      date: p.invoice_date,
      amount: p.net_amount,
      party: p.vendor?.name || '-',
      batch_id: p.batch?.id ?? null,
      batch: p.batch?.name || '-',
      season: p.season?.name || '-',
    })),
    ...sales.rows.map((s) => ({
      type: 'sale',
      id: s.id,
      reference: `Sale #${s.id}`,
      date: s.date,
      amount: s.amount,
      party: s.buyer?.name || '-',
      batch_id: s.batch?.id ?? null,
      batch: s.batch?.name || '-',
      season: s.season?.name || '-',
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  return {
    total: purchases.count + sales.count,
    purchases: purchases.count,
    sales: sales.count,
    items: items.slice(0, limit),
  }
}

const assertNoneForClose = async (scopeName, scope, currentUser) => {
  const summary = await getPending(scope, currentUser)
  if (summary.total > 0) {
    throw new IncompleteInvoicesError(scopeName, summary)
  }
}

const pendingInvoiceService = { getPending, assertNoneForClose }

export default pendingInvoiceService
