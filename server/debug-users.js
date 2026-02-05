import User from './src/models/User.js';
import sequelize from './src/config/mysql.js';
import fs from 'fs';

const listUsers = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected to database.');

        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role']
        });

        const output = `Found ${users.length} users:\n` + users.map(u => `- [${u.role}] ${u.name} (${u.email})`).join('\n');

        fs.writeFileSync('users_dump.txt', output);
        console.log('Written to users_dump.txt');

    } catch (error) {
        console.error('Error:', error);
        fs.writeFileSync('users_dump.txt', 'Error: ' + error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

listUsers();

