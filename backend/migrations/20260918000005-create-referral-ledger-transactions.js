'use strict'
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('referral_ledger_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      referral_partner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'referral_partners',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM(
          'initial_bonus',
          'renewal_bonus',
          'manual_link_bonus',
          'payment'
        ),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      company_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      subscription_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'subscriptions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'packages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      package_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      package_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      bonus_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bonus_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      bonus_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    await queryInterface.addIndex('referral_ledger_transactions', [
      'referral_partner_id',
    ])
    await queryInterface.addIndex('referral_ledger_transactions', [
      'company_user_id',
    ])
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX referral_ledger_subscription_type_unique
      ON referral_ledger_transactions (subscription_id, type)
      WHERE subscription_id IS NOT NULL
        AND type IN ('initial_bonus', 'renewal_bonus', 'manual_link_bonus');
    `)
  },

  async down(queryInterface) {
    await queryInterface.dropTable('referral_ledger_transactions')
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_referral_ledger_transactions_type";'
    )
  },
}
