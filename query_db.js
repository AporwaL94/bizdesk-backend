const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database_v3.sqlite',
  logging: false
});

async function queryDb() {
  console.log('=== DIAGNOSING DATABASE CONTENT ===\n');
  try {
    // Query Apps
    const apps = await sequelize.query('SELECT * FROM apps', { type: Sequelize.QueryTypes.SELECT });
    console.log(`[Apps] Found ${apps.length} records:`);
    console.log(JSON.stringify(apps, null, 2));
    console.log('');

    // Query Keys
    const keys = await sequelize.query('SELECT * FROM activation_keys', { type: Sequelize.QueryTypes.SELECT });
    console.log(`[Activation Keys] Found ${keys.length} records:`);
    console.log(JSON.stringify(keys, null, 2));
    console.log('');

    // Query Vendors
    const vendors = await sequelize.query('SELECT * FROM vendors', { type: Sequelize.QueryTypes.SELECT });
    console.log(`[Vendors] Found ${vendors.length} records:`);
    console.log(JSON.stringify(vendors, null, 2));
    console.log('');

  } catch (error) {
    console.error('Failed to query database:', error);
  } finally {
    await sequelize.close();
  }
}

queryDb();
