import ReferralLedgerTransactionModel, {
  REFERRAL_BONUS_TYPES,
  REFERRAL_LEDGER_TYPES,
} from '@models/referralledgertransaction'
import ReferralPartnerModel from '@models/referralpartner'
import logger from '@utils/logger'
import { getEffectivePackagePrice } from '@utils/package-price'
import { UniqueConstraintError } from 'sequelize'

export const computeBonus = (packageRecord, partnerRecord = null) => {
  const source =
    partnerRecord?.referral_bonus_type &&
    partnerRecord.referral_bonus_type !== 'none'
      ? partnerRecord
      : packageRecord
  const sourceName = source === partnerRecord ? 'partner' : 'package'
  const bonusType = source.referral_bonus_type || 'none'
  const bonusValue = Number(source.referral_bonus_value || 0)
  const packagePrice = getEffectivePackagePrice(packageRecord)

  if (bonusType === 'none' || bonusValue <= 0) {
    return {
      bonusType,
      bonusValue,
      bonusAmount: 0,
      packagePrice,
      source: sourceName,
    }
  }

  if (bonusType === 'fixed') {
    return {
      bonusType,
      bonusValue,
      bonusAmount: Number(bonusValue.toFixed(2)),
      packagePrice,
      source: sourceName,
    }
  }

  if (bonusType === 'percentage') {
    return {
      bonusType,
      bonusValue,
      bonusAmount: Number(((packagePrice * bonusValue) / 100).toFixed(2)),
      packagePrice,
      source: sourceName,
    }
  }

  return {
    bonusType: 'none',
    bonusValue: 0,
    bonusAmount: 0,
    packagePrice,
    source: sourceName,
  }
}

const creditForSubscription = async ({
  partnerId,
  companyUserId,
  subscription,
  packageRecord,
  type,
  createdBy = null,
  remarks = null,
  partnerRecord = null,
  transaction = null,
}) => {
  if (!partnerId || !subscription?.id || !packageRecord) {
    return null
  }

  if (!REFERRAL_BONUS_TYPES.includes(type)) {
    throw new Error(`invalid referral bonus type: ${type}`)
  }

  const partner =
    partnerRecord ||
    (await ReferralPartnerModel.findByPk(partnerId, { transaction }))

  const { bonusType, bonusValue, bonusAmount, packagePrice } = computeBonus(
    packageRecord,
    partner
  )

  if (bonusAmount <= 0) {
    logger.debug(
      { partnerId, subscription_id: subscription.id, type },
      'Skipping referral bonus (zero amount)'
    )
    return null
  }

  try {
    const txn = await ReferralLedgerTransactionModel.create(
      {
        referral_partner_id: partnerId,
        type,
        amount: bonusAmount,
        company_user_id: companyUserId,
        subscription_id: subscription.id,
        package_id: packageRecord.id,
        package_name: packageRecord.name,
        package_price: packagePrice,
        bonus_type: bonusType,
        bonus_value: bonusValue,
        bonus_amount: bonusAmount,
        remarks,
        created_by: createdBy,
      },
      { transaction }
    )
    logger.info(
      {
        partner_id: partnerId,
        subscription_id: subscription.id,
        type,
        amount: bonusAmount,
      },
      'Referral bonus credited'
    )
    return txn
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      logger.debug(
        { partnerId, subscription_id: subscription.id, type },
        'Referral bonus already credited'
      )
      return null
    }
    throw error
  }
}

const findActivePartnerByCode = async (code) => {
  if (!code || typeof code !== 'string') return null
  const normalized = code.trim().toUpperCase()
  if (!normalized) return null

  return ReferralPartnerModel.findOne({
    where: {
      code: normalized,
      status: 'active',
    },
  })
}

const referralBonusService = {
  computeBonus,
  creditForSubscription,
  findActivePartnerByCode,
  TYPES: REFERRAL_LEDGER_TYPES,
}

export default referralBonusService
