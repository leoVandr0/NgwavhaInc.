import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Environment Debug ===');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

// Test different dotenv loading approaches
console.log('\n=== Before dotenv config ===');
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD);
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);

// Load dotenv like server.js does
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('\n=== After dotenv config ===');
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD);
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);

// Test MySQL connection like the config does
import { Sequelize } from 'sequelize';

const dbConfig = {
  dialect: "mysql",
  logging: console.log,
};

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    ...dbConfig,
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
  }
);

console.log('\n=== Testing MySQL connection ===');
try {
  await sequelize.authenticate();
  console.log('✅ MySQL connection successful');
} catch (error) {
  console.error('❌ MySQL connection failed:', error.message);
}
