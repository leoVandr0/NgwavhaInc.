import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    try {
        console.log('🔄 Checking missing columns in Transactions table...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('Transactions');

        const columns = {
            user_id: { type: DataTypes.UUID, allowNull: true },
            course_id: { type: DataTypes.UUID, allowNull: true },
            paynow_reference: { type: DataTypes.STRING, allowNull: true },
            paynow_poll_url: { type: DataTypes.TEXT, allowNull: true },
            paid_at: { type: DataTypes.DATE, allowNull: true },
            metadata: { type: DataTypes.JSON, allowNull: true },
        };

        for (const [name, definition] of Object.entries(columns)) {
            if (!tableDefinition[name]) {
                console.log(`➕ Adding ${name} column to Transactions...`);
                await queryInterface.addColumn('Transactions', name, definition);
            } else {
                console.log(`ℹ️ ${name} already exists in Transactions`);
            }
        }

        // Extend the status ENUM to include 'cancelled'
        if (tableDefinition['status']) {
            await sequelize.query(
                "ALTER TABLE `Transactions` MODIFY COLUMN `status` ENUM('pending','succeeded','failed','refunded','cancelled') NOT NULL DEFAULT 'pending'"
            );
            console.log('✅ Transactions.status ENUM updated with cancelled');
        }

        console.log('✅ Transactions paynow columns setup completed');

    } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && (error.parent?.errno === 1060 || error.parent?.errno === 1069)) {
            console.log('ℹ️ Transaction columns already existed. Proceeding.');
            return;
        }
        console.error('❌ Transactions paynow migration failed:', error);
        throw error;
    }
}

export async function down() {
    const queryInterface = sequelize.getQueryInterface();
    for (const name of ['metadata', 'paid_at', 'paynow_poll_url', 'paynow_reference', 'course_id', 'user_id']) {
        await queryInterface.removeColumn('Transactions', name);
    }
}
