import express from 'express';
import sequelize from '../config/mysql.js';
import { User, Category, Course, Enrollment, Review, Transaction, LiveSession, CartItem, WishlistItem, Assignment, Referral, Notification } from '../models/index.js';

const router = express.Router();

// One-time database setup endpoint
router.post('/database', async (req, res) => {
    try {
        // Check if tables already exist
        const [existingTables] = await sequelize.query('SHOW TABLES');
        const tableNames = existingTables.map(t => Object.values(t)[0]);
        
        console.log('📋 Current tables:', tableNames);
        
        // Check if we have core tables
        const hasUsers = tableNames.includes('Users');
        const hasCourses = tableNames.includes('Courses');
        const hasCategories = tableNames.includes('Categories');
        
        if (hasUsers && hasCourses && hasCategories) {
            return res.json({
                message: 'Database tables already exist',
                currentTables: tableNames
            });
        }
        
        // Force sync to create all tables
        console.log('🔄 Creating database tables...');
        await sequelize.sync({ force: true });
        
        // Show final tables
        const [finalTables] = await sequelize.query('SHOW TABLES');
        const finalTableNames = finalTables.map(t => Object.values(t)[0]);
        
        console.log('✅ Database setup complete!');
        console.log('📋 Final tables:', finalTableNames);
        
        res.json({
            success: true,
            message: 'Database tables created successfully',
            tablesCreated: finalTableNames,
            count: finalTableNames.length
        });
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        res.status(500).json({
            error: 'Database setup failed',
            message: error.message
        });
    }
});

export default router;
