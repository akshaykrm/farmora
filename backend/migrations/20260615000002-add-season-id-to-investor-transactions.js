export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE investor_transactions
      ADD COLUMN season_id INTEGER REFERENCES seasons(id)
        ON UPDATE CASCADE ON DELETE SET NULL;
    `)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE investor_transactions DROP COLUMN season_id;
    `)
  },
}
