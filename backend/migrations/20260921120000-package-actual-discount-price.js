'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('packages', 'actual_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    })
    await queryInterface.addColumn('packages', 'discount_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    })

    await queryInterface.sequelize.query(`
      UPDATE packages
      SET actual_price = price,
          discount_price = 0
    `)

    await queryInterface.sequelize.query(`
      UPDATE packages
      SET discount_price = actual_price
      WHERE name = 'Basic'
    `)

    await queryInterface.changeColumn('packages', 'actual_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    })
    await queryInterface.changeColumn('packages', 'discount_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    })

    await queryInterface.removeColumn('packages', 'price')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('packages', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    })

    await queryInterface.sequelize.query(`
      UPDATE packages
      SET price = GREATEST(actual_price - discount_price, 0)
    `)

    await queryInterface.changeColumn('packages', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    })

    await queryInterface.removeColumn('packages', 'discount_price')
    await queryInterface.removeColumn('packages', 'actual_price')
  },
}
