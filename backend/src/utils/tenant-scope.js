import userRoles from '@utils/user-roles'
import { getMasterId } from '@services/permission.service'

export const applyTenantMasterId = (filter, currentUser) => {
  if (
    currentUser?.user_type === userRoles.manager.type ||
    currentUser?.user_type === userRoles.staff.type
  ) {
    filter.master_id = getMasterId(currentUser)
  }
  return filter
}

export const tenantMasterId = (currentUser) => getMasterId(currentUser)
