export async function up() {
  try {
    const { default: AuditLog } = await import('../models/AuditLog.js');
    const tableName = AuditLog.getTableName?.() ?? 'AuditLog';
    const sequelize = AuditLog.sequelize;
    await sequelize.query(`CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      action VARCHAR(255) NOT NULL,
      resource_type VARCHAR(255) NOT NULL,
      resource_id CHAR(36),
      details JSON,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  } catch (err) {
    console.error('Audit log migration failed:', err?.message);
  }
}

export default { up };
