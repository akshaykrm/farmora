import pino from 'pino'
import fs from 'fs'
import path from 'path'
import CONFIG from '../../config.js'

const logsDir = path.resolve(process.cwd(), process.env.LOG_DIR || 'logs')

const isProd = CONFIG.nodeEnv === 'production'

const baseOptions = {
  level: CONFIG.logLevel,
  base: { env: CONFIG.nodeEnv },
}

const canWriteLogsDir = () => {
  try {
    fs.mkdirSync(logsDir, { recursive: true })
    fs.accessSync(logsDir, fs.constants.W_OK)
    return true
  } catch (error) {
    process.stderr.write(
      `Unable to write logs directory ${logsDir}: ${error.message}. Falling back to stdout.\n`
    )
    return false
  }
}

let logger

if (isProd && canWriteLogsDir()) {
  const fileTransport = pino.transport({
    target: 'pino-roll',
    options: {
      file: path.join(logsDir, 'app.log'),
      frequency: 'daily',
      mkdir: true,
      limit: { count: 7 },
    },
  })

  logger = pino(
    baseOptions,
    pino.multistream([{ stream: process.stdout }, { stream: fileTransport }])
  )
} else if (isProd) {
  logger = pino(baseOptions)
} else {
  logger = pino({
    ...baseOptions,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname,env',
      },
    },
  })
}

export default logger
