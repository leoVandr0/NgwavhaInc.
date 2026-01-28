import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Initialize Sequelize
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: console.log
    }
);

// Import models
import User from '../models/User.js';
import Course from '../models/Course.js';
import Category from '../models/Category.js';
import Enrollment from '../models/Enrollment.js';
import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';

// Initialize models with sequelize
const models = {
    User: User(sequelize),
    Course: Course(sequelize),
    Category: Category(sequelize),
    Enrollment: Enrollment(sequelize),
    Review: Review(sequelize),
    Transaction: Transaction(sequelize)
};

// Set up associations
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

async function runMigrations() {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established.');

        // Sync all models
        console.log('🔄 Syncing database...');
        await sequelize.sync({ force: true });  // Using force: true to drop and recreate tables
        console.log('✅ Database synchronized successfully.');

        // Show tables
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log('\n📋 Database tables:');
        console.table(tables.map(t => ({ 'Table Name': Object.values(t)[0] })));

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();