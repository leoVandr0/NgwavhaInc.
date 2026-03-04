import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    try {
        console.log('🔄 Checking Course table schema for missing columns...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('Course');

        const columnsToAdd = {
            preview_video_path: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'preview_video_path'
            },
            preview_video_duration: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'preview_video_duration'
            },
            preview_status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected'),
                defaultValue: 'pending',
                field: 'preview_status'
            },
            preview_uploaded_at: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'preview_uploaded_at'
            },
            preview_uploaded_by: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'preview_uploaded_by'
            },
            preview_approved_at: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'preview_approved_at'
            },
            preview_approved_by: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'preview_approved_by'
            },
            preview_reject_reason: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'preview_reject_reason'
            }
        };

        for (const [colName, definition] of Object.entries(columnsToAdd)) {
            if (!tableDefinition[colName]) {
                console.log(`➕ Adding column: ${colName}...`);
                await queryInterface.addColumn('Course', colName, definition);
            } else {
                console.log(`ℹ️ Column ${colName} already exists`);
            }
        }

        console.log('✅ Course schema synchronization completed');

    } catch (error) {
        console.error('❌ Course schema migration failed:', error);
        throw error;
    }
}

export async function down() {
    try {
        console.log('🔄 Removing preview columns from Course table...');
        const queryInterface = sequelize.getQueryInterface();
        const columnsToRemove = [
            'preview_video_path',
            'preview_video_duration',
            'preview_status',
            'preview_uploaded_at',
            'preview_uploaded_by',
            'preview_approved_at',
            'preview_approved_by',
            'preview_reject_reason'
        ];

        for (const colName of columnsToRemove) {
            await queryInterface.removeColumn('Course', colName);
        }
        console.log('✅ Course schema cleanup completed');
    } catch (error) {
        console.error('❌ Course schema rollback failed:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        await up();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}
