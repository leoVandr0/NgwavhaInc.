import express from 'express';
import sequelize from '../config/mysql.js';

const router = express.Router();

// Test database connection
router.get('/test', async (req, res) => {
    try {
        // Test basic connection
        await sequelize.authenticate();
        
        // Show current tables
        const [tables] = await sequelize.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        
        // Test database info
        const [dbInfo] = await sequelize.query('SELECT DATABASE() as db_name');
        const [version] = await sequelize.query('SELECT VERSION() as version');
        
        res.json({
            success: true,
            message: 'Database connection successful',
            database: dbInfo[0].db_name,
            version: version[0].version,
            currentTables: tableNames,
            tableCount: tableNames.length,
            connectionInfo: {
                host: process.env.MYSQLHOST || 'DATABASE_URL',
                database: process.env.MYSQLDATABASE || 'from DATABASE_URL',
                user: process.env.MYSQLUSER || 'from DATABASE_URL'
            }
        });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.stack
        });
    }
});

// Force create all tables (emergency fix)
router.post('/force-create', async (req, res) => {
    try {
        console.log('🚨 FORCE CREATE: Starting emergency table creation...');
        
        // Import all models
        await import('../models/index.js');
        
        // Force sync - this will drop and recreate all tables
        console.log('🔄 Force syncing database...');
        await sequelize.sync({ force: true });
        
        // Show final tables
        const [tables] = await sequelize.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        
        console.log('✅ Force sync complete! Tables:', tableNames);
        
        res.json({
            success: true,
            message: 'Emergency table creation completed',
            tablesCreated: tableNames,
            count: tableNames.length,
            warning: 'All existing data was deleted'
        });
        
    } catch (error) {
        console.error('❌ Force create failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.stack
        });
    }
});

export default router;
