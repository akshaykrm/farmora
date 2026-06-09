import UserModel from './user.js'
import FarmModel from './farm.js'
import PurchaseModel from './purchase.js'
import ItemModel from './items.model.js'
import PurchaseBatchAssignmentModel from './purchasebatchassignment.js'
import PurchaseReturnModel from './purchase-return.js'
import PackageModel from './package.js'
import PermissionModel from './permission.js'
import RoleModel from './role.js'
import RolePermissionModel from './rolepermission.js'
import SeasonModel from './season.js'
import SubscriptionModel from './subscription.js'
import BatchModel from './batch.js'
import UserRoleAssignment from './userroleassignment.js'
import VendorModel from './vendor.js'
import IntegrationBookModel from './integationbook.js'
import WorkingCostModel from './workingcost.js'
import SalesModel from './sales.js'
import GeneralExpenseModel from './generalexpense.js'
import ExpenseSalesModel from './expensesales.js'
import PurchaseBookModel from './purchasebook.js'
import InvestorManagementModel from './investorManagement.js'
import InvestorTransactionTypeModel from './investorTransactionType.js'
import InvestorTransactionModel from './investorTransaction.js'

UserModel.hasMany(SubscriptionModel, {
  foreignKey: 'user_id',
  as: 'subscriptions',
})

UserModel.belongsTo(UserModel, {
  foreignKey: 'parent_id',
  as: 'parent',
  targetKey: 'id',
})

BatchModel.belongsTo(UserModel, {
  foreignKey: 'master_id',
  as: 'master',
  targetKey: 'id',
})

BatchModel.belongsTo(FarmModel, {
  foreignKey: 'farm_id',
  as: 'farm',
  targetKey: 'id',
})

BatchModel.belongsTo(SeasonModel, {
  foreignKey: 'season_id',
  as: 'season',
  targetKey: 'id',
})

IntegrationBookModel.belongsTo(FarmModel, {
  foreignKey: 'farm_id',
  as: 'farm',
  targetKey: 'id',
})

IntegrationBookModel.belongsTo(UserModel, {
  foreignKey: 'master_id',
  as: 'master',
  targetKey: 'id',
})

WorkingCostModel.belongsTo(SeasonModel, {
  foreignKey: 'season_id',
  as: 'season',
  targetKey: 'id',
})

WorkingCostModel.belongsTo(UserModel, {
  foreignKey: 'master_id',
  as: 'master',
  targetKey: 'id',
})

GeneralExpenseModel.belongsTo(SeasonModel, {
  foreignKey: 'season_id',
  as: 'season',
  targetKey: 'id',
})

GeneralExpenseModel.belongsTo(UserModel, {
  foreignKey: 'master_id',
  as: 'master',
  targetKey: 'id',
})

ExpenseSalesModel.belongsTo(SeasonModel, {
  foreignKey: 'season_id',
  as: 'season',
  targetKey: 'id',
})

ExpenseSalesModel.belongsTo(UserModel, {
  foreignKey: 'master_id',
  as: 'master',
  targetKey: 'id',
})

SubscriptionModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  as: 'user',
})

SubscriptionModel.belongsTo(PackageModel, {
  foreignKey: 'package_id',
  as: 'package',
})

UserModel.hasMany(UserRoleAssignment, {
  foreignKey: 'user_id',
  as: 'role_assignments',
})

RoleModel.belongsTo(UserModel, { foreignKey: 'manager_id', as: 'manager' })

UserRoleAssignment.belongsTo(UserModel, {
  foreignKey: 'user_id',
  as: 'user',
})

PurchaseModel.belongsTo(ItemModel, {
  foreignKey: 'category_id',
  as: 'category',
  targetKey: 'id',
})

PurchaseModel.belongsTo(VendorModel, {
  foreignKey: 'vendor_id',
  as: 'vendor',
  targetKey: 'id',
})

PurchaseModel.belongsTo(FarmModel, {
  foreignKey: 'farm_id',
  as: 'farm',
  targetKey: 'id',
})

PurchaseModel.belongsTo(SeasonModel, {
  foreignKey: 'season_id',
  as: 'season',
  targetKey: 'id',
})

