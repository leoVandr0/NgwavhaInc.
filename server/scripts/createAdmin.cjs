// scripts/createAdmin.cjs - CommonJS version with dynamic imports
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    console.log('🔄 Loading modules...');
    
    // Dynamic import for ES modules
    const { sequelize } = await import('../src/config/mysql.js');
    const { default: User } = await import('../src/models/User.js');
    
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
    process.exit(1);
  }
};

createAdmin();
