export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_sales_payment_type" ADD VALUE 'paid';
    `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_sales_payment_type" RENAME TO "enum_sales_payment_type_old";
    `)

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_sales_payment_type" AS ENUM ('credit', 'cash');
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE "sales"
      ALTER COLUMN "payment_type"
      TYPE "enum_sales_payment_type"
      USING (
        CASE
          WHEN payment_type = 'paid' THEN 'cash'::text
          ELSE payment_type::text
        END
      )::"enum_sales_payment_type";
    `)

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_sales_payment_type_old";
    `)
  },
}
