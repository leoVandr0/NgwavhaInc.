const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
    try {
        // Check environment variables
        console.log('🔍 Checking environment variables...');
        console.log('MYSQLHOST:', process.env.MYSQLHOST);
        console.log('MYSQLUSER:', process.env.MYSQLUSER);
        console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '***' : 'NOT SET');
        console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);

        // Connect to MySQL with fallback values
        const connection = await mysql.createConnection({
            host: process.env.MYSQLHOST || 'localhost',
            port: process.env.MYSQLPORT || 3306,
            user: process.env.MYSQLUSER || 'root',
            password: process.env.MYSQLPASSWORD || '',
            database: process.env.MYSQLDATABASE || 'ngwavha'
        });

        console.log('✅ Connected to MySQL');

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        console.log('✅ Password hashed');

        // Generate UUID
        const adminId = require('uuid').v4();

        // Insert admin user
        const insertQuery = `
            INSERT INTO users (id, name, email, password, role, is_verified, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            password = VALUES(password), 
            is_verified = VALUES(is_verified)
        `;

        await connection.execute(insertQuery, [
            adminId,
            'Admin User',
            'admin@ngwavha.com',
            hashedPassword,
            'admin',
            1,
            new Date(),
            new Date()
        ]);

        console.log('✅ Admin user created/updated');

        // Verify the admin was created
        const [rows] = await connection.execute(
            'SELECT id, name, email, role, is_verified FROM users WHERE email = ?',
            ['admin@ngwavha.com']
        );

        if (rows.length > 0) {
            console.log('✅ Admin verified:', rows[0]);
        }

        await connection.end();

        console.log('🎉 Admin creation complete!');
        console.log('📧 Login with:');
        console.log('   Email: admin@ngwavha.com');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
