import User from './src/models/User.js';
import sequelize from './src/config/mysql.js';

const targetEmail = process.argv[2];

const promoteToAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        if (targetEmail) {
            const user = await User.findOne({ where: { email: targetEmail } });
            if (user) {
                user.role = 'admin';
                await user.save();
                console.log(`✅ Successfully promoted ${user.name} (${user.email}) to ADMIN.`);
            } else {
                console.log(`❌ User with email '${targetEmail}' not found.`);
            }
        } else {
            console.log('No email provided. Listing all users:');
        }

        const users = await User.findAll({ attributes: ['name', 'email', 'role'] });
        console.log('\n--- Current Users ---');
        users.forEach(u => console.log(`[${u.role.toUpperCase()}] ${u.name} <${u.email}>`));
        console.log('---------------------');

        if (!targetEmail) {
            console.log('\nUsage: node make-admin.js <email_to_promote>');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

promoteToAdmin();
