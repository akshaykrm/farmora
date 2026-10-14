import {
  dayStart,
  idFiltersSql,
  nameOf,
  nextDayStart,
  query,
} from './helpers.js'
import { dateMeta } from '@services/exports/helpers'

/**
 * Batches of a company matching the report filters. A date range keeps the
 * batches that were running at any point in it (created before the range
 * ends and not closed before it starts).
 */
export const selectBatches = async (masterId, filter) => {
  const ids = idFiltersSql([
    ['b.season_id', 'season_id', filter.season_id],
    ['b.farm_id', 'farm_id', filter.farm_id],
    ['b.id', 'batch_id', filter.batch_id],
  ])
  const parts = []
  const replacements = { masterId, ...ids.replacements }
  if (filter.batch_status === 'open') parts.push('b.closed_on IS NULL')
  if (filter.batch_status === 'closed') parts.push('b.closed_on IS NOT NULL')
  if (filter.end_date) {
    parts.push('b.created_at < :rangeEnd')
    replacements.rangeEnd = nextDayStart(filter.end_date)
  }
  if (filter.start_date) {
    parts.push('(b.closed_on IS NULL OR b.closed_on >= :rangeStart)')
    replacements.rangeStart = dayStart(filter.start_date)
  }

  return query(
    `SELECT b.id, b.name, b.master_id, b.season_id, s.name AS season_name,
            b.farm_id, f.name AS farm_name, f.capacity AS farm_capacity,
            b.closed_on, b.log_start_date
     FROM batches b
     LEFT JOIN seasons s ON s.id = b.season_id
     LEFT JOIN farms f ON f.id = b.farm_id
     WHERE b.master_id = :masterId${ids.sql}${parts.length ? ` AND ${parts.join(' AND ')}` : ''}
     ORDER BY b.created_at ASC, b.name ASC`,
    replacements
  )
}

const STATUS_LABELS = { open: 'Open', closed: 'Closed' }

export const batchFilterMeta = async (masterId, filter) => {
  const [season, farm, batch] = await Promise.all([
    nameOf('seasons', filter.season_id, masterId),
    nameOf('farms', filter.farm_id, masterId),
    nameOf('batches', filter.batch_id, masterId),
  ])
  return [
    { label: 'Season', value: season },
    { label: 'Farm', value: farm },
    { label: 'Batch', value: batch },
    { label: 'Batch Status', value: STATUS_LABELS[filter.batch_status] },
    dateMeta(filter.start_date, filter.end_date),
  ].filter(Boolean)
}
