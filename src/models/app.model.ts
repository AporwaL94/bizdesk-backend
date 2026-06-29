import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize
} from 'sequelize';

export class App extends Model<InferAttributes<App>, InferCreationAttributes<App>> {
  declare id: string;
  declare name: string;
  declare slug: string;
  declare packageName: string | null;
  declare apiKey: string | null;
  declare logo: string | null;
  declare favicon: string | null;
  declare primaryColor: string | null;
  declare secondaryColor: string | null;
  declare theme: string | null;
  declare domain: string | null;
  declare subdomain: string | null;
  declare description: string | null;
  declare version: string | null;
  declare supportEmail: string | null;
  declare supportPhone: string | null;
  declare privacyPolicy: string | null;
  declare termsUrl: string | null;
  declare playstoreUrl: string | null;
  declare appstoreUrl: string | null;
  declare status: CreationOptional<string>;

  // Branding
  declare appIcon: string | null;
  declare splashImage: string | null;
  declare accentColor: string | null;
  declare darkThemeColors: string | null; // JSON Stringified
  declare lightThemeColors: string | null; // JSON Stringified
  declare tagline: string | null;
  declare website: string | null;
  declare refundPolicy: string | null;
  declare socialLinks: string | null; // JSON Stringified
  declare loginBackground: string | null;

  // Settings
  declare gstEnabled: CreationOptional<boolean>;
  declare inventoryEnabled: CreationOptional<boolean>;
  declare onlineSync: CreationOptional<boolean>;
  declare offlineMode: CreationOptional<boolean>;
  declare subscriptionRequired: CreationOptional<boolean>;
  declare freeTrialDays: CreationOptional<number>;
  declare deviceLimit: CreationOptional<number>;
  declare maxUsers: CreationOptional<number>;
  declare maxProducts: CreationOptional<number>;
  declare maxCustomers: CreationOptional<number>;
  declare currency: CreationOptional<string>;
  declare language: CreationOptional<string>;
  declare timezone: CreationOptional<string>;
  declare country: CreationOptional<string>;
  declare state: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate() {
    // Relationships can be referenced directly or using dynamic loading
  }
}

export function initApp(sequelize: Sequelize) {
  App.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    packageName: DataTypes.STRING,
    apiKey: DataTypes.STRING,
    logo: DataTypes.STRING,
    favicon: DataTypes.STRING,
    primaryColor: DataTypes.STRING,
    secondaryColor: DataTypes.STRING,
    theme: DataTypes.STRING,
    domain: DataTypes.STRING,
    subdomain: DataTypes.STRING,
    description: DataTypes.TEXT,
    version: DataTypes.STRING,
    supportEmail: DataTypes.STRING,
    supportPhone: DataTypes.STRING,
    privacyPolicy: DataTypes.TEXT,
    termsUrl: DataTypes.TEXT,
    playstoreUrl: DataTypes.STRING,
    appstoreUrl: DataTypes.STRING,
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },

    // Branding
    appIcon: DataTypes.STRING,
    splashImage: DataTypes.STRING,
    accentColor: DataTypes.STRING,
    darkThemeColors: DataTypes.TEXT,
    lightThemeColors: DataTypes.TEXT,
    tagline: DataTypes.STRING,
    website: DataTypes.STRING,
    refundPolicy: DataTypes.TEXT,
    socialLinks: DataTypes.TEXT,
    loginBackground: DataTypes.STRING,

    // Settings
    gstEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    inventoryEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    onlineSync: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    offlineMode: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    subscriptionRequired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    freeTrialDays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 14 },
    deviceLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    maxUsers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
    maxProducts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1000 },
    maxCustomers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1000 },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'INR' },
    language: { type: DataTypes.STRING, allowNull: false, defaultValue: 'en' },
    timezone: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Asia/Kolkata' },
    country: { type: DataTypes.STRING, allowNull: false, defaultValue: 'IN' },
    state: DataTypes.STRING,

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, { sequelize, tableName: 'apps' });
}
