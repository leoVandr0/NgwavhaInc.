import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Initialize Sequelize with Railway env vars
const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;

let sequelize;
if (connectionString) {
    sequelize = new Sequelize(connectionString, {
        dialect: 'mysql',
        logging: console.log,
        dialectOptions: {
            connectTimeout: 60000,
        },
    });
} else {
    sequelize = new Sequelize(
        process.env.MYSQLDATABASE,
        process.env.MYSQLUSER,
        process.env.MYSQLPASSWORD,
        {
            host: process.env.MYSQLHOST,
            port: process.env.MYSQLPORT || 3306,
            dialect: 'mysql',
            logging: console.log,
            dialectOptions: {
                connectTimeout: 60000,
            },
        }
    );
}

async function setupDatabase() {
    try {
        console.log('🔌 Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection established.');

        // Check current tables
        const [existingTables] = await sequelize.query('SHOW TABLES');
        console.log('\n📋 Current tables:', existingTables.map(t => Object.values(t)[0]));

        // Import all models - they will auto-create tables
        console.log('\n📥 Importing models to create tables...');
        
        // Import models (they register themselves with sequelize)
        const User = (await import('../models/User.js')).default;
        const Category = (await import('../models/Category.js')).default;
        const Course = (await import('../models/Course.js')).default;
        const Enrollment = (await import('../models/Enrollment.js')).default;
        const Review = (await import('../models/Review.js')).default;
        const Transaction = (await import('../models/Transaction.js')).default;
        const LiveSession = (await import('../models/LiveSession.js')).default;
        const CartItem = (await import('../models/CartItem.js')).default;
        const WishlistItem = (await import('../models/WishlistItem.js')).default;
        const Assignment = (await import('../models/Assignment.js')).default;
        const Referral = (await import('../models/Referral.js')).default;
        const Notification = (await import('../models/Notification.js')).default;

        console.log('✅ All models imported');

        // Setup associations
        console.log('\n🔗 Setting up associations...');
        
        // User associations
        User.hasMany(Course, { foreignKey: 'instructorId', as: 'instructedCourses', onDelete: 'CASCADE' });
        Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

        User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments', onDelete: 'CASCADE' });
        Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'student' });

        User.hasMany(Review, { foreignKey: 'userId', as: 'reviews', onDelete: 'CASCADE' });
        Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

        User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE' });
        Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

        User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems', onDelete: 'CASCADE' });
        CartItem.belongsTo(User, { foreignKey: 'userId' });

        User.hasMany(WishlistItem, { foreignKey: 'userId', as: 'wishlistItems', onDelete: 'CASCADE' });
        WishlistItem.belongsTo(User, { foreignKey: 'userId' });

        User.hasMany(Assignment, { foreignKey: 'instructorId', as: 'instructedAssignments', onDelete: 'CASCADE' });
        Assignment.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

        User.hasMany(LiveSession, { foreignKey: 'instructorId', as: 'hostedSessions', onDelete: 'CASCADE' });
        LiveSession.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

        User.hasMany(Referral, { foreignKey: 'referrerId', as: 'referralsMade', onDelete: 'CASCADE' });
        Referral.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });

        User.hasMany(Referral, { foreignKey: 'referredId', as: 'referralsReceived', onDelete: 'CASCADE' });
        Referral.belongsTo(User, { foreignKey: 'referredId', as: 'referred' });

        // Course associations
        Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments', onDelete: 'CASCADE' });
        Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

        Course.hasMany(Review, { foreignKey: 'courseId', as: 'reviews', onDelete: 'CASCADE' });
        Review.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

        Course.hasMany(Transaction, { foreignKey: 'courseId', as: 'transactions', onDelete: 'CASCADE' });
        Transaction.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

        Course.hasMany(CartItem, { foreignKey: 'courseId', onDelete: 'CASCADE' });
        CartItem.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

        Course.hasMany(WishlistItem, { foreignKey: 'courseId', onDelete: 'CASCADE' });
        WishlistItem.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

        Course.hasMany(Assignment, { foreignKey: 'courseId', as: 'assignments', onDelete: 'CASCADE' });
        Assignment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

        Course.hasMany(LiveSession, { foreignKey: 'courseId', as: 'liveSessions', onDelete: 'CASCADE' });
        LiveSession.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

        // Category associations
        Category.hasMany(Course, { foreignKey: 'categoryId', as: 'courses' });
        Course.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

        Category.hasMany(Category, { foreignKey: 'parentId', as: 'subcategories' });
        Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parentCategory' });

        console.log('✅ Associations configured');

        // Sync all models - creates tables if they don't exist
        console.log('\n🔄 Creating tables...');
        await sequelize.sync({ force: false, alter: true });
        console.log('✅ Tables created/updated');

        // Show final tables
        const [finalTables] = await sequelize.query('SHOW TABLES');
        console.log('\n📋 Final tables:', finalTables.map(t => Object.values(t)[0]));

        console.log('\n✅ Database setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
