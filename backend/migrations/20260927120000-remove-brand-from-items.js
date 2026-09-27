export default {
  async up(queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      // carry the brand label over as the item name before the link is dropped
      await queryInterface.sequelize.query(
        `UPDATE "items" i
         SET "name" = b."name"
         FROM "brands" b
         WHERE i."brand_id" = b."id"
           AND i."name" IS NULL;`,
        { transaction }
      )

      // anything still unnamed gets a stable placeholder
      await queryInterface.sequelize.query(
        `UPDATE "items" SET "name" = 'Item ' || "id" WHERE "name" IS NULL;`,
        { transaction }
      )

      await queryInterface.changeColumn(
        'items',
        'name',
        { type: Sequelize.STRING, allowNull: false },
        { transaction }
      )

      await queryInterface.removeColumn('items', 'brand_id', { transaction })
    })
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      // the dropped brand_id values cannot be restored
      await queryInterface.addColumn(
        'items',
        'brand_id',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction }
      )

      await queryInterface.changeColumn(
        'items',
        'name',
        { type: Sequelize.STRING, allowNull: true },
        { transaction }
      )
    })
  },
}
