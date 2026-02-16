const { Sequelize, DataTypes } = require('sequelize');

// Create sequelize instance manually
const sequelize = new Sequelize(
  'ngwavha',
  'ngwavha_user', 
  'v_4_ngwavh4',
  {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false
  }
);

async function runMigration() {
  try {
    console.log('🔄 Connecting to MySQL...');
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');
    
    // Check if columns exist
    const [results] = await sequelize.query('DESCRIBE User');
    const hasNotificationPrefs = results.some(row => row.Field === 'notification_preferences');
    const hasPhoneNumber = results.some(row => row.Field === 'phone_number');
    const hasWhatsappNumber = results.some(row => row.Field === 'whatsapp_number');
    
    console.log('📊 Column status:');
    console.log(`- notification_preferences: ${hasNotificationPrefs ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- phone_number: ${hasPhoneNumber ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- whatsapp_number: ${hasWhatsappNumber ? '✅ EXISTS' : '❌ MISSING'}`);
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Add notification_preferences column
    if (!hasNotificationPrefs) {
      console.log('🔄 Adding notification_preferences column...');
      await queryInterface.addColumn('User', 'notification_preferences', {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
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
        })
      });
      console.log('✅ notification_preferences column added');
    }
    
    // Add phone_number column
    if (!hasPhoneNumber) {
      console.log('🔄 Adding phone_number column...');
      await queryInterface.addColumn('User', 'phone_number', {
        type: DataTypes.STRING,
        allowNull: true
      });
      console.log('✅ phone_number column added');
    }
    
    // Add whatsapp_number column
    if (!hasWhatsappNumber) {
      console.log('🔄 Adding whatsapp_number column...');
      await queryInterface.addColumn('User', 'whatsapp_number', {
        type: DataTypes.STRING,
        allowNull: true
      });
      console.log('✅ whatsapp_number column added');
    }
    
    // Update existing users with default preferences
    if (!hasNotificationPrefs) {
      console.log('🔄 Updating existing users with default preferences...');
      const defaultPreferences = JSON.stringify({
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
      });
      
      await sequelize.query(`
        UPDATE User 
        SET notification_preferences = :defaultPreferences 
        WHERE notification_preferences IS NULL
      `, {
        replacements: { defaultPreferences },
        type: Sequelize.QueryTypes.UPDATE
      });
      console.log('✅ Existing users updated with default preferences');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ Columns already exist, skipping...');
    } else {
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}

runMigration().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
