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
      reference_transaction_id
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

    return transaction
  }

  if (reference_transaction_id) {
    throw new LedgerNonReversalReferenceMustBeNullError()
  }

  if (
    transaction_type_code === TRANSACTION_TYPE_CODES.CAPITAL_OUT ||
    transaction_type_code === TRANSACTION_TYPE_CODES.SETOFF
  ) {
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

    const setoffType = await InvestorTransactionTypeModel.findOne({
      where: { code: TRANSACTION_TYPE_CODES.SETOFF },
    })

    if (setoffType) {
      categoryTypeIds.push(setoffType.id)
    }

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
        WHEN ttc.code = :setoffCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :capitalInCode THEN it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :capitalOutCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :setoffCode THEN -it.amount
        ELSE 0
      END
    ), 0) AS balance
    FROM investor_transactions it
    JOIN investor_transaction_types ttc ON it.transaction_type_id = ttc.id
    LEFT JOIN investor_transactions ref ON it.reference_transaction_id = ref.id
    LEFT JOIN investor_transaction_types ref_ttc ON ref.transaction_type_id = ref_ttc.id
    WHERE it.investor_id = :investorId
      AND (ttc.category = :capitalCategory OR ttc.code = :setoffCode OR (ttc.code = :reversalCode AND ref_ttc.category = :capitalCategory))
    `,
    {
      replacements: {
        investorId,
        capitalInCode: TRANSACTION_TYPE_CODES.CAPITAL_IN,
        capitalOutCode: TRANSACTION_TYPE_CODES.CAPITAL_OUT,
        setoffCode: TRANSACTION_TYPE_CODES.SETOFF,
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
        WHEN ttc.code = :profitLossCode THEN -it.amount
        WHEN ttc.code = :setoffCode THEN it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :profitCreditCode THEN it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :profitWithdrawCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :profitLossCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :setoffCode THEN it.amount
        ELSE 0
      END
    ), 0) AS balance
    FROM investor_transactions it
    JOIN investor_transaction_types ttc ON it.transaction_type_id = ttc.id
    LEFT JOIN investor_transactions ref ON it.reference_transaction_id = ref.id
    LEFT JOIN investor_transaction_types ref_ttc ON ref.transaction_type_id = ref_ttc.id
    WHERE it.investor_id = :investorId
      AND (ttc.category = :profitCategory OR ttc.code = :setoffCode OR (ttc.code = :reversalCode AND (ref_ttc.category = :profitCategory OR ref_ttc.code = :setoffCode)))
    `,
    {
      replacements: {
        investorId,
        profitCreditCode: TRANSACTION_TYPE_CODES.PROFIT_CREDIT,
        profitWithdrawCode: TRANSACTION_TYPE_CODES.PROFIT_WITHDRAW,
        profitLossCode: TRANSACTION_TYPE_CODES.PROFIT_LOSS,
        setoffCode: TRANSACTION_TYPE_CODES.SETOFF,
        reversalCode: TRANSACTION_TYPE_CODES.REVERSAL,
        profitCategory: TRANSACTION_CATEGORIES.PROFIT,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  )

  return parseFloat(result[0]?.balance || 0)
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

  const masterId = currentUser.user_type === userRoles.staff.type
    ? currentUser.master_id
    : currentUser.id

  const result = await sequelize.query(
    `
    SELECT COALESCE(SUM(
      CASE
        WHEN ttc.code = :inCode THEN it.amount
        WHEN ttc.code = :outCode THEN -it.amount
        WHEN ttc.code = :profitLossCode THEN -it.amount
        WHEN ttc.code = :setoffCode AND :category = 'CAPITAL' THEN -it.amount
        WHEN ttc.code = :setoffCode AND :category = 'PROFIT' THEN it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :inCode THEN it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :outCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :profitLossCode THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :setoffCode AND :category = 'CAPITAL' THEN -it.amount
        WHEN ttc.code = :reversalCode AND ref_ttc.code = :setoffCode AND :category = 'PROFIT' THEN it.amount
        ELSE 0
      END
    ), 0) AS balance
    FROM investor_transactions it
    JOIN investor_transaction_types ttc ON it.transaction_type_id = ttc.id
    LEFT JOIN investor_transactions ref ON it.reference_transaction_id = ref.id
    LEFT JOIN investor_transaction_types ref_ttc ON ref.transaction_type_id = ref_ttc.id
    WHERE (ttc.category = :category OR ttc.code = :setoffCode OR (ttc.code = :reversalCode AND (ref_ttc.category = :category OR ref_ttc.code = :setoffCode)))
      AND (:investorId IS NULL OR it.investor_id = :investorId)
      AND it.master_id = :masterId
      AND (:startDate IS NULL OR it.transaction_date >= :startDate)
      AND (:endDate IS NULL OR it.transaction_date <= :endDate)
    `,
    {
      replacements: {
        inCode,
        outCode,
        profitLossCode: TRANSACTION_TYPE_CODES.PROFIT_LOSS,
        setoffCode: TRANSACTION_TYPE_CODES.SETOFF,
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
  getInvestorTransactionHistory,
  lookupInvestors,
  lookupTransactionTypes,
  getBalanceSummary,
}

export default LedgerService
