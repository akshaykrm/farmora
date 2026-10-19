import userService from '@services/user.service'
import packageService from '@services/package.service'
import referralService from '../../referrals/referral.service.js'
import userRoles from '@utils/user-roles'
import { getEffectivePackagePrice } from '@utils/package-price'
import { compactMeta } from '@utils/export/report'
import { capitalize, statusLabel, sumOf, toPlain } from './helpers.js'

const bonusLabel = (type, value) => {
  if (type === 'fixed') return `Rs. ${value ?? 0}`
  if (type === 'percentage') return `${value ?? 0}%`
  return 'None'
}

const LEDGER_TYPE_LABELS = {
  initial_bonus: 'Initial Subscription',
  renewal_bonus: 'Renewal',
  manual_link_bonus: 'Manual Link',
  payment: 'Payment',
}

const subscribers = async (filter, currentUser) => {
  const { data } = await userService.getAll(
    { ...filter, user_type: userRoles.manager.type },
    currentUser
  )

  const rows = data.map((subscriber) => {
    const sub =
      subscriber.current_subscription || subscriber.subscriptions?.[0] || null
    return {
      name: subscriber.name,
      username: subscriber.username,
      email: subscriber.email,
      phone: subscriber.phone,
      package: sub?.package?.name,
      valid_from: sub?.valid_from,
      valid_to: sub?.valid_to,
      status: subscriber.status === 1 ? 'Active' : 'Disabled',
    }
  })

  return {
    title: 'Subscribers',
    filename: 'subscribers',
    meta: compactMeta([
      { label: 'Name', value: filter.name },
      { label: 'Status', value: statusLabel(filter.status) },
    ]),
    sections: [
      {
        title: 'Subscribers',
        columns: [
          { key: 'name', header: 'Name', width: 1.5 },
          { key: 'username', header: 'Username', width: 1.2 },
          { key: 'email', header: 'Email', width: 1.8 },
          { key: 'phone', header: 'Phone' },
          { key: 'package', header: 'Current Package', width: 1.2 },
          { key: 'valid_from', header: 'Valid From', type: 'date' },
          { key: 'valid_to', header: 'Valid To', type: 'date' },
          { key: 'status', header: 'Status', width: 0.8 },
        ],
        rows,
      },
    ],
    summary: [{ label: 'Records', value: rows.length, type: 'number' }],
  }
}

const packages = async (filter) => {
  const { data } = await packageService.getAll(filter)

  const rows = data.map((record) => {
    const pkg = toPlain(record)
    return {
      name: pkg.name,
      actual_price: pkg.actual_price,
      discount_price: pkg.discount_price,
      price: getEffectivePackagePrice(pkg),
      duration: pkg.duration,
      role: pkg.role?.name,
      referral_bonus: bonusLabel(
        pkg.referral_bonus_type,
        pkg.referral_bonus_value
      ),
      status: capitalize(pkg.status),
    }
  })

  return {
    title: 'Packages',
    filename: 'packages',
    meta: compactMeta([
      { label: 'Name', value: filter.name },
      { label: 'Status', value: capitalize(filter.status) },
    ]),
    sections: [
      {
        title: 'Packages',
        columns: [
          { key: 'name', header: 'Name', width: 1.5 },
          { key: 'actual_price', header: 'Actual Price', type: 'currency' },
          { key: 'discount_price', header: 'Discount', type: 'currency' },
          { key: 'price', header: 'Price', type: 'currency' },
          { key: 'duration', header: 'Duration (months)', type: 'number' },
          { key: 'role', header: 'System Role' },
          { key: 'referral_bonus', header: 'Referral Bonus' },
          { key: 'status', header: 'Status', width: 0.8 },
        ],
        rows,
      },
    ],
    summary: [{ label: 'Records', value: rows.length, type: 'number' }],
  }
}

