export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('investor_managements', {
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
      investor_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      investor_phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      investor_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable('investor_managements')
  },
}
