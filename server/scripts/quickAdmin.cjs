// scripts/quickAdmin.cjs - CommonJS version
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    console.log('🔄 Loading modules...');
    
    // Dynamic import with correct export handling
    const mysqlModule = await import('./src/config/mysql.js');
    const userModule = await import('./src/models/User.js');
    
    const sequelize = mysqlModule.default; // Get default export
    const User = userModule.default;       // Get default export
    
    console.log('🔄 Connecting to database...');
    await sequelize.sync();
    
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ngwavha.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isApproved: true
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@ngwavha.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    console.error('🔍 Full error:', error);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 MySQL Connection Issue Detected!');
      console.log('Please check your MySQL environment variables:');
      console.log('- MYSQLHOST');
      console.log('- MYSQLUSER');
      console.log('- MYSQLPASSWORD');
      console.log('- MYSQLDATABASE');
      console.log('\nOr use the manual SQL option below.');
    }
    
    process.exit(1);
  }
};

createAdmin();
