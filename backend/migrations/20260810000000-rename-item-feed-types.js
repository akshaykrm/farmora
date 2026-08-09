'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_items_type" RENAME VALUE 'BF' TO 'FINISHER';`
    )
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_items_type" RENAME VALUE 'BS' TO 'STARTER';`
    )
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_items_type" RENAME VALUE 'PBS' TO 'PRE STARTER';`
    )
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_items_type" RENAME VALUE 'FINISHER' TO 'BF';`
    )
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_items_type" RENAME VALUE 'STARTER' TO 'BS';`
    )
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_items_type" RENAME VALUE 'PRE STARTER' TO 'PBS';`
    )
  },
}
