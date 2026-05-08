import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    try {
        console.log('🔄 Adding instructor workflow fields to Course table...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('Course');

        if (!tableDefinition.learning_objectives) {
            await queryInterface.addColumn('Course', 'learning_objectives', {
                type: DataTypes.JSON,
                allowNull: true
            });
            console.log('➕ Added learning_objectives');
        }

        if (!tableDefinition.requirements) {
            await queryInterface.addColumn('Course', 'requirements', {
                type: DataTypes.JSON,
                allowNull: true
            });
            console.log('➕ Added requirements');
        }

        if (!tableDefinition.target_audience) {
            await queryInterface.addColumn('Course', 'target_audience', {
                type: DataTypes.JSON,
                allowNull: true
            });
            console.log('➕ Added target_audience');
        }

        if (!tableDefinition.welcome_message) {
            await queryInterface.addColumn('Course', 'welcome_message', {
                type: DataTypes.TEXT,
                allowNull: true
            });
            console.log('➕ Added welcome_message');
        }

        if (!tableDefinition.congrats_message) {
            await queryInterface.addColumn('Course', 'congrats_message', {
                type: DataTypes.TEXT,
                allowNull: true
            });
            console.log('➕ Added congrats_message');
        }

        console.log('✅ Instructor workflow fields migration complete');
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && error.parent?.errno === 1060) {
            console.log('ℹ️ Some columns already existed. Proceeding.');
            return;
        }
        console.error('❌ Instructor workflow fields migration failed:', error);
        throw error;
    }
}

export async function down() {
    const queryInterface = sequelize.getQueryInterface();
    for (const col of ['learning_objectives', 'requirements', 'target_audience', 'welcome_message', 'congrats_message']) {
        await queryInterface.removeColumn('Course', col);
    }
}