PurchaseModel.belongsTo(BatchModel, {
  foreignKey: 'batch_id',
  as: 'batch',
  targetKey: 'id',
})

PurchaseModel.hasMany(PurchaseBatchAssignmentModel, {
  foreignKey: 'purchase_id',
  as: 'assignments',
})

PurchaseReturnModel.belongsTo(ItemModel, {
  foreignKey: 'item_category_id',
  as: 'category',
  targetKey: 'id',
})

PurchaseReturnModel.belongsTo(VendorModel, {
  foreignKey: 'to_vendor',
  as: 'vendor',
  targetKey: 'id',
})

ItemModel.belongsTo(VendorModel, {
  foreignKey: 'vendor_id',
  as: 'vendor',
  targetKey: 'id',
})

PurchaseReturnModel.belongsTo(BatchModel, {
  foreignKey: 'from_batch',
  as: 'batch',
  targetKey: 'id',
})

PurchaseReturnModel.belongsTo(BatchModel, {
  foreignKey: 'from_batch',
  as: 'from_batch_data',
  targetKey: 'id',
})

PurchaseReturnModel.belongsTo(BatchModel, {
  foreignKey: 'to_batch',
  as: 'to_batch_data',
  targetKey: 'id',
})

PurchaseReturnModel.belongsTo(VendorModel, {
  foreignKey: 'to_vendor',
  as: 'to_vendor_data',
  targetKey: 'id',
})

PurchaseReturnModel.belongsTo(UserModel, {
  foreignKey: 'master_id',
  as: 'master',
  targetKey: 'id',
})

PurchaseBookModel.belongsTo(VendorModel, {
  foreignKey: 'vendor_id',
  as: 'vendor',
  targetKey: 'id',
})

RolePermissionModel.belongsTo(RoleModel, { foreignKey: 'role_id', as: 'role' })
RolePermissionModel.belongsTo(PermissionModel, {
  foreignKey: 'permission_id',
  as: 'permission',
})

RoleModel.hasMany(RolePermissionModel, {
  foreignKey: 'role_id',
  as: 'role_permissions',
})

UserRoleAssignment.belongsTo(RoleModel, { foreignKey: 'role_id', as: 'role' })

RoleModel.hasMany(UserRoleAssignment, {
  foreignKey: 'role_id',
  as: 'assigned_users',
})

SalesModel.belongsTo(SeasonModel, {
  foreignKey: 'season_id',
  as: 'season',
  targetKey: 'id',
})

SalesModel.belongsTo(BatchModel, {
  foreignKey: 'batch_id',
  as: 'batch',
  targetKey: 'id',
})

SalesModel.belongsTo(VendorModel, {
  foreignKey: 'buyer_id',
  as: 'buyer',
  targetKey: 'id',
})

SalesModel.belongsTo(UserModel, {
  foreignKey: 'master_id',
  as: 'master',
  targetKey: 'id',
})

InvestorTransactionModel.belongsTo(InvestorManagementModel, {
  foreignKey: 'investor_id',
  as: 'investor',
  targetKey: 'id',
})

InvestorTransactionModel.belongsTo(InvestorTransactionTypeModel, {
  foreignKey: 'transaction_type_id',
  as: 'transaction_type',
  targetKey: 'id',
})

InvestorTransactionModel.belongsTo(InvestorTransactionModel, {
  foreignKey: 'reference_transaction_id',
  as: 'reference_transaction',
  targetKey: 'id',
})

InvestorManagementModel.hasMany(InvestorTransactionModel, {
  foreignKey: 'investor_id',
  as: 'transactions',
})

export {
  UserModel,
  FarmModel,
  PurchaseModel,
  ItemModel,
  PurchaseBatchAssignmentModel,
  PurchaseReturnModel,
  PackageModel,
  PermissionModel,
  RoleModel,
  RolePermissionModel,
  SeasonModel,
  SubscriptionModel,
  BatchModel,
  UserRoleAssignment,
  VendorModel,
  WorkingCostModel,
  SalesModel,
  GeneralExpenseModel,
  ExpenseSalesModel,
  InvestorManagementModel,
  InvestorTransactionTypeModel,
  InvestorTransactionModel,
}
