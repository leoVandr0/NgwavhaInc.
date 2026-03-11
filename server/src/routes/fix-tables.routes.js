import express from 'express';
import sequelize from '../config/mysql.js';

const router = express.Router();

// Create tables in correct order to handle foreign key constraints
router.post('/create-tables', async (req, res) => {
    try {
        console.log('🚨 Creating tables in correct order...');
        
        // Step 1: Create tables without foreign keys first
        console.log('📋 Step 1: Creating base tables...');
        
        const User = (await import('../models/User.js')).default;
        const Category = (await import('../models/Category.js')).default;
        const Notification = (await import('../models/Notification.js')).default;
        
        await User.sync({ force: true });
        await Category.sync({ force: true });
        await Notification.sync({ force: true });
        
        console.log('✅ Base tables created');
        
        // Step 2: Create tables with single foreign keys
        console.log('📋 Step 2: Creating single-reference tables...');
        
        const Course = (await import('../models/Course.js')).default;
        const LiveSession = (await import('../models/LiveSession.js')).default;
        const Assignment = (await import('../models/Assignment.js')).default;
        
        await Course.sync({ force: true });
        await LiveSession.sync({ force: true });
        await Assignment.sync({ force: true });
        
        console.log('✅ Single-reference tables created');
        
        // Step 3: Create tables with multiple foreign keys
        console.log('📋 Step 3: Creating multi-reference tables...');
        
        const Enrollment = (await import('../models/Enrollment.js')).default;
        const Review = (await import('../models/Review.js')).default;
        const Transaction = (await import('../models/Transaction.js')).default;
        const CartItem = (await import('../models/CartItem.js')).default;
        const WishlistItem = (await import('../models/WishlistItem.js')).default;
        const Referral = (await import('../models/Referral.js')).default;
        
        await Enrollment.sync({ force: true });
        await Review.sync({ force: true });
        await Transaction.sync({ force: true });
        await CartItem.sync({ force: true });
        await WishlistItem.sync({ force: true });
        await Referral.sync({ force: true });
        
        console.log('✅ Multi-reference tables created');
        
        // Verify all tables exist
        const [tables] = await sequelize.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        
        console.log('✅ All tables created successfully!');
        console.log('📋 Final tables:', tableNames);
        
        res.json({
            success: true,
            message: 'Tables created in correct order',
            tablesCreated: tableNames,
            count: tableNames.length
        });
        
    } catch (error) {
        console.error('❌ Table creation failed:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.stack
        });
    }
});

export default router;
