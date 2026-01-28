const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

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

async function runMigrations() {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established.');

        // Import models
        console.log('🔄 Loading models...');
        const models = require('../models');
        
        // Set up associations
        console.log('🔗 Setting up associations...');
        Object.keys(models).forEach(modelName => {
            if (models[modelName].associate) {
                models[modelName].associate(models);
            }
        });

        // Sync all models
        console.log('🔄 Syncing database...');
        await sequelize.sync({ alter: true });
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