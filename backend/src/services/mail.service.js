import { createTransport } from 'nodemailer'
import { readFileSync } from 'fs'
import { join } from 'path'
import bar from 'handlebars'
import logger from '@utils/logger'

const { compile } = bar

// Configure transporter
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Function to compile Handlebars template
const compileTemplate = (templateName, data) => {
  const filePath = join(__dirname, `templates/${templateName}.hbs`)
  const source = readFileSync(filePath, 'utf8')
  const template = compile(source)
  return template(data)
}

// Send Email Function
export async function sendMail(to, subject, templateName, templateData) {
  try {
    const htmlContent = compileTemplate(templateName, templateData)

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent, // Use HTML instead of plain text
    }

    await transporter.sendMail(mailOptions)
    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    logger.error({ err: error, to }, 'Error sending email')
    return { success: false, error: error.message }
  }
}
