import PermissionModel from '@models/permission'
import logger from '@utils/logger'

const getAllPermissionRoles = async () => {
  try {
    const permissionRecords = await PermissionModel.findAll({})
    return permissionRecords
  } catch (error) {
    logger.error({ err: error }, 'Error fetching permission roles')
    throw error
  }
}

const permissionRoleService = {
  getAllPermissionRoles,
}

export default permissionRoleService
