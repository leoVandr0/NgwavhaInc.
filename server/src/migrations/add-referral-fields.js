import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    try {
        console.log('🔄 Checking referral columns in User table...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('User');

        if (!tableDefinition.referral_code) {
            console.log('➕ Adding referral_code column...');
            await queryInterface.addColumn('User', 'referral_code', {
                type: DataTypes.STRING,
                allowNull: true
            });
        } else {
            console.log('ℹ️ referral_code column already exists');
        }

        if (!tableDefinition.referral_points) {
            console.log('➕ Adding referral_points column...');
            await queryInterface.addColumn('User', 'referral_points', {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0
            });
        } else {
            console.log('ℹ️ referral_points column already exists');
        }

        if (!tableDefinition.referred_by) {
            console.log('➕ Adding referred_by column...');
            await queryInterface.addColumn('User', 'referred_by', {
                type: DataTypes.UUID,
                allowNull: true
            });
        } else {
            console.log('ℹ️ referred_by column already exists');
        }

        console.log('✅ Referral columns setup completed');

    } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && (error.parent?.errno === 1060 || error.parent?.errno === 1069)) {
            console.log('ℹ️ Referral columns already existed. Proceeding.');
            return;
        }
        console.error('❌ Referral migration failed:', error);
        throw error;
    }
}

export async function down() {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.removeColumn('User', 'referred_by');
    await queryInterface.removeColumn('User', 'referral_points');
    await queryInterface.removeColumn('User', 'referral_code');
}

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
