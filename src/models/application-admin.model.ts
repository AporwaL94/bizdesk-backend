import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize
} from 'sequelize';
import { App } from './app.model';
import { hashPassword } from '../utils/crypto';

export class ApplicationAdmin extends Model<InferAttributes<ApplicationAdmin>, InferCreationAttributes<ApplicationAdmin>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare phone: string | null;
  declare password: string;
  declare role: CreationOptional<string>;
  declare profileImage: string | null;
  declare status: CreationOptional<string>;
  declare applicationId: string | null;
  declare permissions: string | null; // JSON stringified array of strings

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate() {
    ApplicationAdmin.belongsTo(App, { foreignKey: 'applicationId', as: 'application' });
  }
}

export function initApplicationAdmin(sequelize: Sequelize) {
  ApplicationAdmin.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: DataTypes.STRING,
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'APPLICATION_ADMIN' },
    profileImage: { type: DataTypes.STRING, field: 'profile_image' },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
    applicationId: {
      type: DataTypes.STRING,
      field: 'application_id',
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    permissions: DataTypes.TEXT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'application_admins',
    hooks: {
      beforeCreate: (admin: ApplicationAdmin) => {
        if (admin.password) {
          admin.password = hashPassword(admin.password);
        }
      },
      beforeUpdate: (admin: ApplicationAdmin) => {
        if (admin.changed('password')) {
          admin.password = hashPassword(admin.password);
        }
      }
    }
  });
}
