// Railway Admin Setup Script
// Run this script in Railway console to create admin account

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function createRailwayAdmin() {
    try {
        console.log('🔧 Creating Railway admin account...');
        
        // Connect to Railway database
        const connection = await mysql.createConnection({
            host: process.env.MYSQLHOST,
            port: process.env.MYSQLPORT || 3306,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE
        });

        console.log('✅ Connected to Railway MySQL database');

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        console.log('✅ Password hashed');

        // Generate UUID
        const adminId = uuidv4();

        // Insert or update admin user
        const insertQuery = `
            INSERT INTO users (id, name, email, password, role, is_verified, is_approved, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            password = VALUES(password), 
            is_verified = VALUES(is_verified),
            is_approved = VALUES(is_approved)
        `;

        await connection.execute(insertQuery, [
            adminId,
            'Admin User',
            'admin@ngwavha.com',
            hashedPassword,
            'admin',
            1, // is_verified = true
            1, // is_approved = true
            new Date(),
            new Date()
        ]);

        console.log('✅ Railway admin user created/updated');

        // Verify the admin was created
        const [rows] = await connection.execute(
            'SELECT id, name, email, role, is_verified, is_approved FROM users WHERE email = ?',
            ['admin@ngwavha.com']
        );

        if (rows.length > 0) {
            console.log('✅ Railway admin verified:', rows[0]);
        }

        await connection.end();

        console.log('🎉 Railway admin setup complete!');
        console.log('📧 Login with:');
        console.log('   Email: admin@ngwavha.com');
        console.log('   Password: admin123');
        
        return {
            success: true,
            message: 'Railway admin created successfully',
            credentials: {
                email: 'admin@ngwavha.com',
                password: 'admin123'
            }
        };

    } catch (error) {
        console.error('❌ Error creating Railway admin:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export for use in Railway console
module.exports = { createRailwayAdmin };

// Auto-run if called directly
if (require.main === module) {
    createRailwayAdmin();
}
