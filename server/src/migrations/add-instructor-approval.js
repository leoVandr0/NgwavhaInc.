import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    try {
        console.log('🔄 Checking instructor approval columns in User table...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('User');

        // Add is_approved column if it doesn't exist
        if (!tableDefinition.is_approved) {
            console.log('➕ Adding is_approved column...');
            await queryInterface.addColumn('User', 'is_approved', {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
                comment: 'For instructors - requires admin approval before they can create courses'
            });
        } else {
            console.log('ℹ️ is_approved column already exists');
        }

        // Add approved_at column if it doesn't exist
        if (!tableDefinition.approved_at) {
            console.log('➕ Adding approved_at column...');
            await queryInterface.addColumn('User', 'approved_at', {
                type: DataTypes.DATE,
                allowNull: true,
                comment: 'When instructor was approved by admin'
            });
        } else {
            console.log('ℹ️ approved_at column already exists');
        }

        // Add approved_by column if it doesn't exist
        if (!tableDefinition.approved_by) {
            console.log('➕ Adding approved_by column...');
            await queryInterface.addColumn('User', 'approved_by', {
                type: DataTypes.UUID,
                allowNull: true,
                comment: 'Admin who approved the instructor'
            });
        } else {
            console.log('ℹ️ approved_by column already exists');
        }

        console.log('✅ Instructor approval columns setup completed');

        // Update existing verified instructors to also be approved
        console.log('🔄 Updating existing verified instructors to approved...');
        await sequelize.query(`
            UPDATE User 
            SET is_approved = true 
            WHERE role = 'instructor' AND is_verified = true AND (is_approved IS NULL OR is_approved = false)
        `);

        console.log('✅ Existing verified instructors updated to approved');

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
        console.log('🔄 Removing instructor approval columns from User table...');

        const queryInterface = sequelize.getQueryInterface();

        // Remove columns in reverse order
        await queryInterface.removeColumn('User', 'approved_by');
        await queryInterface.removeColumn('User', 'approved_at');
        await queryInterface.removeColumn('User', 'is_approved');

        console.log('✅ Instructor approval columns removed successfully');

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
