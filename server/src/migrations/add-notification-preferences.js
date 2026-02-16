import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

export async function up() {
    try {
        console.log('🔄 Adding notification preferences columns to User table...');
        
        // Get the current User model definition
        const queryInterface = sequelize.getQueryInterface();
        
        // Add notification_preferences column
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
        
        // Add phone_number column
        await queryInterface.addColumn('User', 'phone_number', {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                is: /^[+]?[\d\s\-\(\)]+$/ // Basic phone validation
            }
        });
        
        // Add whatsapp_number column
        await queryInterface.addColumn('User', 'whatsapp_number', {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                is: /^[+]?[\d\s\-\(\)]+$/ // Basic phone validation
            }
        });
        
        console.log('✅ Notification preferences columns added successfully');
        
        // Update existing users with default notification preferences
        console.log('🔄 Updating existing users with default notification preferences...');
        
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
