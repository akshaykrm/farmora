import { Op, literal } from 'sequelize'
import { sequelize } from '@utils/db'
import InvestorTransactionModel from '@models/investorTransaction'
import InvestorTransactionTypeModel from '@models/investorTransactionType'
import InvestorManagementModel from '@models/investorManagement'
import SeasonModel from '@models/season'
import userRoles from '@utils/user-roles'
import { TRANSACTION_TYPE_CODES, TRANSACTION_CATEGORIES } from './ledger.constants'
import {
  LedgerTransactionNotFoundError,
  LedgerCapitalExceedsBalanceError,
  LedgerProfitExceedsBalanceError,
  LedgerReversalRequiresReferenceError,
  LedgerReversalReferenceNotFoundError,
  LedgerNonReversalReferenceMustBeNullError,
} from './ledger.errors'

async function createInvestorTransaction(payload, currentUser) {
  const { investor_id, transaction_type_code, amount, transaction_date, season_id, reference_transaction_id, remarks } = payload

  const typeRecord = await InvestorTransactionTypeModel.findOne({
    where: { code: transaction_type_code },
  })

  if (transaction_type_code === TRANSACTION_TYPE_CODES.REVERSAL) {
    if (!reference_transaction_id) {
      throw new LedgerReversalRequiresReferenceError()
    }

    const referenceTx = await InvestorTransactionModel.findByPk(
      reference_transaction_id,
      {
        include: [
          { model: InvestorTransactionTypeModel, as: 'transaction_type' },
        ],
      }
    )
    if (!referenceTx) {
      throw new LedgerReversalReferenceNotFoundError(reference_transaction_id)
    }

    const reversalAmount = -Math.abs(amount)

    const transaction = await InvestorTransactionModel.create({
      investor_id,
      transaction_type_id: typeRecord.id,
      amount: reversalAmount,
      transaction_date,
      season_id,
      reference_transaction_id,
      remarks,
      master_id:
        currentUser.user_type === userRoles.staff.type
          ? currentUser.master_id
          : currentUser.id,
    })

    const refTypeCode = referenceTx.transaction_type?.code

    if (refTypeCode === TRANSACTION_TYPE_CODES.PROFIT_LOSS) {
      const capitalLossType = await InvestorTransactionTypeModel.findOne({
        where: { code: TRANSACTION_TYPE_CODES.CAPITAL_LOSS },
      })

      const linkedCapitalLosses = await InvestorTransactionModel.findAll({
        where: {
          reference_transaction_id: referenceTx.id,
          transaction_type_id: capitalLossType.id,
        },
      })

      for (const linkedTx of linkedCapitalLosses) {
        await InvestorTransactionModel.create({
          investor_id,
          transaction_type_id: typeRecord.id,
          amount: -Math.abs(parseFloat(linkedTx.amount) || 0),
          transaction_date,
          season_id,
          reference_transaction_id: linkedTx.id,
          remarks: 'Reversal - Loss exceeding profit (capital portion)',
          master_id:
            currentUser.user_type === userRoles.staff.type
              ? currentUser.master_id
              : currentUser.id,
        })
      }
    }

    if (
      refTypeCode === TRANSACTION_TYPE_CODES.CAPITAL_LOSS &&
      referenceTx.reference_transaction_id
    ) {
      const profitLossType = await InvestorTransactionTypeModel.findOne({
        where: { code: TRANSACTION_TYPE_CODES.PROFIT_LOSS },
      })

      const parentLoss = await InvestorTransactionModel.findOne({
        where: {
          id: referenceTx.reference_transaction_id,
          transaction_type_id: profitLossType.id,
        },
      })

      if (parentLoss) {
        await InvestorTransactionModel.create({
          investor_id,
          transaction_type_id: typeRecord.id,
          amount: -Math.abs(parseFloat(parentLoss.amount) || 0),
          transaction_date,
          season_id,
          reference_transaction_id: parentLoss.id,
          remarks: 'Reversal - Loss',
          master_id:
            currentUser.user_type === userRoles.staff.type
              ? currentUser.master_id
              : currentUser.id,
        })
      }
    }

    return transaction
  }

  if (reference_transaction_id) {
    throw new LedgerNonReversalReferenceMustBeNullError()
  }

  if (transaction_type_code === TRANSACTION_TYPE_CODES.CAPITAL_OUT) {
    const availableCapital = await getInvestorCapitalBalance(investor_id)
    if (availableCapital < amount) {
      throw new LedgerCapitalExceedsBalanceError()
    }
  }

  if (transaction_type_code === TRANSACTION_TYPE_CODES.PROFIT_WITHDRAW) {
    const availableProfit = await getInvestorProfitBalance(investor_id)
    if (availableProfit < amount) {
      throw new LedgerProfitExceedsBalanceError()
    }
  }

  if (transaction_type_code === TRANSACTION_TYPE_CODES.PROFIT_CREDIT) {
    const erosion = await getCapitalErosionBalance(investor_id)

    if (erosion > 0) {
      const restorationAmount = Math.min(amount, erosion)
      const remainingProfit = amount - restorationAmount

      if (restorationAmount > 0) {
        const capitalInType = await InvestorTransactionTypeModel.findOne({
          where: { code: TRANSACTION_TYPE_CODES.CAPITAL_IN },
        })

        const lossType = await InvestorTransactionTypeModel.findOne({
          where: { code: TRANSACTION_TYPE_CODES.PROFIT_LOSS },
        })

        const lossTxn = await InvestorTransactionModel.findOne({
          where: { investor_id, transaction_type_id: lossType.id },
          order: [['id', 'DESC']],
        })

        await InvestorTransactionModel.create({
          investor_id,
          transaction_type_id: capitalInType.id,
          amount: restorationAmount,
          transaction_date,
          season_id,
          reference_transaction_id: lossTxn ? lossTxn.id : null,
          remarks: 'Capital restoration from profit allocation',
          master_id:
            currentUser.user_type === userRoles.staff.type
              ? currentUser.master_id
              : currentUser.id,
        })
      }

      if (remainingProfit > 0) {
        await InvestorTransactionModel.create({
          investor_id,
          transaction_type_id: typeRecord.id,
          amount: remainingProfit,
          transaction_date,
          season_id,
          reference_transaction_id: null,
          remarks,
          master_id:
            currentUser.user_type === userRoles.staff.type
              ? currentUser.master_id
              : currentUser.id,
        })
      }

      return {
        capital_restored: restorationAmount,
        profit_credited: remainingProfit,
      }
    }
  }

  if (transaction_type_code === TRANSACTION_TYPE_CODES.PROFIT_LOSS) {
    const currentProfit = await getInvestorProfitBalance(investor_id)
    const profitCovered = Math.min(amount, Math.max(0, currentProfit))
    const capitalCovered = amount - profitCovered

    let lossTransaction = null

    if (profitCovered > 0) {
      lossTransaction = await InvestorTransactionModel.create({
        investor_id,
        transaction_type_id: typeRecord.id,
        amount: profitCovered,
        transaction_date,
        season_id,
        reference_transaction_id: null,
        remarks,
        master_id:
          currentUser.user_type === userRoles.staff.type
            ? currentUser.master_id
            : currentUser.id,
      })
    }

    if (capitalCovered > 0) {
      const capitalLossType = await InvestorTransactionTypeModel.findOne({
        where: { code: TRANSACTION_TYPE_CODES.CAPITAL_LOSS },
      })

      await InvestorTransactionModel.create({
        investor_id,
        transaction_type_id: capitalLossType.id,
        amount: capitalCovered,
        transaction_date,
        season_id,
        reference_transaction_id: lossTransaction ? lossTransaction.id : null,
        remarks: remarks || 'Loss exceeding profit — capital erosion',
        master_id:
          currentUser.user_type === userRoles.staff.type
            ? currentUser.master_id
            : currentUser.id,
      })
    }

    return lossTransaction || { message: 'Loss fully covered by capital erosion' }
  }

  const transaction = await InvestorTransactionModel.create({
    investor_id,
    transaction_type_id: typeRecord.id,
    amount,
    transaction_date,
    season_id,
    reference_transaction_id: null,
    remarks,
    master_id:
      currentUser.user_type === userRoles.staff.type
        ? currentUser.master_id
        : currentUser.id,
  })

  return transaction
}

