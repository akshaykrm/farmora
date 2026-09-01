import { Sequelize } from 'sequelize'
import CONFIG from '../../config.js'
import logger from './logger.js'

const { db_dialect, db_host, db_name, db_password, db_user, nodeEnv, slowQueryThreshold } = CONFIG

const formatSql = (sql) => sql.trim().replace(/\s+/g, ' ')

export const sequelize = new Sequelize(db_name, db_user, db_password, {
  host: db_host,
  dialect: db_dialect,
  benchmark: true,
  logging: (sql, timing) => {
    const duration = Number.isFinite(timing) && timing > 0 ? Math.round(timing * 100) / 100 : null
    const cleanSql = typeof sql === 'string' ? formatSql(sql).replace(/^Executing \(default\): ?/, '') : String(sql)

    if (nodeEnv === 'production') {
      if (duration !== null && duration > slowQueryThreshold) {
        logger.warn({ sql: cleanSql, duration, slowQueryThreshold }, 'slow query executed')
      }
      return
    }

    const queryLogger = logger.child({ module: 'db' })
    if (duration !== null && duration > slowQueryThreshold) {
      queryLogger.warn({ sql: cleanSql, duration }, 'slow query executed')
    } else {
      queryLogger.debug({ sql: cleanSql, duration }, 'query executed')
    }
  },
})

export const connectDB = async () => {
  try {
    await sequelize.authenticate()
    logger.info('Database connected successfully.')
  } catch (error) {
    logger.error({ err: error }, 'Database connection failed')
    process.exit(1)
  }
}
