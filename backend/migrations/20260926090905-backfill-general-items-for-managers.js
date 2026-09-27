export default {
  async up(queryInterface) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      // Every manager gets an internal vendor, mirroring createInternalVendor
      await queryInterface.sequelize.query(
        `INSERT INTO "vendors" ("name", "vendor_type", "address", "opening_balance", "status", "master_id", "created_at", "updated_at")
         SELECT 'Internal', 'internal', 'nil', 0, 'active', u.id, NOW(), NOW()
         FROM "users" u
         WHERE u.user_type = 'manager'
           AND NOT EXISTS (
             SELECT 1
             FROM "vendors" v
             WHERE v.master_id = u.id
               AND v.vendor_type = 'internal'
               AND v.deleted_at IS NULL
           );`,
        { transaction }
      )

      // Add the General item on the manager's internal vendor
      await queryInterface.sequelize.query(
        `INSERT INTO "items" ("name", "vendor_id", "type", "base_price", "status", "master_id", "created_at", "updated_at")
         SELECT 'General', v.id, 'general', 0, 'active', v.master_id, NOW(), NOW()
         FROM (
           SELECT DISTINCT ON (v2.master_id) v2.id, v2.master_id
           FROM "vendors" v2
           JOIN "users" u ON u.id = v2.master_id
           WHERE u.user_type = 'manager'
             AND v2.vendor_type = 'internal'
             AND v2.deleted_at IS NULL
           ORDER BY v2.master_id, v2.id
         ) v
         WHERE NOT EXISTS (
           SELECT 1
           FROM "items" i
           WHERE i.master_id = v.master_id
             AND i.name = 'General'
             AND i.type = 'general'
             AND i.deleted_at IS NULL
         );`,
        { transaction }
      )
    })
  },

  async down(queryInterface) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      // Remove the General items added to internal vendors
      await queryInterface.sequelize.query(
        `DELETE FROM "items" i
         USING "vendors" v
         WHERE i.vendor_id = v.id
           AND v.vendor_type = 'internal'
           AND i.name = 'General'
           AND i.type = 'general';`,
        { transaction }
      )

      // Remove internal vendors left without any items
      await queryInterface.sequelize.query(
        `DELETE FROM "vendors" v
         WHERE v.vendor_type = 'internal'
           AND v.deleted_at IS NULL
           AND NOT EXISTS (
             SELECT 1
             FROM "items" i
             WHERE i.vendor_id = v.id
           );`,
        { transaction }
      )
    })
  },
}
