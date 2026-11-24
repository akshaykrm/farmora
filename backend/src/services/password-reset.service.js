import { createHash, randomBytes } from 'node:crypto'
import bcryptjs from 'bcryptjs'
import { Op } from 'sequelize'
import { sequelize } from '@utils/db'
import UserModel from '@models/user'
import PasswordResetToken from '@models/passwordresettoken'
import logger from '@utils/logger'
import { getMailConfig, sendMail } from '@services/mail.service'

export const RESET_TOKEN_TTL_MINUTES = 30
const WINDOW_MS = 15 * 60 * 1000
const MAX_PER_USER = 3
const MAX_PER_IP = 10

export const GENERIC_RESET_MESSAGE =
  "If an account matches, we've sent a password reset link to its email address."

// Per-IP limit is in memory (resets on restart, per process). Per-user limit
// is counted from password_reset_tokens, so it survives restarts.
const ipHits = new Map()

const hitIpLimit = (ip) => {
  if (!ip) return false
  const now = Date.now()
  const recent = (ipHits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  ipHits.set(ip, recent)
  if (ipHits.size > 10000) {
    for (const [key, hits] of ipHits) {
      if (!hits.some((t) => now - t < WINDOW_MS)) ipHits.delete(key)
    }
  }
  return recent.length > MAX_PER_IP
}

export const resetRateLimitForTests = () => ipHits.clear()

const hashToken = (token) => createHash('sha256').update(token).digest('hex')

const tooManyRequests = () => {
  const error = new Error(
    'Too many password reset requests. Please try again in 15 minutes.'
  )
  error.statusCode = 429
  error.code = 'TOO_MANY_RESET_REQUESTS'
  return error
}

const invalidLink = () => {
  const error = new Error('Reset link is invalid or expired.')
  error.statusCode = 400
  error.code = 'INVALID_RESET_TOKEN'
  error.name = 'ValidationError'
  return error
}

const findUsers = async (identifier) => {
  const value = identifier.trim()
  if (!value) return []
  if (value.includes('@')) {
    return UserModel.findAll({
      where: sequelize.where(
        sequelize.fn('lower', sequelize.col('email')),
        value.toLowerCase()
      ),
      limit: 5,
    })
  }
  const user = await UserModel.findOne({ where: { username: value } })
  return user ? [user] : []
}

const shouldLogLinks = () =>
  process.env.LOG_PASSWORD_RESET_LINKS === 'true' &&
  process.env.NODE_ENV !== 'production'

const issueFor = async (user, ip, config) => {
  if (Number(user.status) !== 1 || !user.email) return

  const since = new Date(Date.now() - WINDOW_MS)
  const recent = await PasswordResetToken.count({
    where: { user_id: user.id, created_at: { [Op.gte]: since } },
  })
  if (recent >= MAX_PER_USER) {
    logger.warn({ user_id: user.id }, 'Password reset rate limit reached')
    return
  }

  const token = randomBytes(32).toString('hex')
  const now = new Date()
  await PasswordResetToken.update(
    { used_at: now },
    { where: { user_id: user.id, used_at: null } }
  )
  await PasswordResetToken.create({
    user_id: user.id,
    token_hash: hashToken(token),
    expires_at: new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
    request_ip: ip ? String(ip).slice(0, 64) : null,
  })

  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`
  if (shouldLogLinks()) {
    logger.warn({ user_id: user.id, resetUrl }, 'Password reset link (dev)')
  }
  if (config.source === 'none') return

  const result = await sendMail(
    user.email,
    'Reset your Farmora password',
    'password-reset',
    {
      name: user.name || user.username,
      username: user.username,
      resetUrl,
      expiresMinutes: RESET_TOKEN_TTL_MINUTES,
    }
  )
  if (!result.success) {
    logger.error({ user_id: user.id }, 'Password reset email failed to send')
  }
}

const requestReset = async (identifier, ip) => {
  if (hitIpLimit(ip)) throw tooManyRequests()

  const users = await findUsers(identifier)
  if (!users.length) return

  const config = await getMailConfig()
  if (!config.frontendUrl) {
    logger.error(
      'Password reset skipped: set the app URL in Settings > Email (or FRONTEND_URL)'
    )
    return
  }
  if (config.source === 'none' && !shouldLogLinks()) {
    logger.error('Password reset skipped: email is not configured')
    return
  }

  for (const user of users) {
    await issueFor(user, ip, config)
  }
}

const confirmReset = async (token, newPassword) => {
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) throw invalidLink()
  const tokenHash = hashToken(token.toLowerCase())

  await sequelize.transaction(async (transaction) => {
    const record = await PasswordResetToken.findOne({
      where: {
        token_hash: tokenHash,
        used_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!record) throw invalidLink()

    const user = await UserModel.findByPk(record.user_id, { transaction })
    if (!user || Number(user.status) !== 1) throw invalidLink()

    const hashedPassword = await bcryptjs.hash(newPassword, 10)
    await user.update({ password: hashedPassword }, { transaction })

    const now = new Date()
    await PasswordResetToken.update(
      { used_at: now },
      { where: { user_id: user.id, used_at: null }, transaction }
    )
  })
}

export default { requestReset, confirmReset }
