'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_packages_status" ADD VALUE IF NOT EXISTS 'disabled'`
    )
  },

  async down(queryInterface) {
    // No-op: PostgreSQL does not support removing a value from an enum type.
  },
}
