export default {
  async up(queryInterface) {
    // Rename old enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_items_type" RENAME TO "enum_items_type_old";
    `)

    // Create new enum with the general type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_items_type" AS ENUM (
        'chick',
        'medicine',
        'FINISHER',
        'STARTER',
        'PRE STARTER',
        'integration',
        'working',
        'regular',
        'general'
      );
    `)

    // Drop column default so it can be cast freely
    await queryInterface.sequelize.query(`
      ALTER TABLE "items"
      ALTER COLUMN "type"
      DROP DEFAULT;
    `)

    // Update column to use new enum
    await queryInterface.sequelize.query(`
      ALTER TABLE "items"
      ALTER COLUMN "type"
      TYPE "enum_items_type"
      USING (
        CASE
          WHEN type = 'chick' THEN 'chick'
          WHEN type = 'medicine' THEN 'medicine'
          WHEN type = 'FINISHER' THEN 'FINISHER'
          WHEN type = 'STARTER' THEN 'STARTER'
          WHEN type = 'PRE STARTER' THEN 'PRE STARTER'
          WHEN type = 'integration' THEN 'integration'
          WHEN type = 'working' THEN 'working'
          WHEN type = 'regular' THEN 'regular'
        END
      )::"enum_items_type";
    `)

    // Restore column default
    await queryInterface.sequelize.query(`
      ALTER TABLE "items"
      ALTER COLUMN "type"
      SET DEFAULT 'regular';
    `)

    // Drop old enum
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_items_type_old";
    `)
  },

  async down(queryInterface) {
    // Reverse process

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_items_type" RENAME TO "enum_items_type_old";
    `)

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_items_type" AS ENUM (
        'chick',
        'medicine',
        'FINISHER',
        'STARTER',
        'PRE STARTER',
        'integration',
        'working',
        'regular'
      );
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE "items"
      ALTER COLUMN "type"
      DROP DEFAULT;
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE "items"
      ALTER COLUMN "type"
      TYPE "enum_items_type"
      USING (
        CASE
          WHEN type = 'general' THEN 'regular'
          WHEN type = 'chick' THEN 'chick'
          WHEN type = 'medicine' THEN 'medicine'
          WHEN type = 'FINISHER' THEN 'FINISHER'
          WHEN type = 'STARTER' THEN 'STARTER'
          WHEN type = 'PRE STARTER' THEN 'PRE STARTER'
          WHEN type = 'integration' THEN 'integration'
          WHEN type = 'working' THEN 'working'
          WHEN type = 'regular' THEN 'regular'
        END
      )::"enum_items_type";
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE "items"
      ALTER COLUMN "type"
      SET DEFAULT 'regular';
    `)

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_items_type_old";
    `)
  },
}