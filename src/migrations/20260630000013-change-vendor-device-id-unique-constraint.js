module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'postgres') {
      // Postgres constraint is case-sensitive, so wrap in double quotes
      await queryInterface.sequelize.query('ALTER TABLE vendors DROP CONSTRAINT IF EXISTS "vendors_deviceId_key"');
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS "vendors_device_id_key"');
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS "vendors_device_id"');
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS "vendors_deviceId_key"');
    } else {
      try {
        await queryInterface.removeConstraint('vendors', 'vendors_deviceId_key');
      } catch (e) {
        // Ignore if constraint does not exist
      }
      try {
        await queryInterface.removeIndex('vendors', 'vendors_deviceId_key');
      } catch (e) {
        // Ignore if index does not exist
      }
    }

    // Add composite unique index on (application_id, deviceId)
    await queryInterface.addIndex('vendors', ['application_id', 'deviceId'], {
      unique: true,
      name: 'vendors_appId_deviceId_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop composite unique index
    await queryInterface.removeIndex('vendors', 'vendors_appId_deviceId_unique');

    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'postgres') {
      await queryInterface.sequelize.query('ALTER TABLE vendors ADD CONSTRAINT "vendors_deviceId_key" UNIQUE ("deviceId")');
    } else {
      await queryInterface.addIndex('vendors', ['deviceId'], {
        unique: true,
        name: 'vendors_deviceId_key'
      });
    }
  }
};
