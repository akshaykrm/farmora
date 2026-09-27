import pino from 'pino'
import fs from 'fs'
import path from 'path'
import CONFIG from '../../config.js'

const logsDir = path.resolve(process.cwd(), 'logs')
fs.mkdirSync(logsDir, { recursive: true })

const isProd = CONFIG.nodeEnv === 'production'

const baseOptions = {
  level: CONFIG.logLevel,
  base: { env: CONFIG.nodeEnv },
}

let logger

if (isProd) {
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
