const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function verifyAdmin() {
    try {
        console.log('🔍 Verifying admin account...');

        // Connect to MySQL
        const connection = await mysql.createConnection({
            host: process.env.MYSQLHOST || 'localhost',
            port: process.env.MYSQLPORT || 3306,
            user: process.env.MYSQLUSER || 'root',
            password: process.env.MYSQLPASSWORD || '',
            database: process.env.MYSQLDATABASE || 'ngwavha'
        });

        console.log('✅ Connected to MySQL');

        // Find admin user
        const [rows] = await connection.execute(
            'SELECT * FROM User WHERE email = ?',
            ['admin@ngwavha.com']
        );

        if (rows.length === 0) {
            console.log('❌ Admin user not found');
            await connection.end();
            return;
        }

        const admin = rows[0];
        console.log('✅ Admin user found:', {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            is_verified: admin.is_verified,
            is_approved: admin.is_approved,
            hasPassword: !!admin.password,
            passwordLength: admin.password ? admin.password.length : 0
        });

        // Test password verification
        const testPassword = 'admin123';
        const isMatch = await bcrypt.compare(testPassword, admin.password);
        console.log('🔐 Password verification test:', {
            testPassword,
            isMatch,
            passwordHash: admin.password.substring(0, 20) + '...'
        });

        if (!isMatch) {
            console.log('❌ Password mismatch! Recreating admin with correct password...');

            // Hash the correct password
            const hashedPassword = await bcrypt.hash('admin123', 10);

            // Update admin password
            await connection.execute(
                'UPDATE User SET password = ?, is_verified = 1, is_approved = 1 WHERE email = ?',
                [hashedPassword, 'admin@ngwavha.com']
            );

            console.log('✅ Admin password updated successfully');
        } else {
            console.log('✅ Admin password is correct');
        }

        await connection.end();

        console.log('🎉 Admin verification complete!');
        console.log('📧 Login credentials:');
        console.log('   Email: admin@ngwavha.com');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('❌ Error verifying admin:', error);
        process.exit(1);
    }
}

verifyAdmin();
