import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('🔄 Running Phase 2 Admin Migrations (snake_case sync & cleanup)...');

        const ensureColumn = async (tableName, oldCol, newCol, definition) => {
            const table = await queryInterface.describeTable(tableName);
            if (!table[newCol]) {
                if (table[oldCol]) {
                    console.log(`🔧 Renaming column ${tableName}.${oldCol} to ${newCol}...`);
                    await queryInterface.renameColumn(tableName, oldCol, newCol);
                } else {
                    console.log(`➕ Adding column ${tableName}.${newCol}...`);
                    await queryInterface.addColumn(tableName, newCol, definition);
                }
            } else {
                console.log(`ℹ️ Column ${tableName}.${newCol} already exists`);
            }
        };

        // 1. Update Course table
        console.log('📦 Updating Course table...');
        // Alter status column to include new values
        await queryInterface.changeColumn('Course', 'status', {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'draft', 'published', 'archived'),
            defaultValue: 'pending'
        });

        await ensureColumn('Course', 'rejectionReason', 'rejection_reason', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        // 2. Update User table
        console.log('👤 Updating User table...');
        await ensureColumn('User', 'verificationStatus', 'verification_status', {
            type: DataTypes.ENUM('pending', 'verified', 'rejected'),
            defaultValue: 'pending'
        });
        await ensureColumn('User', 'nationalIDUrl', 'national_id_url', {
            type: DataTypes.STRING,
            allowNull: true
        });
        await ensureColumn('User', 'certificatesUrl', 'certificates_url', {
            type: DataTypes.STRING,
            allowNull: true
        });
        // Note: rejection_reason might already be added by add-instructor-rejection.js
        await ensureColumn('User', 'rejectionReason', 'rejection_reason', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        // 3. Update Review table
        console.log('💬 Updating Review table...');
        await ensureColumn('Review', 'isReported', 'is_reported', {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        });
        await ensureColumn('Review', 'reportReason', 'report_reason', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        const reviewTable = await queryInterface.describeTable('Review');
        if (!reviewTable.status) {
            await queryInterface.addColumn('Review', 'status', {
                type: DataTypes.ENUM('approved', 'flagged', 'hidden'),
                defaultValue: 'approved'
            });
        }

        console.log('✅ Phase 2 migrations completed successfully.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        if (error.name === 'SequelizeDatabaseError' && error.parent?.errno === 1060) {
            console.log('ℹ️ Some columns already existed. Proceeding.');
            return;
        }
        throw error;
    }
}

export async function down() {
    // Optional: Implement rollback logic if needed
}

if (import.meta.url === `file://${process.argv[1]}`) {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
}
