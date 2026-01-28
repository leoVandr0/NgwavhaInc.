import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import the sequelize instance from your config
import sequelize from '../config/mysql.js';

// Import models to ensure they're registered with Sequelize
import '../models/index.js';

async function runMigrations() {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established.');

        // Sync all models
        console.log('🔄 Syncing database...');
        await sequelize.sync({ force: true });
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