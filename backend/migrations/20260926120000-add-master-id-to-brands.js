export default {
  async up(queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'brands',
        'master_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction }
      )

      // existing brands become the shared catalog owned by the super admin
      await queryInterface.sequelize.query(
        `UPDATE "brands" SET "master_id" = 1;`,
        { transaction }
      )

      await queryInterface.changeColumn(
        'brands',
        'master_id',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        { transaction }
      )
    })
  },

  async down(queryInterface) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('brands', 'master_id', { transaction })
    })
  },
}
