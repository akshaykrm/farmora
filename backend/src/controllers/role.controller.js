import roleService from '@services/role.service'
import asyncHandler from '@utils/async-handler'
import userRoles from '@utils/user-roles'

const createRole = async (req, res) => {
  const { name, description, permission_ids, kind, manager_id } = req.body

  const payload = {
    name,
    description,
    permission_ids,
    kind,
    manager_id,
  }
  const newRole = await roleService.createRoleService(payload, req.user)
  res.success(newRole, { message: 'Role created', statusCode: 201 })
}

const getAllRoles = async (req, res) => {
  const { name, page, limit, manager_id, kind } = req.query
  const filter = {
    page: page ? parseInt(req.query.page) : 1,
    limit: limit ? parseInt(req.query.limit) : 10,
  }
  if (name) {
    filter.name = name
  }

  if (manager_id) {
    filter.manager_id = manager_id
  }

  if (kind) {
    filter.kind = kind
  }

  if (req.user.user_type === userRoles.manager.type) {
    filter.manager_id = req.user.id
  }

  const roleRecords = await roleService.getAllRolesService(filter, req.user)
  res.success(roleRecords, { message: 'Roles fetched successfully' })
}

const getRoleById = async (req, res) => {
  const { role_id } = req.params
  const roleRecord = await roleService.getRoleByIdService(role_id, req.user)
  res.success(roleRecord, { message: 'Role record' })
}

const updateRoleById = async (req, res) => {
  const { role_id } = req.params
  await roleService.updateRoleByIdService(role_id, req.body, req.user)
  res.success(null, { message: 'Role updated' })
}

const deleteRoleById = async (req, res) => {
  const { role_id } = req.params
  await roleService.deleteRoleByIdService(role_id, req.user)
  res.success(null, { message: 'Role deleted' })
}

const roleController = {
  createRole: asyncHandler(createRole),
  getAllRoles: asyncHandler(getAllRoles),
  getRoleById: asyncHandler(getRoleById),
  updateRoleById: asyncHandler(updateRoleById),
  deleteRoleById: asyncHandler(deleteRoleById),
}

export default roleController
