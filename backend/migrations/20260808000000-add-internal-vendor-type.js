export default {
  async up(queryInterface) {
    // Rename old enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_vendors_vendor_type" RENAME TO "enum_vendors_vendor_type_old";
    `)

    // Create new enum with the internal type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_vendors_vendor_type" AS ENUM ('supplier', 'customer', 'internal');
    `)

    // Update column to use new enum; any vendor named 'Internal' becomes internal
    await queryInterface.sequelize.query(`
      ALTER TABLE "vendors"
      ALTER COLUMN "vendor_type"
      TYPE "enum_vendors_vendor_type"
      USING (
        CASE
          WHEN name = 'Internal' THEN 'internal'
          WHEN vendor_type = 'supplier' THEN 'supplier'
          WHEN vendor_type = 'customer' THEN 'customer'
        END
      )::"enum_vendors_vendor_type";
    `)

    // Drop old enum
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_vendors_vendor_type_old";
    `)
  },

  async down(queryInterface) {
    // Reverse process

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_vendors_vendor_type" RENAME TO "enum_vendors_vendor_type_old";
    `)

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_vendors_vendor_type" AS ENUM ('supplier', 'customer');
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE "vendors"
      ALTER COLUMN "vendor_type"
      TYPE "enum_vendors_vendor_type"
      USING (
        CASE
          WHEN vendor_type = 'internal' THEN 'supplier'
          WHEN vendor_type = 'supplier' THEN 'supplier'
          WHEN vendor_type = 'customer' THEN 'customer'
        END
      )::"enum_vendors_vendor_type";
    `)

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_vendors_vendor_type_old";
    `)
  },
}
