import User from './src/models/User.js';
import sequelize from './src/config/mysql.js';
import bcrypt from 'bcryptjs';

const createAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        const email = 'admin@ngwavha.com';
        const password = 'AdminPass123!';

        // Check if exists
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            console.log('User exists, removing...');
            await existing.destroy();
        }

        console.log('Creating new admin user...');
        // We need to valid password hashing normally happens in hooks, 
        // but let's trust the model hooks to handle it since we use User.create

        const user = await User.create({
            name: 'System Admin',
            email: email,
            password: password,
            role: 'admin',
            isVerified: true
        });

        // Double check status
        if (user.role !== 'admin') {
            console.log('Role was not set correctly, forcing update...');
            user.role = 'admin';
            await user.save();
        }

        console.log('\n=============================================');
        console.log('✅ Admin User Created Successfully');
        console.log('📧 Email:    ' + email);
        console.log('🔑 Password: ' + password);
        console.log('=============================================');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

createAdmin();
