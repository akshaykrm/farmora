export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('investor_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      investor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'investor_managements',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      transaction_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'investor_transaction_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      transaction_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      reference_transaction_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'investor_transactions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      master_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('investor_transactions')
  },
}
