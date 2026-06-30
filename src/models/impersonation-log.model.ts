import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize
} from 'sequelize';
import { App } from './app.model';

export class ImpersonationLog extends Model<InferAttributes<ImpersonationLog>, InferCreationAttributes<ImpersonationLog>> {
  declare id: CreationOptional<string>;
  declare originalAdminId: string;
  declare impersonatedAdminId: string | null;
  declare applicationId: string;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare switchedAt: Date;
  declare restoredAt: Date | null;
  declare duration: number | null; // in seconds

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate() {
    ImpersonationLog.belongsTo(App, { foreignKey: 'applicationId', as: 'application' });
  }
}

export function initImpersonationLog(sequelize: Sequelize) {
  ImpersonationLog.init({
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
      field: 'impersonated_admin_id'
    },
    applicationId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'application_id',
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    ipAddress: {
      type: DataTypes.STRING,
      field: 'ip_address'
    },
    userAgent: {
      type: DataTypes.STRING,
      field: 'user_agent'
    },
    switchedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'switched_at'
    },
    restoredAt: {
      type: DataTypes.DATE,
      field: 'restored_at'
    },
    duration: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'impersonation_logs'
  });
}
