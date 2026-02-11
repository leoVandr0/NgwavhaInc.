import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'ngwavha',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: console.log
    }
);

async function cleanupIndexes() {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL.');

        const [results] = await sequelize.query('SHOW INDEX FROM User');
        console.log(`Found ${results.length} indexes on User table.`);

        const duplicateIndexes = results.filter(idx =>
            (idx.Column_name === 'email' || idx.Column_name === 'google_id') &&
            idx.Key_name !== 'PRIMARY' &&
            idx.Key_name !== 'User_email_unique' && // Sample name sequelize might use
            idx.Key_name !== 'User_google_id_unique'
        );

        console.log(`Found ${duplicateIndexes.length} potentially duplicate indexes.`);

        for (const idx of duplicateIndexes) {
            console.log(`Dropping index: ${idx.Key_name}`);
            try {
                await sequelize.query(`ALTER TABLE User DROP INDEX \`${idx.Key_name}\``);
            } catch (e) {
                console.error(`Failed to drop ${idx.Key_name}: ${e.message}`);
            }
        }

        console.log('Cleanup complete.');
    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await sequelize.close();
    }
}

cleanupIndexes();