async function getInvestorTransactionById(transactionId, currentUser) {
  const filter = { id: transactionId }

  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  } else if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  }

  const transaction = await InvestorTransactionModel.findOne({
    where: filter,
    include: [
      { model: InvestorManagementModel, as: 'investor', required: false },
      {
        model: InvestorTransactionTypeModel,
        as: 'transaction_type',
        required: false,
      },
      {
        model: InvestorTransactionModel,
        as: 'reference_transaction',
        required: false,
      },
      { model: SeasonModel, as: 'season', required: false },
    ],
  })

  if (!transaction) {
    throw new LedgerTransactionNotFoundError(transactionId)
  }

  return transaction
}

async function listInvestorTransactions(filter, currentUser) {
  const { page = 1, limit = 10, investor_id, transaction_type_id, category, start_date, end_date } = filter
  const offset = (page - 1) * limit
  const whereClause = {}

  if (investor_id) {
    whereClause.investor_id = investor_id
  }

  if (transaction_type_id) {
    whereClause.transaction_type_id = transaction_type_id
  }

  if (start_date || end_date) {
    whereClause.transaction_date = {}
    if (start_date) {
      whereClause.transaction_date[Op.gte] = start_date
    }
    if (end_date) {
      whereClause.transaction_date[Op.lte] = end_date
    }
  }

  if (currentUser.user_type === userRoles.manager.type) {
    whereClause.master_id = currentUser.id
  } else if (currentUser.user_type === userRoles.staff.type) {
    whereClause.master_id = currentUser.master_id
  }

  if (category) {
    const categoryTypeIds = (await InvestorTransactionTypeModel.findAll({
      where: { category },
      attributes: ['id'],
    })).map((t) => t.id)

    const reversalType = await InvestorTransactionTypeModel.findOne({
      where: { code: TRANSACTION_TYPE_CODES.REVERSAL },
    })

    if (categoryTypeIds.length > 0 && reversalType) {
      whereClause[Op.or] = [
        { transaction_type_id: { [Op.in]: categoryTypeIds } },
        {
          transaction_type_id: reversalType.id,
          reference_transaction_id: {
            [Op.ne]: null,
            [Op.in]: literal(
              `(SELECT id FROM investor_transactions WHERE transaction_type_id IN (${categoryTypeIds.join(',')}))`
            ),
          },
        },
      ]
    }
  }

  const { count, rows } = await InvestorTransactionModel.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['transaction_date', 'DESC'], ['id', 'DESC']],
    attributes: {
      include: [
        [
          literal(`EXISTS (
            SELECT 1 FROM investor_transactions it2
            WHERE it2.reference_transaction_id = investor_transactions.id
            AND it2.transaction_type_id = (
              SELECT id FROM investor_transaction_types WHERE code = 'REVERSAL'
            )
          )`),
          'has_reversal',
        ],
      ],
    },
    include: [
      { model: InvestorManagementModel, as: 'investor', required: false },
      { model: InvestorTransactionTypeModel, as: 'transaction_type', required: false },
      { model: SeasonModel, as: 'season', required: false },
    ],
  })

  return {
    page,
    limit,
    total: count,
    data: rows,
  }
}

