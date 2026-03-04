import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    try {
        console.log('🔄 Adding instructor_status column to User table...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('User');

        // Add instructor_status column if it doesn't exist
        if (!tableDefinition.instructor_status) {
            console.log('➕ Adding instructor_status column...');
            await queryInterface.addColumn('User', 'instructor_status', {
                type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
                allowNull: false,
                defaultValue: 'PENDING',
                comment: 'Instructor application status - PENDING, APPROVED, or REJECTED'
            });
        } else {
            console.log('ℹ️ instructor_status column already exists');
        }

        console.log('✅ Instructor status column setup completed');

        // Migrate existing data
        console.log('🔄 Migrating existing instructor data...');
        
        // Update existing approved instructors
        await sequelize.query(`
            UPDATE User 
            SET instructor_status = 'APPROVED' 
            WHERE role = 'instructor' AND is_approved = true
        `);
        
        // Update existing rejected instructors (if any)
        await sequelize.query(`
            UPDATE User 
            SET instructor_status = 'REJECTED' 
            WHERE role = 'instructor' AND is_rejected = true
        `);
        
        // Set all other instructors to PENDING
        await sequelize.query(`
            UPDATE User 
            SET instructor_status = 'PENDING' 
            WHERE role = 'instructor' AND instructor_status IS NULL
        `);

        console.log('✅ Data migration completed');

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
        console.log('🔄 Removing instructor_status column from User table...');

        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.removeColumn('User', 'instructor_status');

        console.log('✅ Instructor status column removed successfully');

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
