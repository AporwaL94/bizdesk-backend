import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize
} from 'sequelize';
import { Vendor } from './vendor.model';
import { App } from './app.model';


export class VendorProduct extends Model<InferAttributes<VendorProduct>, InferCreationAttributes<VendorProduct>> {
  declare id: CreationOptional<string>;
  declare appId: CreationOptional<string>;

  declare vendorId: string;
  declare localId: string;
  declare name: string;
  declare barcode: string | null;
  declare price: number;
  declare costPrice: number | null;
  declare stock: CreationOptional<number>;
  declare category: string | null;
  declare expiryDate: Date | null;
  declare imageUrl: string | null;
  declare brand: string | null;
  declare remoteUpdatedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate() {
    VendorProduct.belongsTo(App, { foreignKey: 'appId', as: 'app' });
    VendorProduct.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });
  }
}

export function initVendorProduct(sequelize: Sequelize) {
  VendorProduct.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    appId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'application_id',
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    vendorId: { type: DataTypes.UUID, allowNull: false },
    localId: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    barcode: DataTypes.STRING,
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    costPrice: DataTypes.FLOAT,
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    category: DataTypes.STRING,
    expiryDate: DataTypes.DATE,
    imageUrl: DataTypes.TEXT,
    brand: DataTypes.STRING,
    remoteUpdatedAt: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'vendor_products',
    indexes: [{ unique: true, fields: ['vendorId', 'localId'] }]
  });
}

