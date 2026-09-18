import permissionService from '@services/permission.service'
import asyncHandler from '@utils/async-handler'

const getAllPermissions = async (req, res) => {
  const permissions = await permissionService.getAllPermissions(req.user)
  res.success(permissions, { message: 'permissions list' })
}

const permissionController = {
  getAllPermissions: asyncHandler(getAllPermissions),
}

export default permissionController
