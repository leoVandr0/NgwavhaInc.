import sequelize from './src/config/mysql.js';

async function checkColumns() {
    try {
        console.log('🔍 Checking User table columns...');
        
        const [results] = await sequelize.query('DESCRIBE User');
        
        console.log('User table columns:');
        results.forEach(row => {
            console.log(`- ${row.Field}: ${row.Type}`);
        });
        
        // Check for our new columns
        const hasNotificationPrefs = results.some(row => row.Field === 'notification_preferences');
        const hasPhoneNumber = results.some(row => row.Field === 'phone_number');
        const hasWhatsappNumber = results.some(row => row.Field === 'whatsapp_number');
        
        console.log('\n📊 New columns status:');
        console.log(`- notification_preferences: ${hasNotificationPrefs ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- phone_number: ${hasPhoneNumber ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- whatsapp_number: ${hasWhatsappNumber ? '✅ EXISTS' : '❌ MISSING'}`);
        
        if (!hasNotificationPrefs || !hasPhoneNumber || !hasWhatsappNumber) {
            console.log('\n🔧 Running migration...');
            await import('./src/migrations/add-notification-preferences.js');
            console.log('✅ Migration completed');
        } else {
            console.log('\n✅ All notification columns already exist');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkColumns();
