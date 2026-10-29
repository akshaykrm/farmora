'use strict'

// Fixed created_at marks rows inserted here so `down` can remove only them.
const BACKFILL_MARKER = '2026-10-07 12:00:00+00'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const [packages] = await queryInterface.sequelize.query(
      `SELECT id, duration FROM packages
       WHERE name = 'Basic' AND deleted_at IS NULL
       ORDER BY id DESC
       LIMIT 1`
    )

    // Fresh DBs (db:refresh) migrate before packages are seeded; nothing to backfill.
    if (!packages.length) {
      return
    }

    const basic = packages[0]

    await queryInterface.sequelize.query(
      `INSERT INTO subscriptions
         (user_id, package_id, valid_from, valid_to, kind, created_at, updated_at)
       SELECT
         u.id,
         :packageId,
         NOW(),
         NOW() + make_interval(months => :duration),
         CASE WHEN EXISTS (
           SELECT 1 FROM subscriptions s
           WHERE s.user_id = u.id AND s.deleted_at IS NULL
         ) THEN 'renewal'::enum_subscriptions_kind
         ELSE 'initial'::enum_subscriptions_kind END,
         :marker,
         NOW()
       FROM users u
       WHERE u.user_type = 'manager'
         AND NOT EXISTS (
           SELECT 1 FROM subscriptions s
           WHERE s.user_id = u.id
             AND s.deleted_at IS NULL
             AND s.valid_from <= NOW()
             AND s.valid_to >= NOW()
         )`,
      {
        replacements: {
          packageId: basic.id,
          duration: basic.duration,
          marker: BACKFILL_MARKER,
        },
      }
    )
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM subscriptions WHERE created_at = :marker`,
      { replacements: { marker: BACKFILL_MARKER } }
    )
  },
}
