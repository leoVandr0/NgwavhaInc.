import sequelize from './src/config/mysql.js';
import User from './src/models/User.js';

async function check() {
    try {
        console.log('🔍 Testing connection...');
        await sequelize.authenticate();
        console.log('✅ Connected.');

        console.log('🔍 Describing User table...');
        const cols = await sequelize.getQueryInterface().describeTable('User');
        console.log('Columns:', JSON.stringify(cols, null, 2));

        console.log('🔍 Checking for potential mismatches...');
        const underscored = sequelize.options.define.underscored;
        console.log('Underscored active:', underscored);

        // Check a specific field
        if (cols.notification_preferences) {
            console.log('✅ Found notification_preferences (snake_case)');
        } else if (cols.notificationPreferences) {
            console.log('⚠️ Found notificationPreferences (camelCase)');
        } else {
            console.log('❌ notificationPreferences column NOT FOUND');
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

check();
