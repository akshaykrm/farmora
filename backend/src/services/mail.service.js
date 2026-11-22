import { createTransport } from 'nodemailer'
import { readFileSync } from 'fs'
import { join } from 'path'
import bar from 'handlebars'
import logger from '@utils/logger'
import emailSettings from '@services/email-settings.service'

const { compile } = bar

let cached = { signature: null, transporter: null }

const transportOptions = (config) =>
  config.host
    ? {
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: { user: config.user, pass: config.pass },
      }
    : { service: 'gmail', auth: { user: config.user, pass: config.pass } }

// Rebuilt whenever the saved settings change, so updates in Settings apply
// without restarting the server.
const getTransporter = (config) => {
  const signature = JSON.stringify([
    config.source,
    config.version,
    config.user,
    config.host,
    config.port,
    config.secure,
  ])
  if (cached.signature !== signature) {
    cached = {
      signature,
      transporter: createTransport(transportOptions(config)),
    }
  }
  return cached.transporter
}

const compileTemplate = (templateName, data) => {
  const filePath = join(__dirname, `templates/${templateName}.hbs`)
  const source = readFileSync(filePath, 'utf8')
  const template = compile(source)
  return template(data)
}

export const getMailConfig = () => emailSettings.resolve()

export async function sendMail(to, subject, templateName, templateData) {
  try {
    const config = await emailSettings.resolve()
    if (config.source === 'none') {
      logger.error({ to }, 'Email is not configured; message not sent')
      return { success: false, error: 'Email is not configured.' }
    }
    const htmlContent = compileTemplate(templateName, templateData)
    await getTransporter(config).sendMail({
      from: config.senderName
        ? { name: config.senderName, address: config.user }
        : config.user,
      to,
      subject,
      html: htmlContent,
    })
    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    logger.error({ err: error, to }, 'Error sending email')
    return { success: false, error: error.message }
  }
}
