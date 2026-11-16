'use strict'
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('general_categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      master_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'active',
      },
      created_at: { type: Sequelize.DATE },
      updated_at: { type: Sequelize.DATE },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    })

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX general_categories_master_type_name_unique
      ON general_categories (master_id, type, LOWER(name))
      WHERE deleted_at IS NULL
    `)

    for (const table of ['general_expenses', 'expense_sales']) {
      await queryInterface.addColumn(table, 'category_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      })
    }

    // Existing free-text purposes become categories so old records keep working
    const backfill = [
      ['general_expenses', 'expense'],
      ['expense_sales', 'sale'],
    ]
    for (const [table, type] of backfill) {
      await queryInterface.sequelize.query(`
        INSERT INTO general_categories (master_id, type, name, status, created_at, updated_at)
        SELECT master_id, '${type}', MIN(TRIM(purpose)), 'active', NOW(), NOW()
        FROM ${table}
        WHERE TRIM(purpose) <> ''
        GROUP BY master_id, LOWER(TRIM(purpose))
      `)
      await queryInterface.sequelize.query(`
        UPDATE ${table} t
        SET category_id = c.id
        FROM general_categories c
        WHERE c.master_id = t.master_id
          AND c.type = '${type}'
          AND LOWER(c.name) = LOWER(TRIM(t.purpose))
          AND c.deleted_at IS NULL
      `)
      // one spelling per category, so reports group legacy variants together
      await queryInterface.sequelize.query(`
        UPDATE ${table} t
        SET purpose = c.name
        FROM general_categories c
        WHERE t.category_id = c.id AND t.purpose <> c.name
      `)
    }
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('expense_sales', 'category_id')
    await queryInterface.removeColumn('general_expenses', 'category_id')
    await queryInterface.dropTable('general_categories')
  },
}
