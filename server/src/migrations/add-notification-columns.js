import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    try {
        console.log('🔄 Checking missing columns in Notifications table...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('Notifications');

        const columns = {
            notification_type: { type: DataTypes.STRING, allowNull: true },
            priority: { type: DataTypes.STRING, allowNull: true },
            target_audience: { type: DataTypes.STRING, allowNull: true },
            acknowledged: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
            expires_at: { type: DataTypes.DATE, allowNull: true },
            created_by: { type: DataTypes.UUID, allowNull: true },
        };

        for (const [name, definition] of Object.entries(columns)) {
            if (!tableDefinition[name]) {
                console.log(`➕ Adding ${name} column...`);
                await queryInterface.addColumn('Notifications', name, definition);
            } else {
                console.log(`ℹ️ ${name} column already exists`);
            }
        }

        console.log('✅ Notifications columns setup completed');

    } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && (error.parent?.errno === 1060 || error.parent?.errno === 1069)) {
            console.log('ℹ️ Notification columns already existed. Proceeding.');
            return;
        }
        console.error('❌ Notification columns migration failed:', error);
        throw error;
    }
}

export async function down() {
    const queryInterface = sequelize.getQueryInterface();
    for (const name of ['created_by', 'expires_at', 'acknowledged', 'target_audience', 'priority', 'notification_type']) {
        await queryInterface.removeColumn('Notifications', name);
    }
}