const referrals = async (filter, currentUser) => {
  const { data } = await referralService.getAll(
    { ...filter, page: 1, limit: null },
    currentUser
  )

  const rows = data.map((partner) => ({
    name: partner.name,
    code: partner.code,
    phone: partner.phone,
    email: partner.email,
    bonus: bonusLabel(
      partner.referral_bonus_type,
      partner.referral_bonus_value
    ),
    companies: partner.companies_count,
    earned: partner.total_earned,
    paid: partner.total_paid,
    balance: partner.balance,
    status: capitalize(partner.status),
  }))

  return {
    title: 'Referral Partners',
    filename: 'referral-partners',
    meta: compactMeta([
      { label: 'Name', value: filter.name },
      { label: 'Status', value: capitalize(filter.status) },
    ]),
    sections: [
      {
        title: 'Referral Partners',
        columns: [
          { key: 'name', header: 'Name', width: 1.5 },
          { key: 'code', header: 'Code' },
          { key: 'phone', header: 'Phone' },
          { key: 'email', header: 'Email', width: 1.6 },
          { key: 'bonus', header: 'Bonus', width: 0.8 },
          { key: 'companies', header: 'Companies', type: 'number', width: 0.8 },
          { key: 'earned', header: 'Earned', type: 'currency' },
          { key: 'paid', header: 'Paid', type: 'currency' },
          { key: 'balance', header: 'Balance', type: 'currency' },
          { key: 'status', header: 'Status', width: 0.8 },
        ],
        rows,
      },
    ],
    summary: [
      { label: 'Records', value: rows.length, type: 'number' },
      { label: 'Total Earned', value: sumOf(rows, 'earned'), type: 'currency' },
      { label: 'Total Paid', value: sumOf(rows, 'paid'), type: 'currency' },
      {
        label: 'Total Balance',
        value: sumOf(rows, 'balance'),
        type: 'currency',
      },
    ],
  }
}

const referralLedger = async (partnerId, currentUser) => {
  const partner = await referralService.getById(partnerId, currentUser)

  const companies = partner.companies.map((company) => ({
    name: company.name,
    username: company.username,
    package: company.current_package?.name,
    valid_to: company.valid_to,
  }))

  const ledger = partner.ledger.map((record) => {
    const txn = toPlain(record)
    return {
      company: txn.company?.name,
      package: txn.package_name,
      type: LEDGER_TYPE_LABELS[txn.type] || txn.type,
      amount: txn.amount,
      remarks: txn.remarks,
      date: txn.created_at || txn.createdAt,
    }
  })

  return {
    title: `Referral Ledger - ${partner.name}`,
    filename: 'referral-ledger',
    meta: compactMeta([
      { label: 'Partner', value: partner.name },
      { label: 'Code', value: partner.code },
      {
        label: 'Bonus',
        value: bonusLabel(
          partner.referral_bonus_type,
          partner.referral_bonus_value
        ),
      },
    ]),
    sections: [
      {
        title: 'Referred Companies',
        columns: [
          { key: 'name', header: 'Company', width: 1.5 },
          { key: 'username', header: 'Username', width: 1.2 },
          { key: 'package', header: 'Package' },
          { key: 'valid_to', header: 'Valid To', type: 'date' },
        ],
        rows: companies,
      },
      {
        title: 'Bonus History',
        columns: [
          { key: 'company', header: 'Company', width: 1.4 },
          { key: 'package', header: 'Package' },
          { key: 'type', header: 'Transaction' },
          { key: 'amount', header: 'Amount', type: 'currency' },
          { key: 'remarks', header: 'Remarks', width: 1.8 },
          { key: 'date', header: 'Date', type: 'date' },
        ],
        rows: ledger,
      },
    ],
    summary: [
      { label: 'Companies', value: partner.companies_count, type: 'number' },
      { label: 'Total Earned', value: partner.total_earned, type: 'currency' },
      { label: 'Total Paid', value: partner.total_paid, type: 'currency' },
      { label: 'Balance', value: partner.balance, type: 'currency' },
    ],
  }
}

const platformExportService = {
  subscribers,
  packages,
  referrals,
  referralLedger,
}

export default platformExportService
