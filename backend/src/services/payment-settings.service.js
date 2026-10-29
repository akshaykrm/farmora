import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import PaymentGatewaySettings from '@models/paymentgatewaysettings'
import { checkoutError } from '@errors/checkout.errors'

const encryptionKey = () => {
  const value = process.env.PAYMENT_SETTINGS_ENCRYPTION_KEY
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) {
    throw checkoutError(
      'Server payment encryption key is not configured.',
      'PAYMENT_ENCRYPTION_NOT_CONFIGURED',
      503
    )
  }
  return Buffer.from(value, 'hex')
}

const encrypt = (value) => {
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

const decrypt = (value) => {
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
    throw checkoutError(
      'Unable to decrypt payment credentials. Check the server encryption key.',
      'PAYMENT_CREDENTIALS_UNAVAILABLE',
      503
    )
  }
}

const latest = () => PaymentGatewaySettings.findOne({ order: [['id', 'DESC']] })

const credentials = async (version) => {
  const row = version
    ? await PaymentGatewaySettings.findByPk(version)
    : await latest()
  if (version && !row)
    throw checkoutError(
      'Payment settings version is unavailable.',
      'PAYMENT_NOT_CONFIGURED',
      503
    )
  return row
    ? {
        version: row.id,
        key_id: row.key_id,
        key_secret: decrypt(row.encrypted_key_secret),
        webhook_secret: decrypt(row.encrypted_webhook_secret),
      }
    : {
        version: null,
        key_id: null,
        key_secret: null,
        webhook_secret: null,
      }
}

const read = async () => {
  const row = await latest()
  return {
    key_id: row?.key_id || '',
    secret_configured: Boolean(row?.encrypted_key_secret),
    webhook_configured: Boolean(row?.encrypted_webhook_secret),
    encryption_configured: /^[a-f0-9]{64}$/i.test(
      process.env.PAYMENT_SETTINGS_ENCRYPTION_KEY || ''
    ),
    updated_at: row?.updatedAt || null,
  }
}

const save = async ({ key_id, key_secret, webhook_secret }) => {
  encryptionKey()
  const current = await latest()
  if (!key_secret && (!current || current.key_id !== key_id)) {
    throw checkoutError('Enter the key secret when saving a new key ID.')
  }
  // Versions preserve credentials for in-flight orders during key rotation.
  await PaymentGatewaySettings.create({
    key_id,
    encrypted_key_secret: key_secret
      ? encrypt(key_secret)
      : current.encrypted_key_secret,
    encrypted_webhook_secret: webhook_secret
      ? encrypt(webhook_secret)
      : current?.encrypted_webhook_secret,
  })
  return read()
}

export default { credentials, read, save }
