import CONFIG from './config.js'
import { connectDB, sequelize } from '@utils/db'
import logger from '@utils/logger'
import app from './app.js'
import './models/index.js'

const PORT = CONFIG.port

let server

const startApp = async () => {
  try {
    await connectDB()
    server = app.listen(PORT, () =>
      logger.info({ port: PORT }, 'Server started')
    )
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server')
    process.exit(1)
  }
}

const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutting down gracefully')
  if (server) {
    server.close(async () => {
      try {
        await sequelize.close()
        logger.info('Closed database connection')
      } catch (error) {
        logger.error({ err: error }, 'Error closing database connection')
      }
      logger.info('Server shutdown complete')
      process.exit(0)
    })
    setTimeout(() => {
      logger.error('Forced shutdown after timeout')
      process.exit(1)
    }, 10000).unref()
  } else {
    process.exit(0)
  }
}

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception')
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled rejection')
  process.exit(1)
})

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

startApp()
