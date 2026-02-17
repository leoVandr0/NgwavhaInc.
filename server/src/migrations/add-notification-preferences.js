import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    try {
        console.log('🔄 Checking Notification preferences columns in User table...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('User');

        // Add notification_preferences column if it doesn't exist
        if (!tableDefinition.notification_preferences) {
            console.log('➕ Adding notification_preferences column...');
            await queryInterface.addColumn('User', 'notification_preferences', {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: {
                    email: true,
                    whatsapp: false,
                    sms: false,
                    push: true,
                    inApp: true,
                    courseUpdates: true,
                    assignmentReminders: true,
                    newMessages: true,
                    promotionalEmails: false,
                    weeklyDigest: false
                }
            });
        } else {
            console.log('ℹ️ notification_preferences column already exists');
        }

        // Add phone_number column if it doesn't exist
        if (!tableDefinition.phone_number) {
            console.log('➕ Adding phone_number column...');
            await queryInterface.addColumn('User', 'phone_number', {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    is: /^[+]?[\d\s\-\(\)]+$/ // Basic phone validation
                }
            });
        } else {
            console.log('ℹ️ phone_number column already exists');
        }

        // Add whatsapp_number column if it doesn't exist
        if (!tableDefinition.whatsapp_number) {
            console.log('➕ Adding whatsapp_number column...');
            await queryInterface.addColumn('User', 'whatsapp_number', {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    is: /^[+]?[\d\s\-\(\)]+$/ // Basic phone validation
                }
            });
        } else {
            console.log('ℹ️ whatsapp_number column already exists');
        }

        console.log('✅ Notification preferences setup completed');

        // Update existing users with default notification preferences
        console.log('🔄 Updating existing users with null notification preferences...');

        const defaultPreferences = {
            email: true,
            whatsapp: false,
            sms: false,
            push: true,
            inApp: true,
            courseUpdates: true,
            assignmentReminders: true,
            newMessages: true,
            promotionalEmails: false,
            weeklyDigest: false
        };

        await sequelize.query(`
            UPDATE User 
            SET notification_preferences = :defaultPreferences 
            WHERE notification_preferences IS NULL
        `, {
            replacements: { defaultPreferences: JSON.stringify(defaultPreferences) },
            type: sequelize.QueryTypes.UPDATE
        });

        console.log('✅ Existing users updated with default notification preferences');

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
        console.log('🔄 Removing notification preferences columns from User table...');

        const queryInterface = sequelize.getQueryInterface();

        // Remove columns in reverse order
        await queryInterface.removeColumn('User', 'whatsapp_number');
        await queryInterface.removeColumn('User', 'phone_number');
        await queryInterface.removeColumn('User', 'notification_preferences');

        console.log('✅ Notification preferences columns removed successfully');

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
