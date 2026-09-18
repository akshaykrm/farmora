import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

export const REFERRAL_LEDGER_TYPES = {
  initial_bonus: 'initial_bonus',
  renewal_bonus: 'renewal_bonus',
  manual_link_bonus: 'manual_link_bonus',
  payment: 'payment',
}

export const REFERRAL_BONUS_TYPES = [
  REFERRAL_LEDGER_TYPES.initial_bonus,
  REFERRAL_LEDGER_TYPES.renewal_bonus,
  REFERRAL_LEDGER_TYPES.manual_link_bonus,
]

const ReferralLedgerTransactionModel = sequelize.define(
  'referral_ledger_transactions',
  {
    referral_partner_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'referral_partner_id',
    },
    type: {
      type: Sequelize.ENUM(
        'initial_bonus',
        'renewal_bonus',
        'manual_link_bonus',
        'payment'
      ),
      allowNull: false,
    },
    amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    company_user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'company_user_id',
    },
    subscription_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'subscription_id',
    },
    package_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'package_id',
    },
    package_name: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'package_name',
    },
    package_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      field: 'package_price',
    },
    bonus_type: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'bonus_type',
    },
    bonus_value: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      field: 'bonus_value',
    },
    bonus_amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
      field: 'bonus_amount',
    },
    remarks: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    created_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'created_by',
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default ReferralLedgerTransactionModel
