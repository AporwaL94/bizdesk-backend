import { Sequelize } from 'sequelize';
import { execSync } from 'child_process';
import fs from 'fs';
import { env } from '../config/env';
import { appStorage } from '../middleware/app-storage';

// Import all models and their initialization functions directly
import { App, initApp } from './app.model';
import { Vendor, initVendor } from './vendor.model';
import { ActivationKey, initActivationKey } from './activation-key.model';
import { Payment, initPayment } from './payment.model';
import { VendorProduct, initVendorProduct } from './vendor-product.model';
import { VendorInvoice, initVendorInvoice } from './vendor-invoice.model';
import { VendorShop, initVendorShop } from './vendor-shop.model';
import { VendorCustomer, initVendorCustomer } from './vendor-customer.model';
import { ApplicationAdmin, initApplicationAdmin } from './application-admin.model';
import { ImpersonationLog, initImpersonationLog } from './impersonation-log.model';

const isPostgres = env.databaseUrl.startsWith('postgres://') || env.databaseUrl.startsWith('postgresql://');

export const sequelize = isPostgres
  ? new Sequelize(env.databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })
  : new Sequelize({
    dialect: 'sqlite',
    storage: env.databaseUrl.startsWith('sqlite://')
      ? env.databaseUrl.replace('sqlite://', '')
      : env.databaseUrl,
    logging: false
  });

function initModels(seq: Sequelize) {
  // Register global hooks for multi-tenancy scoping first so models inherit them
  seq.addHook('beforeFind', function(this: any, options: any) {
    const store = appStorage.getStore();
    const model = this;

    if (store?.appId && options.bypassAppFilter !== true) {
      if (model && model.rawAttributes && model.rawAttributes.appId) {
        const fieldName = model.rawAttributes.appId.field || 'appId';
        options.where = {
          ...options.where,
          [fieldName]: store.appId
        };
      }
    }
  });

  seq.addHook('beforeValidate', function(instance: any) {
    const store = appStorage.getStore();
    if (store?.appId && instance.constructor.rawAttributes.appId && !instance.appId) {
      instance.appId = store.appId;
    }
  });

  seq.addHook('beforeBulkCreate', function(instances: any[], options: any) {
    const store = appStorage.getStore();
    if (store?.appId) {
      for (const instance of instances) {
        if (instance.constructor.rawAttributes.appId && !instance.appId) {
          instance.appId = store.appId;
        }
      }
    }
  });

  seq.addHook('beforeDestroy', function(instance: any) {
    const store = appStorage.getStore();
    if (store?.appId && instance.constructor.rawAttributes.appId && instance.appId !== store.appId) {
      throw new Error('Unauthorized cross-application data modification attempt.');
    }
  });

  seq.addHook('beforeBulkDestroy', function(this: any, options: any) {
    const store = appStorage.getStore();
    const model = this;
    if (store?.appId && options.bypassAppFilter !== true) {
      if (model && model.rawAttributes && model.rawAttributes.appId) {
        const fieldName = model.rawAttributes.appId.field || 'appId';
        options.where = {
          ...options.where,
          [fieldName]: store.appId
        };
      }
    }
  });

  seq.addHook('beforeBulkUpdate', function(this: any, options: any) {
    const store = appStorage.getStore();
    const model = this;
    if (store?.appId && options.bypassAppFilter !== true) {
      if (model && model.rawAttributes && model.rawAttributes.appId) {
        const fieldName = model.rawAttributes.appId.field || 'appId';
        options.where = {
          ...options.where,
          [fieldName]: store.appId
        };
      }
    }
  });



  // Initialize each model schema
  initApp(seq);
  initVendor(seq);
  initActivationKey(seq);
  initPayment(seq);
  initVendorProduct(seq);
  initVendorInvoice(seq);
  initVendorShop(seq);
  initVendorCustomer(seq);
  initApplicationAdmin(seq);
  initImpersonationLog(seq);

  // Define associations/relations
  App.associate();
  Vendor.associate();
  ActivationKey.associate();
  Payment.associate();
  VendorProduct.associate();
  VendorInvoice.associate();
  VendorShop.associate();
  VendorCustomer.associate();
  ApplicationAdmin.associate();
  ImpersonationLog.associate();
}


export async function initDatabase() {
  initModels(sequelize);

  try {
    console.log('[Database] Running database migrations...');
    const output = execSync('npx --no-install sequelize-cli db:migrate');
    console.log(output.toString());
    console.log('[Database] Database migrations completed successfully.');
  } catch (error) {
    console.error('[Database] Failed to execute database migrations:', error);
    throw error;
  }
}

