import dayjs from 'dayjs'
import { CHICK_TYPE, FEED_BAG_KG, FEED_TYPES } from '@utils/feed'
import { isoDate, num, pct, query, ratio, round } from '../helpers.js'

const byBatch = (rows, key = 'batch_id') =>
  new Map(rows.map((row) => [Number(row[key]), row]))

/**
 * Chicks placed per batch: chick purchases plus chicks moved in, minus chicks
 * moved out. Also returns the first chick date, used as the default log start.
 */
export const chickTotals = async (batchIds, masterId) => {
  if (!batchIds.length) return new Map()
  const replacements = { ids: batchIds, masterId, chick: CHICK_TYPE }
  const [purchased, movedIn, movedOut] = await Promise.all([
    query(
      `SELECT p.batch_id, SUM(p.quantity) AS qty,
              MIN(p.invoice_date) FILTER (WHERE p.quantity > 0) AS first_date
       FROM purchases p JOIN items i ON i.id = p.category_id
       WHERE p.master_id = :masterId AND p.batch_id IN (:ids) AND i.type = :chick
       GROUP BY p.batch_id`,
      replacements
    ),
    query(
      `SELECT r.to_batch AS batch_id, SUM(r.quantity) AS qty,
              MIN(r.date) FILTER (WHERE r.quantity > 0) AS first_date
       FROM purchase_returns r JOIN items i ON i.id = r.item_category_id
       WHERE r.master_id = :masterId AND r.to_batch IN (:ids) AND i.type = :chick
       GROUP BY r.to_batch`,
      replacements
    ),
    query(
      `SELECT r.from_batch AS batch_id, SUM(r.quantity) AS qty
       FROM purchase_returns r JOIN items i ON i.id = r.item_category_id
       WHERE r.master_id = :masterId AND r.from_batch IN (:ids) AND i.type = :chick
       GROUP BY r.from_batch`,
      replacements
    ),
  ])

  const purchasedBy = byBatch(purchased)
  const inBy = byBatch(movedIn)
  const outBy = byBatch(movedOut)

  return new Map(
    batchIds.map((id) => {
      const firstDates = [
        purchasedBy.get(id)?.first_date,
        inBy.get(id)?.first_date,
      ]
        .filter(Boolean)
        .map((date) => dayjs(date))
        .sort((a, b) => a.valueOf() - b.valueOf())
      return [
        id,
        {
          chicks:
            num(purchasedBy.get(id)?.qty) +
            num(inBy.get(id)?.qty) -
            num(outBy.get(id)?.qty),
          first_date: firstDates[0]?.format('YYYY-MM-DD') || null,
        },
      ]
    })
  )
}

/**
 * Same figures and formulas as the Batch Overview (overview.service.js):
 * expense is purchases plus transfers in minus returns and transfers out,
 * feed is purchased bags net of returns, sales exclude rows without a season.
 */
