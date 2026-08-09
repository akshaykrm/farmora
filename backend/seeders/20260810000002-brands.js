const BRANDS = ['SKM', 'Krishi', 'MBS', 'SHANTHI', 'GODREJ', "VENKY'S", 'SKYLARK']

export default {
  async up(queryInterface) {
    for (const name of BRANDS) {
      await queryInterface.sequelize.query(
        `INSERT INTO brands (name, status, created_at, updated_at)
         VALUES (:name, 'active', NOW(), NOW())
         ON CONFLICT (name) DO NOTHING;`,
        { replacements: { name } }
      )
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('brands', null, {})
  },
}
