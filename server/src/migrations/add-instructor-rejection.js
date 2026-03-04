import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    try {
        console.log('🔄 Checking instructor rejection columns in User table...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('User');

        // Add is_rejected column if it doesn't exist
        if (!tableDefinition.is_rejected) {
            console.log('➕ Adding is_rejected column...');
            await queryInterface.addColumn('User', 'is_rejected', {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
                comment: 'For instructors - marked as rejected by admin'
            });
        } else {
            console.log('ℹ️ is_rejected column already exists');
        }

        // Add rejected_at column if it doesn't exist
        if (!tableDefinition.rejected_at) {
            console.log('➕ Adding rejected_at column...');
            await queryInterface.addColumn('User', 'rejected_at', {
                type: DataTypes.DATE,
                allowNull: true,
                comment: 'When instructor was rejected by admin'
            });
        } else {
            console.log('ℹ️ rejected_at column already exists');
        }

        // Add rejected_by column if it doesn't exist
        if (!tableDefinition.rejected_by) {
            console.log('➕ Adding rejected_by column...');
            await queryInterface.addColumn('User', 'rejected_by', {
                type: DataTypes.UUID,
                allowNull: true,
                comment: 'Admin who rejected the instructor'
            });
        } else {
            console.log('ℹ️ rejected_by column already exists');
        }

        // Add rejection_reason column if it doesn't exist
        if (!tableDefinition.rejection_reason) {
            console.log('➕ Adding rejection_reason column...');
            await queryInterface.addColumn('User', 'rejection_reason', {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Reason for rejecting instructor application'
            });
        } else {
            console.log('ℹ️ rejection_reason column already exists');
        }

        console.log('✅ Instructor rejection columns setup completed');

    } catch (error) {
        // If we hit a duplicate column error anyway, gracefully handle it
        if (error.name === 'SequelizeDatabaseError' && error.parent?.errno === 1060) {
            console.log('ℹ️ Columns already existed (concurrency or manual add). Proceeding.');
            return;
        }
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

export async function down() {
    try {
        console.log('🔄 Removing instructor rejection columns from User table...');

        const queryInterface = sequelize.getQueryInterface();

        // Remove columns in reverse order
        await queryInterface.removeColumn('User', 'rejection_reason');
        await queryInterface.removeColumn('User', 'rejected_by');
        await queryInterface.removeColumn('User', 'rejected_at');
        await queryInterface.removeColumn('User', 'is_rejected');

        console.log('✅ Instructor rejection columns removed successfully');

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
