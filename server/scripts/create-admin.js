const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ngwavha',
    waitForConnections: true,
    connectionLimit: 10
});

async function createAdminUser() {
    try {
        console.log('Creating admin user...');
        
        // Hash the password
        const plainPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        // Insert admin user
        const [result] = await db.execute(`
            INSERT INTO Users (
                id, 
                name, 
                email, 
                password, 
                role, 
                isVerified, 
                createdAt, 
                updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            uuidv4(), // Generate UUID
            'Admin User', // Display name
            'admin@ngwavha.com', // Email
            hashedPassword, // Hashed password
            'admin', // Role
            1, // Verified
            new Date(), // Created at
            new Date()  // Updated at
        ]);
        
        console.log('✅ Admin user created successfully!');
        console.log('📧 Login Details:');
        console.log('   Email: admin@ngwavha.com');
        console.log('   Password: admin123');
        console.log('   Admin Panel: http://localhost:3000/admin');
        console.log('');
        console.log('⚠️  IMPORTANT: Change the password after first login!');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    } finally {
        await db.end();
    }
}

// Check if admin user already exists
async function checkAdminExists() {
    try {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM Users WHERE email = ? AND role = ?',
            ['admin@ngwavha.com', 'admin']
        );
        
        return rows[0].count > 0;
    } catch (error) {
        console.error('Error checking admin user:', error.message);
        return false;
    }
}

async function main() {
    console.log('🔧 Ngwavha Admin User Setup Script');
    console.log('=====================================');
    
    // Check if admin already exists
    const adminExists = await checkAdminExists();
    
    if (adminExists) {
        console.log('ℹ️  Admin user already exists!');
        console.log('   Email: admin@ngwavha.com');
        console.log('   Admin Panel: http://localhost:3000/admin');
        console.log('');
        console.log('💡 If you forgot the password, reset it in the database or create a new admin user.');
    } else {
        await createAdminUser();
    }
}

main();
