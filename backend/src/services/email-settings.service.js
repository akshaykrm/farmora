import EmailSettings from '@models/emailsettings'
import {
  decryptSecret,
  encryptSecret,
  isEncryptionConfigured,
} from '@utils/secret-box'

const badRequest = (message, code = 'EMAIL_SETTINGS_INVALID') => {
  const error = new Error(message)
  error.statusCode = 400
  error.code = code
  error.name = 'ValidationError'
  return error
}

const row = () => EmailSettings.findByPk(1)

const trimUrl = (value) => (value ? value.trim().replace(/\/+$/, '') : '')

// Settings saved in Super Admin > Settings win; .env is the fallback so
// existing deployments keep working until the page is filled in.
const resolve = async () => {
  const settings = await row()
  const fromDb = Boolean(settings?.sender_email && settings?.encrypted_password)
  const frontendUrl =
    trimUrl(settings?.frontend_url) || trimUrl(process.env.FRONTEND_URL)

  if (fromDb) {
    return {
      source: 'settings',
      user: settings.sender_email,
      pass: decryptSecret(settings.encrypted_password),
      senderName: settings.sender_name || '',
      host: settings.smtp_host || '',
      port: settings.smtp_port || null,
      secure: settings.smtp_secure,
      frontendUrl,
      version: settings.updatedAt?.getTime() || 0,
    }
  }
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return {
      source: 'env',
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      senderName: '',
      host: '',
      port: null,
      secure: true,
      frontendUrl,
      version: 0,
    }
  }
  return { source: 'none', frontendUrl }
}

const read = async () => {
  const settings = await row()
  const resolved = await resolve().catch(() => ({ source: 'error' }))
  return {
    sender_email: settings?.sender_email || '',
    sender_name: settings?.sender_name || '',
    smtp_host: settings?.smtp_host || '',
    smtp_port: settings?.smtp_port || null,
    smtp_secure: settings?.smtp_secure ?? true,
    frontend_url: settings?.frontend_url || '',
    password_configured: Boolean(settings?.encrypted_password),
    encryption_configured: isEncryptionConfigured(),
    active_source: resolved.source,
    updated_at: settings?.updatedAt || null,
  }
}

const save = async ({
  sender_email,
  sender_name,
  password,
  smtp_host,
  smtp_port,
  smtp_secure,
  frontend_url,
}) => {
  const current = await row()
  const host = (smtp_host || '').trim()
  let newPassword = (password || '').trim()
  // Gmail shows app passwords in groups of four; the spaces are not part of it.
  if (!host) newPassword = newPassword.replace(/\s+/g, '')

  if (!newPassword && !current?.encrypted_password) {
    throw badRequest('Enter the app password when saving email settings.')
  }
  if (host && !smtp_port) {
    throw badRequest('Enter the SMTP port when using a custom SMTP host.')
  }

  const encrypted = newPassword
    ? encryptSecret(newPassword)
    : current.encrypted_password

  await EmailSettings.upsert({
    id: 1,
    sender_email: sender_email.trim(),
    sender_name: (sender_name || '').trim() || null,
    encrypted_password: encrypted,
    smtp_host: host || null,
    smtp_port: host ? smtp_port : null,
    smtp_secure: host ? Boolean(smtp_secure) : true,
    frontend_url: trimUrl(frontend_url) || null,
  })
  return read()
}

export default { read, save, resolve }
