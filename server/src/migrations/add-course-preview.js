import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    // Add columns to existing Course table
    await Promise.all([
      queryInterface.addColumn('Courses', 'previewVideoPath', { type: DataTypes.STRING, allowNull: true }),
      queryInterface.addColumn('Courses', 'previewVideoDuration', { type: DataTypes.INTEGER, allowNull: true }),
      queryInterface.addColumn('Courses', 'previewStatus', { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' }),
      queryInterface.addColumn('Courses', 'previewUploadedAt', { type: DataTypes.DATE, allowNull: true }),
      queryInterface.addColumn('Courses', 'previewUploadedBy', { type: DataTypes.UUID, allowNull: true }),
      queryInterface.addColumn('Courses', 'previewApprovedAt', { type: DataTypes.DATE, allowNull: true }),
      queryInterface.addColumn('Courses', 'previewApprovedBy', { type: DataTypes.UUID, allowNull: true }),
      queryInterface.addColumn('Courses', 'previewRejectReason', { type: DataTypes.STRING, allowNull: true }),
    ]);
  } catch (error) {
    console.error('Add course preview migration failed:', error);
    throw error;
  }
}

export async function down() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    await Promise.all([
      queryInterface.removeColumn('Courses', 'previewVideoPath'),
      queryInterface.removeColumn('Courses', 'previewVideoDuration'),
      queryInterface.removeColumn('Courses', 'previewStatus'),
      queryInterface.removeColumn('Courses', 'previewUploadedAt'),
      queryInterface.removeColumn('Courses', 'previewUploadedBy'),
      queryInterface.removeColumn('Courses', 'previewApprovedAt'),
      queryInterface.removeColumn('Courses', 'previewApprovedBy'),
      queryInterface.removeColumn('Courses', 'previewRejectReason'),
    ]);
  } catch (error) {
    console.error('Rollback course preview migration failed:', error);
    throw error;
  }
}

export default { up, down };
