import Joi from 'joi'
import { TRANSACTION_TYPE_CODES } from './ledger.constants'

export const createInvestorTransactionSchema = Joi.object({
  investor_id: Joi.number().integer().required().messages({
    'any.required': 'Investor is required',
    'number.base': 'Investor must be a valid ID',
  }),
  transaction_type_code: Joi.string()
    .valid(...Object.values(TRANSACTION_TYPE_CODES))
    .required()
    .messages({
      'any.required': 'Transaction type is required',
      'any.only': 'Invalid transaction type',
    }),
  amount: Joi.number().positive().required().messages({
    'any.required': 'Amount is required',
    'number.positive': 'Amount must be a positive number',
    'number.base': 'Amount must be a number',
  }),
  transaction_date: Joi.date().iso().required().messages({
    'any.required': 'Transaction date is required',
    'date.format': 'Transaction date must be a valid ISO date',
  }),
  reference_transaction_id: Joi.number().integer().allow(null).default(null),
  remarks: Joi.string().allow(null, '').max(500).default(null),
})

export const listInvestorTransactionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  investor_id: Joi.number().integer().allow(null, ''),
  transaction_type_id: Joi.number().integer().allow(null, ''),
  category: Joi.string().valid('CAPITAL', 'PROFIT').allow(null, ''),
  start_date: Joi.date().iso().allow(null, ''),
  end_date: Joi.date().iso().allow(null, ''),
})
