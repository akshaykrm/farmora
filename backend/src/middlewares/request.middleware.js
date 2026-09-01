import { randomUUID } from 'crypto'
import logger from '@utils/logger'

const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint()
  const requestId = req.headers['x-request-id'] || randomUUID()

  req.id = requestId
  res.setHeader('X-Request-Id', requestId)

  const log = logger.child({ requestId })

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6
    const statusCode = res.statusCode

    const base = {
      method: req.method,
      path: req.originalUrl,
      status: statusCode,
      responseTime: Math.round(durationMs * 100) / 100,
      userId: req.user?.id,
    }

    if (statusCode >= 500) {
      log.error(base, 'request failed')
    } else if (statusCode >= 400) {
      log.warn(base, 'request errored')
    } else {
      log.info(base, 'request completed')
    }
  })

  next()
}

export default requestLogger
