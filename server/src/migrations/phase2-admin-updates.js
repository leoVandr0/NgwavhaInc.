import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('🔄 Running Phase 2 Admin Migrations...');

        // 1. Update Course table
        console.log('📦 Updating Course table...');
        // Alter status column to include new values
        // Note: MySQL ENUM alteration can be tricky, often requires re-defining the column
        await queryInterface.changeColumn('Course', 'status', {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'draft', 'published', 'archived'),
            defaultValue: 'pending'
        });

        const courseTable = await queryInterface.describeTable('Course');
        if (!courseTable.rejectionReason) {
            await queryInterface.addColumn('Course', 'rejectionReason', {
                type: DataTypes.TEXT,
                allowNull: true
            });
        }

        // 2. Update User table
        console.log('👤 Updating User table...');
        const userTable = await queryInterface.describeTable('User');

        if (!userTable.verificationStatus) {
            await queryInterface.addColumn('User', 'verificationStatus', {
                type: DataTypes.ENUM('pending', 'verified', 'rejected'),
                defaultValue: 'pending'
            });
        }
        if (!userTable.nationalIDUrl) {
            await queryInterface.addColumn('User', 'nationalIDUrl', {
                type: DataTypes.STRING,
                allowNull: true
            });
        }
        if (!userTable.certificatesUrl) {
            await queryInterface.addColumn('User', 'certificatesUrl', {
                type: DataTypes.STRING,
                allowNull: true
            });
        }
        if (!userTable.rejectionReason) {
            await queryInterface.addColumn('User', 'rejectionReason', {
                type: DataTypes.TEXT,
                allowNull: true
            });
        }

        // 3. Update Review table
        console.log('💬 Updating Review table...');
        const reviewTable = await queryInterface.describeTable('Review');

        if (!reviewTable.isReported) {
            await queryInterface.addColumn('Review', 'isReported', {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            });
        }
        if (!reviewTable.reportReason) {
            await queryInterface.addColumn('Review', 'reportReason', {
                type: DataTypes.TEXT,
                allowNull: true
            });
        }
        if (!reviewTable.status) {
            await queryInterface.addColumn('Review', 'status', {
                type: DataTypes.ENUM('approved', 'flagged', 'hidden'),
                defaultValue: 'approved'
            });
        }

        console.log('✅ Phase 2 migrations completed successfully.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

export async function down() {
    // Optional: Implement rollback logic if needed
}

if (import.meta.url === `file://${process.argv[1]}`) {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
}
