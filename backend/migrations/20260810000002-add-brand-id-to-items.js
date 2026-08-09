'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('items', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    })

    await queryInterface.addColumn('items', 'brand_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('items', 'brand_id')

    await queryInterface.changeColumn('items', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    })
  },
}
