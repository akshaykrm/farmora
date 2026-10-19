const TTL_MS = 5 * 60 * 1000
const MAX_ENTRIES = 500
const PLATFORM_SCOPE = 'platform'
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const entries = new Map()
const versions = new Map()

const versionOf = (scope) => versions.get(scope) || 0

export const bumpVersion = (scope) => {
  versions.set(scope, versionOf(scope) + 1)
}

const stableStringify = (value) =>
  JSON.stringify(
    Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        if (value[key] !== undefined) acc[key] = value[key]
        return acc
      }, {})
  )

export const cacheKey = (scope, reportKey, filter, extra = {}) =>
  `${scope}|${versionOf(scope)}|${reportKey}|${stableStringify({ ...filter, ...extra })}`

export const getCached = (key) => {
  const entry = entries.get(key)
  if (!entry) return undefined
  if (entry.expiresAt < Date.now()) {
    entries.delete(key)
    return undefined
  }
  return entry.value
}

export const setCached = (key, value) => {
  if (entries.size >= MAX_ENTRIES) {
    const oldest = entries.keys().next().value
    entries.delete(oldest)
  }
  entries.set(key, { value, expiresAt: Date.now() + TTL_MS })
}

export const clearReportCache = () => {
  entries.clear()
}

export const scopeFor = (masterId) =>
  masterId ? `company:${masterId}` : PLATFORM_SCOPE

/**
 * Any successful write makes cached report results for that company (and the
 * platform reports) stale, so the next view is recomputed.
 */
export const reportCacheInvalidator = (req, res, next) => {
  if (!WRITE_METHODS.has(req.method)) return next()
  res.on('finish', () => {
    if (res.statusCode >= 400) return
    const masterId = req.user?.master_id
    if (masterId) bumpVersion(scopeFor(masterId))
    bumpVersion(PLATFORM_SCOPE)
  })
  return next()
}
