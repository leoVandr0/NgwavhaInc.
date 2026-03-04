import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    try {
        console.log('🔄 Checking is_archived column in Enrollment table...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('Enrollment');

        // Add is_archived column if it doesn't exist
        if (!tableDefinition.is_archived) {
            console.log('➕ Adding is_archived column...');
            await queryInterface.addColumn('Enrollment', 'is_archived', {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
                comment: 'For students to hide courses from their main dashboard'
            });
        } else {
            console.log('ℹ️ is_archived column already exists');
        }

        console.log('✅ Enrollment archive column setup completed');

    } catch (error) {
        // If we hit a duplicate column error anyway, gracefully handle it
        if (error.name === 'SequelizeDatabaseError' && error.parent?.errno === 1060) {
            console.log('ℹ️ Column already existed (concurrency or manual add). Proceeding.');
            return;
        }
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

export async function down() {
    try {
        console.log('🔄 Removing is_archived column from Enrollment table...');

        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.removeColumn('Enrollment', 'is_archived');

        console.log('✅ Enrollment archive column removed successfully');

    } catch (error) {
        console.error('❌ Rollback failed:', error);
        throw error;
    }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        await up();
        console.log('🎉 Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}