async function getInvestorCapitalBalance(investorId) {
  const result = await sequelize.query(
    `
    SELECT COALESCE(SUM(
      CASE
        WHEN ttc.code = :capitalInCode THEN it.amount
        WHEN ttc.code = :capitalOutCode THEN -it.amount
        WHEN ttc.code = :capitalLossCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :capitalInCode THEN it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :capitalOutCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :capitalLossCode THEN -it.amount
        ELSE 0
      END
    ), 0) AS balance
    FROM investor_transactions it
    JOIN investor_transaction_types ttc ON it.transaction_type_id = ttc.id
    LEFT JOIN investor_transactions ref ON it.reference_transaction_id = ref.id
    LEFT JOIN investor_transaction_types ref_ttc ON ref.transaction_type_id = ref_ttc.id
    WHERE it.investor_id = :investorId
      AND (ttc.category = :capitalCategory OR (ttc.code = :reversalCode AND ref_ttc.category = :capitalCategory))
    `,
    {
      replacements: {
        investorId,
        capitalInCode: TRANSACTION_TYPE_CODES.CAPITAL_IN,
        capitalOutCode: TRANSACTION_TYPE_CODES.CAPITAL_OUT,
        capitalLossCode: TRANSACTION_TYPE_CODES.CAPITAL_LOSS,
        reversalCode: TRANSACTION_TYPE_CODES.REVERSAL,
        capitalCategory: TRANSACTION_CATEGORIES.CAPITAL,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  )

  return parseFloat(result[0]?.balance || 0)
}

async function getInvestorProfitBalance(investorId) {
  const result = await sequelize.query(
    `
    SELECT COALESCE(SUM(
      CASE
        WHEN ttc.code = :profitCreditCode THEN it.amount
        WHEN ttc.code = :profitWithdrawCode THEN -it.amount
        WHEN ttc.code = :lossCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :profitCreditCode THEN it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :profitWithdrawCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :lossCode THEN -it.amount
        ELSE 0
      END
    ), 0) AS balance
    FROM investor_transactions it
    JOIN investor_transaction_types ttc ON it.transaction_type_id = ttc.id
    LEFT JOIN investor_transactions ref ON it.reference_transaction_id = ref.id
    LEFT JOIN investor_transaction_types ref_ttc ON ref.transaction_type_id = ref_ttc.id
    WHERE it.investor_id = :investorId
      AND (ttc.category = :profitCategory OR (ttc.code = :reversalCode AND ref_ttc.category = :profitCategory))
    `,
    {
      replacements: {
        investorId,
        profitCreditCode: TRANSACTION_TYPE_CODES.PROFIT_CREDIT,
        profitWithdrawCode: TRANSACTION_TYPE_CODES.PROFIT_WITHDRAW,
        lossCode: TRANSACTION_TYPE_CODES.PROFIT_LOSS,
        reversalCode: TRANSACTION_TYPE_CODES.REVERSAL,
        profitCategory: TRANSACTION_CATEGORIES.PROFIT,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  )

  return parseFloat(result[0]?.balance || 0)
}

async function getCapitalErosionBalance(investorId) {
  const lossType = await InvestorTransactionTypeModel.findOne({
    where: { code: TRANSACTION_TYPE_CODES.PROFIT_LOSS },
  })

  if (!lossType) return 0

  const result = await sequelize.query(
    `
    SELECT COALESCE(SUM(
      CASE
        WHEN ttc.code = 'CAPITAL_LOSS' AND ref_ttc.code = 'PROFIT_LOSS' THEN it.amount
        WHEN ttc.code = 'CAPITAL_IN' AND ref_ttc.code = 'PROFIT_LOSS' THEN -it.amount
        ELSE 0
      END
    ), 0) AS net_erosion
    FROM investor_transactions it
    JOIN investor_transaction_types ttc ON it.transaction_type_id = ttc.id
    LEFT JOIN investor_transactions ref ON it.reference_transaction_id = ref.id
    LEFT JOIN investor_transaction_types ref_ttc ON ref.transaction_type_id = ref_ttc.id
    WHERE it.investor_id = :investorId
      AND (
        (ttc.code = 'CAPITAL_LOSS' AND ref_ttc.code = 'PROFIT_LOSS')
        OR (ttc.code = 'CAPITAL_IN' AND ref_ttc.code = 'PROFIT_LOSS')
      )
    `,
    {
      replacements: { investorId },
      type: sequelize.QueryTypes.SELECT,
    }
  )

  return parseFloat(result[0]?.net_erosion || 0)
}

async function getInvestorTransactionHistory(investorId, filter = {}) {
  const { start_date, end_date } = filter
  const whereClause = { investor_id: investorId }

  if (start_date || end_date) {
    whereClause.transaction_date = {}
    if (start_date) {
      whereClause.transaction_date[Op.gte] = start_date
    }
    if (end_date) {
      whereClause.transaction_date[Op.lte] = end_date
    }
  }

  const transactions = await InvestorTransactionModel.findAll({
    where: whereClause,
    order: [['transaction_date', 'ASC'], ['id', 'ASC']],
    include: [
      { model: InvestorTransactionTypeModel, as: 'transaction_type' },
    ],
  })

  return transactions
}

async function lookupInvestors(currentUser) {
  const filter = {}
  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const investors = await InvestorManagementModel.findAll({
    where: filter,
    attributes: ['id', 'investor_name'],
    limit: 50,
    order: [['investor_name', 'ASC']],
  })

  return investors.map((i) => ({ id: i.id, name: i.investor_name }))
}

async function lookupTransactionTypes() {
  const types = await InvestorTransactionTypeModel.findAll({
    attributes: ['id', 'code', 'name', 'category'],
    order: [['category', 'ASC'], ['code', 'ASC']],
  })

  return types
}

async function getBalanceSummary(filter, currentUser) {
  const { category, investor_id, start_date, end_date } = filter

  const inCode = category === TRANSACTION_CATEGORIES.CAPITAL
    ? TRANSACTION_TYPE_CODES.CAPITAL_IN
    : TRANSACTION_TYPE_CODES.PROFIT_CREDIT

  const outCode = category === TRANSACTION_CATEGORIES.CAPITAL
    ? TRANSACTION_TYPE_CODES.CAPITAL_OUT
    : TRANSACTION_TYPE_CODES.PROFIT_WITHDRAW

  const lossCode = category === TRANSACTION_CATEGORIES.CAPITAL
    ? TRANSACTION_TYPE_CODES.CAPITAL_LOSS
    : TRANSACTION_TYPE_CODES.PROFIT_LOSS

  const masterId = currentUser.user_type === userRoles.staff.type
    ? currentUser.master_id
    : currentUser.id

  const result = await sequelize.query(
    `
    SELECT COALESCE(SUM(
      CASE
        WHEN ttc.code = :inCode THEN it.amount
        WHEN ttc.code = :outCode THEN -it.amount
        WHEN ttc.code = :lossCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :inCode THEN it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :outCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :lossCode THEN -it.amount
        ELSE 0
      END
    ), 0) AS balance
    FROM investor_transactions it
    JOIN investor_transaction_types ttc ON it.transaction_type_id = ttc.id
    LEFT JOIN investor_transactions ref ON it.reference_transaction_id = ref.id
    LEFT JOIN investor_transaction_types ref_ttc ON ref.transaction_type_id = ref_ttc.id
    WHERE (ttc.category = :category OR (ttc.code = :reversalCode AND ref_ttc.category = :category))
      AND (:investorId IS NULL OR it.investor_id = :investorId)
      AND it.master_id = :masterId
      AND (:startDate IS NULL OR it.transaction_date >= :startDate)
      AND (:endDate IS NULL OR it.transaction_date <= :endDate)
    `,
    {
      replacements: {
        inCode,
        outCode,
        lossCode,
        reversalCode: TRANSACTION_TYPE_CODES.REVERSAL,
        category,
        investorId: investor_id || null,
        startDate: start_date || null,
        endDate: end_date || null,
        masterId,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  )

  return parseFloat(result[0]?.balance || 0)
}

const LedgerService = {
  createInvestorTransaction,
  getInvestorTransactionById,
  listInvestorTransactions,
  getInvestorCapitalBalance,
  getInvestorProfitBalance,
  getCapitalErosionBalance,
  getInvestorTransactionHistory,
  lookupInvestors,
  lookupTransactionTypes,
  getBalanceSummary,
}

export default LedgerService
