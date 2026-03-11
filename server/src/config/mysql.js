import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Only load .env file in development - Railway sets env vars directly
if (process.env.NODE_ENV !== 'production') {
    const envPath = path.join(__dirname, '..', '..', '.env');
    console.log('DEBUG: Loading .env from:', envPath);
    dotenv.config({ path: envPath });
}

const dbConfig = {
  dialect: "mysql",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 1000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  retry: {
    max: 3,
  },
  dialectOptions: {
    connectTimeout: 60000,
  },
};

let sequelize;
const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (connectionString) {
  console.log("Using Database URL for MySQL connection");
  sequelize = new Sequelize(connectionString, dbConfig);
} else {
  console.log("Using individual environment variables for MySQL connection");
  console.log("DEBUG - Environment variables:");
  console.log("MYSQLDATABASE:", process.env.MYSQLDATABASE);
  console.log("MYSQLUSER:", process.env.MYSQLUSER);
  console.log("MYSQLPASSWORD:", process.env.MYSQLPASSWORD ? "***" : "undefined");
  console.log("MYSQLHOST:", process.env.MYSQLHOST);
  console.log("MYSQLPORT:", process.env.MYSQLPORT);
  
  sequelize = new Sequelize(
    process.env.MYSQLDATABASE,
    process.env.MYSQLUSER,
    process.env.MYSQLPASSWORD,
    {
      ...dbConfig,
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
    }
  );
}

export const connectMySQL = async () => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Test connection
      await sequelize.authenticate();
      console.log("🗄️ MySQL connection established successfully.");

      // Test the connection with a simple query
      await sequelize.query('SELECT 1');
      console.log("🔍 MySQL connection test passed.");

      // Import models to register them with sequelize before syncing
      console.log("📥 Loading models...");
      await import('../models/index.js');
      
      // Sync database - use force: true on first run to create tables, alter for updates
      console.log("🔄 Syncing database schema...");
      try {
        // First try alter: true (safe for existing data)
        await sequelize.sync({ alter: true, logging: false });
      } catch (alterError) {
        // If alter fails (e.g., missing tables), try force: true to create all tables
        console.log("⚠️ Alter sync failed, trying force sync for initial setup...");
        await sequelize.sync({ force: true, logging: false });
        console.log("✅ Tables created with force sync (fresh database)");
      }
      console.log("📦 MySQL models synchronized.");
      return sequelize;
    } catch (error) {
      console.error(`❌ MySQL connection attempt ${attempt}/${maxRetries} failed:`, error.message);

      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error("❌ Unable to connect to MySQL after multiple attempts.");
        return null;
      }
    }
  }
};

export default sequelize;
