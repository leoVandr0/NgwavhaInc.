import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  action: { type: DataTypes.STRING, allowNull: false },
  resourceType: { type: DataTypes.STRING, allowNull: false, field: 'resource_type' },
  resourceId: { type: DataTypes.UUID, allowNull: true, field: 'resource_id' },
  details: { type: DataTypes.JSON, allowNull: true },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'AuditLog',
  underscored: true
});

export default AuditLog;
