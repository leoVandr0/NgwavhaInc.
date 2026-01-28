import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

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

        console.log('🔄 Loading models...');
        const models = await import('../models/index.js');
        
        // Set up associations
        console.log('🔗 Setting up associations...');
        Object.keys(models).forEach(modelName => {
            if (models[modelName]?.associate) {
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