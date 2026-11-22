import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

// AES-256-GCM using PAYMENT_SETTINGS_ENCRYPTION_KEY, same format as the
// Razorpay credentials in payment-settings.service.js (iv.tag.ciphertext).
const KEY_PATTERN = /^[a-f0-9]{64}$/i

const settingsError = (message, code) => {
  const error = new Error(message)
  error.statusCode = 503
  error.code = code
  return error
}

export const isEncryptionConfigured = () =>
  KEY_PATTERN.test(process.env.PAYMENT_SETTINGS_ENCRYPTION_KEY || '')

const encryptionKey = () => {
  if (!isEncryptionConfigured()) {
    throw settingsError(
      'Server encryption key is missing. Configure PAYMENT_SETTINGS_ENCRYPTION_KEY before saving credentials.',
      'SETTINGS_ENCRYPTION_NOT_CONFIGURED'
    )
  }
  return Buffer.from(process.env.PAYMENT_SETTINGS_ENCRYPTION_KEY, 'hex')
}

export const encryptSecret = (value) => {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ])
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString('base64'))
    .join('.')
}

export const decryptSecret = (value) => {
  if (!value) return null
  try {
    const [iv, tag, encrypted] = value
      .split('.')
      .map((part) => Buffer.from(part, 'base64'))
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    throw settingsError(
      'Unable to decrypt saved credentials. Check the server encryption key.',
      'SETTINGS_CREDENTIALS_UNAVAILABLE'
    )
  }
}
