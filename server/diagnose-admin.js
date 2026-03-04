import sequelize from './src/config/mysql.js';
import User from './src/models/User.js';

async function diagnose() {
    try {
        console.log('🔍 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected.');

        console.log('🔍 Searching for admin users...');
        const admins = await User.findAll({ where: { role: 'admin' } });

        console.log(`Found ${admins.length} admin(s):`);
        admins.forEach(admin => {
            console.log(`- ID: ${admin.id}`);
            console.log(`  Name: ${admin.name}`);
            console.log(`  Email: ${admin.email}`);
            console.log(`  IsVerified: ${admin.isVerified}`);
            console.log(`  Has Password: ${!!admin.password}`);
            console.log('-------------------');
        });

        if (admins.length === 0) {
            console.log('❌ NO ADMIN USERS FOUND!');
        }

    } catch (error) {
        console.error('❌ Error during diagnosis:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

diagnose();
