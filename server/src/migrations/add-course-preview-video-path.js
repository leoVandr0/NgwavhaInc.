export async function up() {
  try {
    const { default: Course } = await import('../models/Course.js');
    const tableName = Course.getTableName?.() ?? 'Course';
    const sequelize = Course.sequelize;
    await sequelize.query(`ALTER TABLE \`${tableName}\` ADD COLUMN IF NOT EXISTS \`preview_video_path\` VARCHAR(255) NULL;`);
  } catch (err) {
    try {
      const { default: Course } = await import('../models/Course.js');
      const tableName = Course.getTableName?.() ?? 'Course';
      const sequelize = Course.sequelize;
      await sequelize.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`preview_video_path\` VARCHAR(255) NULL;`);
    } catch (e) {
      console.error('Course preview video path migration failed (fallback):', e?.message ?? e);
    }
  }
}

export default { up };
