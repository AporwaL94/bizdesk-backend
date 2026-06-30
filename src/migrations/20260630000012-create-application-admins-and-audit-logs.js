const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Rename table 'apps' to 'applications'
    await queryInterface.renameTable('apps', 'applications');

    // 2. Rename columns 'appId' to 'application_id' in business tables
    const tables = [
      'vendors',
      'activation_keys',
      'payments',
      'vendor_shops',
      'vendor_products',
      'vendor_invoices',
      'vendor_customers'
    ];

    for (const table of tables) {
      await queryInterface.renameColumn(table, 'appId', 'application_id');
    }

    // 3. Create 'application_admins' table
    await queryInterface.createTable('application_admins', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'APPLICATION_ADMIN'
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'profile_image'
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active'
      },
      applicationId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'application_id',
        references: {
          model: 'applications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      permissions: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 4. Create 'impersonation_logs' table
    await queryInterface.createTable('impersonation_logs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      originalAdminId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'original_admin_id'
      },
      impersonatedAdminId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'impersonated_admin_id'
      },
      applicationId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'application_id',
        references: {
          model: 'applications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'ip_address'
      },
      userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'user_agent'
      },
      switchedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'switched_at'
      },
      restoredAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'restored_at'
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('impersonation_logs');
    await queryInterface.dropTable('application_admins');

    const tables = [
      'vendors',
      'activation_keys',
      'payments',
      'vendor_shops',
      'vendor_products',
      'vendor_invoices',
      'vendor_customers'
    ];

    for (const table of tables) {
      await queryInterface.renameColumn(table, 'application_id', 'appId');
    }

    await queryInterface.renameTable('applications', 'apps');
  }
};
