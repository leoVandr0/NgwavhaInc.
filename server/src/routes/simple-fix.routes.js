import express from 'express';
import sequelize from '../config/mysql.js';

const router = express.Router();

// Simple database test without models
router.get('/simple-test', async (req, res) => {
    try {
        // Test basic connection
        await sequelize.authenticate();
        
        // Show current tables
        const [tables] = await sequelize.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        
        res.json({
            success: true,
            message: 'Database connection successful',
            currentTables: tableNames,
            tableCount: tableNames.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create Users table only (for login to work)
router.post('/create-users', async (req, res) => {
    try {
        console.log('🚨 Creating Users table only...');
        
        // Create Users table directly
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255),
                googleId VARCHAR(255) UNIQUE,
                isGoogleUser BOOLEAN DEFAULT FALSE,
                role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
                avatar VARCHAR(255) DEFAULT 'default-avatar.png',
                bio TEXT,
                headline VARCHAR(255),
                website VARCHAR(255),
                twitter VARCHAR(255),
                linkedin VARCHAR(255),
                youtube VARCHAR(255),
                isActive BOOLEAN DEFAULT TRUE,
                emailVerified BOOLEAN DEFAULT FALSE,
                lastLogin DATETIME,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Users table created');
        
        // Verify table exists
        const [tables] = await sequelize.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        
        res.json({
            success: true,
            message: 'Users table created successfully',
            currentTables: tableNames,
            hasUsersTable: tableNames.includes('Users')
        });
        
    } catch (error) {
        console.error('❌ Users table creation failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.stack
        });
    }
});

export default router;
