const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create apps table
    await queryInterface.createTable('apps', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      packageName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      apiKey: {
        type: DataTypes.STRING,
        allowNull: true
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      favicon: {
        type: DataTypes.STRING,
        allowNull: true
      },
      primaryColor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      secondaryColor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      theme: {
        type: DataTypes.STRING,
        allowNull: true
      },
      domain: {
        type: DataTypes.STRING,
        allowNull: true
      },
      subdomain: {
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      version: {
        type: DataTypes.STRING,
        allowNull: true
      },
      supportEmail: {
        type: DataTypes.STRING,
        allowNull: true
      },
      supportPhone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      privacyPolicy: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      termsUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      playstoreUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      appstoreUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active'
      },

      // Branding
      appIcon: {
        type: DataTypes.STRING,
        allowNull: true
      },
      splashImage: {
        type: DataTypes.STRING,
        allowNull: true
      },
      accentColor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      darkThemeColors: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      lightThemeColors: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      tagline: {
        type: DataTypes.STRING,
        allowNull: true
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true
      },
      refundPolicy: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      socialLinks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      loginBackground: {
        type: DataTypes.STRING,
        allowNull: true
      },

      // Settings
      gstEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      inventoryEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      onlineSync: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      offlineMode: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      subscriptionRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      freeTrialDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 14
      },
      deviceLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      maxUsers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      maxProducts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000
      },
      maxCustomers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'INR'
      },
      language: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'en'
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Asia/Kolkata'
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'IN'
      },
      state: {
        type: DataTypes.STRING,
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

    // 2. Insert seed apps
    const now = new Date();
    await queryInterface.bulkInsert('apps', [
      {
        id: 'MediDesk',
        name: 'MediDesk',
        slug: 'medidesk',
        packageName: 'com.medidesk.app',
        apiKey: 'medidesk-api-key',
        status: 'active',
        gstEnabled: false,
        inventoryEnabled: true,
        onlineSync: true,
        offlineMode: false,
        subscriptionRequired: true,
        freeTrialDays: 14,
        deviceLimit: 1,
        maxUsers: 5,
        maxProducts: 1000,
        maxCustomers: 1000,
        currency: 'INR',
        language: 'en',
        timezone: 'Asia/Kolkata',
        country: 'IN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'KiranaDesk',
        name: 'KiranaDesk',
        slug: 'kiranadesk',
        packageName: 'com.kiranadesk.app',
        apiKey: 'kiranadesk-api-key',
        status: 'active',
        gstEnabled: false,
        inventoryEnabled: true,
        onlineSync: true,
        offlineMode: false,
        subscriptionRequired: true,
        freeTrialDays: 14,
        deviceLimit: 1,
        maxUsers: 5,
        maxProducts: 1000,
        maxCustomers: 1000,
        currency: 'INR',
        language: 'en',
        timezone: 'Asia/Kolkata',
        country: 'IN',
        createdAt: now,
        updatedAt: now
      }
    ]);

    // 3. Add appId columns
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
      await queryInterface.addColumn(table, 'appId', {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: 'apps',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    // 4. Backfill existing records with double quotes for PostgreSQL casing
    await queryInterface.sequelize.query('UPDATE vendors SET "appId" = \'KiranaDesk\' WHERE "appId" IS NULL');
    
    // Copy vendor's appId to other tables
    await queryInterface.sequelize.query(`
      UPDATE activation_keys 
      SET "appId" = (SELECT "appId" FROM vendors WHERE vendors.id = activation_keys."vendorId") 
      WHERE "vendorId" IS NOT NULL AND "appId" IS NULL
    `);
    await queryInterface.sequelize.query('UPDATE activation_keys SET "appId" = \'KiranaDesk\' WHERE "appId" IS NULL');

    await queryInterface.sequelize.query(`
      UPDATE payments 
      SET "appId" = (SELECT "appId" FROM vendors WHERE vendors.id = payments."vendorId") 
      WHERE "vendorId" IS NOT NULL AND "appId" IS NULL
    `);
    await queryInterface.sequelize.query('UPDATE payments SET "appId" = \'KiranaDesk\' WHERE "appId" IS NULL');

    await queryInterface.sequelize.query(`
      UPDATE vendor_shops 
      SET "appId" = (SELECT "appId" FROM vendors WHERE vendors.id = vendor_shops."vendorId") 
      WHERE "vendorId" IS NOT NULL AND "appId" IS NULL
    `);
    await queryInterface.sequelize.query('UPDATE vendor_shops SET "appId" = \'KiranaDesk\' WHERE "appId" IS NULL');

    await queryInterface.sequelize.query(`
      UPDATE vendor_products 
      SET "appId" = (SELECT "appId" FROM vendors WHERE vendors.id = vendor_products."vendorId") 
      WHERE "vendorId" IS NOT NULL AND "appId" IS NULL
    `);
    await queryInterface.sequelize.query('UPDATE vendor_products SET "appId" = \'KiranaDesk\' WHERE "appId" IS NULL');

    await queryInterface.sequelize.query(`
      UPDATE vendor_invoices 
      SET "appId" = (SELECT "appId" FROM vendors WHERE vendors.id = vendor_invoices."vendorId") 
      WHERE "vendorId" IS NOT NULL AND "appId" IS NULL
    `);
    await queryInterface.sequelize.query('UPDATE vendor_invoices SET "appId" = \'KiranaDesk\' WHERE "appId" IS NULL');

    await queryInterface.sequelize.query(`
      UPDATE vendor_customers 
      SET "appId" = (SELECT "appId" FROM vendors WHERE vendors.id = vendor_customers."vendorId") 
      WHERE "vendorId" IS NOT NULL AND "appId" IS NULL
    `);
    await queryInterface.sequelize.query('UPDATE vendor_customers SET "appId" = \'KiranaDesk\' WHERE "appId" IS NULL');
  },

  down: async (queryInterface, Sequelize) => {
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
      await queryInterface.removeColumn(table, 'appId');
    }

    await queryInterface.dropTable('apps');
  }
};