export const computeFinancialMetrics = async (batchIds, masterId) => {
  if (!batchIds.length) return new Map()
  const replacements = { ids: batchIds, masterId, feed: FEED_TYPES }
  const [purchases, movedIn, movedOut, sales, chicks] = await Promise.all([
    query(
      `SELECT p.batch_id, SUM(p.net_amount) AS amount,
              SUM(p.quantity) FILTER (WHERE i.type IN (:feed)) AS feed
       FROM purchases p LEFT JOIN items i ON i.id = p.category_id
       WHERE p.master_id = :masterId AND p.batch_id IN (:ids)
       GROUP BY p.batch_id`,
      replacements
    ),
    query(
      `SELECT r.to_batch AS batch_id, SUM(r.total_amount) AS amount,
              SUM(r.quantity) FILTER (WHERE i.type IN (:feed)) AS feed
       FROM purchase_returns r LEFT JOIN items i ON i.id = r.item_category_id
       WHERE r.master_id = :masterId AND r.to_batch IN (:ids)
       GROUP BY r.to_batch`,
      replacements
    ),
    query(
      `SELECT r.from_batch AS batch_id, SUM(r.total_amount) AS amount,
              SUM(r.quantity) FILTER (WHERE i.type IN (:feed)) AS feed
       FROM purchase_returns r LEFT JOIN items i ON i.id = r.item_category_id
       WHERE r.master_id = :masterId AND r.from_batch IN (:ids)
       GROUP BY r.from_batch`,
      replacements
    ),
    query(
      `SELECT batch_id, SUM(weight) AS weight, SUM(bird_no) AS birds,
              SUM(amount) AS amount
       FROM sales
       WHERE master_id = :masterId AND batch_id IN (:ids)
         AND season_id IS NOT NULL AND deleted_at IS NULL
       GROUP BY batch_id`,
      replacements
    ),
    chickTotals(batchIds, masterId),
  ])

  const p = byBatch(purchases)
  const tin = byBatch(movedIn)
  const tout = byBatch(movedOut)
  const s = byBatch(sales)

  return new Map(
    batchIds.map((id) => {
      const feedPurchased = num(p.get(id)?.feed) + num(tin.get(id)?.feed)
      const feedReturned = num(tout.get(id)?.feed)
      const netFeedBags = feedPurchased - feedReturned
      const netFeedKg = netFeedBags * FEED_BAG_KG
      const expense =
        num(p.get(id)?.amount) +
        num(tin.get(id)?.amount) -
        num(tout.get(id)?.amount)
      const saleWeight = num(s.get(id)?.weight)
      const saleBirds = num(s.get(id)?.birds)
      const revenue = num(s.get(id)?.amount)
      const avgWeight = ratio(saleWeight, saleBirds, 3)
      const fcr = ratio(netFeedKg, saleWeight, 3)
      return [
        id,
        {
          chicks_placed: chicks.get(id)?.chicks || 0,
          feed_purchased_bags: round(feedPurchased),
          feed_returned_bags: round(feedReturned),
          net_feed_bags: round(netFeedBags),
          net_feed_kg: round(netFeedKg),
          sale_birds: saleBirds,
          sale_weight: round(saleWeight),
          avg_weight: avgWeight,
          fcr,
          cfcr: saleWeight ? round(fcr - (avgWeight - 2.0) * 0.25, 3) : 0,
          expense: round(expense),
          revenue: round(revenue),
          profit: round(revenue - expense),
          cost_per_kg: ratio(expense, saleWeight),
          rate_per_kg: ratio(revenue, saleWeight),
        },
      ]
    })
  )
}

const ageOn = (startDate, date) =>
  dayjs(date).startOf('day').diff(dayjs(startDate).startOf('day'), 'day') + 1

/**
 * Same figures as the daily log summary (batch-daily-log.service.js), for many
 * batches with two grouped queries instead of loading every log row.
 * `batches` need `id`, `log_start_date` and `closed_on`.
 */
export const computeDailyLogMetrics = async (batches, masterId) => {
  const ids = batches.map((batch) => batch.id)
  if (!ids.length) return new Map()
  const [logs, chicks] = await Promise.all([
    query(
      `SELECT batch_id, COUNT(*) AS log_count,
              SUM(mortality) AS mortality,
              SUM(issued_feed) AS issued,
              SUM(consumed_feed) AS consumed,
              SUM(sold_birds) AS sold_birds,
              SUM(sold_weight) AS sold_weight,
              MAX(date) AS last_log_date,
              (ARRAY_AGG(avg_body_weight ORDER BY date DESC)
                FILTER (WHERE avg_body_weight IS NOT NULL))[1] AS last_body_weight
       FROM batch_daily_logs
       WHERE master_id = :masterId AND batch_id IN (:ids)
       GROUP BY batch_id`,
      { ids, masterId }
    ),
    chickTotals(ids, masterId),
  ])
  const l = byBatch(logs)

  return new Map(
    batches.map((batch) => {
      const log = l.get(batch.id)
      const chick = chicks.get(batch.id)
      const placed = chick?.chicks || 0
      const startDate = batch.log_start_date || chick?.first_date || null
      const endDate = batch.closed_on ? batch.closed_on : new Date()
      const mortality = num(log?.mortality)
      const soldBirds = num(log?.sold_birds)
      const soldWeight = num(log?.sold_weight)
      const consumed = num(log?.consumed)
      const issued = num(log?.issued)
      return [
        batch.id,
        {
          start_date: startDate,
          age: startDate ? ageOn(startDate, endDate) : null,
          log_count: num(log?.log_count),
          last_log_date: isoDate(log?.last_log_date),
          chicks_placed: placed,
          mortality,
          mortality_pct: pct(mortality, placed),
          feed_issued: round(issued),
          feed_consumed: round(consumed),
          feed_stock: round(issued - consumed),
          sold_birds: soldBirds,
          sold_weight: round(soldWeight),
          avg_sale_weight: ratio(soldWeight, soldBirds, 3),
          birds_on_farm: placed - mortality - soldBirds,
          last_body_weight:
            log?.last_body_weight === null ||
            log?.last_body_weight === undefined
              ? null
              : num(log.last_body_weight),
          fcr: ratio(consumed * FEED_BAG_KG, soldWeight, 3),
        },
      ]
    })
  )
}
