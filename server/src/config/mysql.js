import { Sequelize } from "sequelize";

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
  try {
    // Test connection with retry logic
    await sequelize.authenticate();
    console.log("🗄️ MySQL connection established successfully.");

    // Test the connection with a simple query
    await sequelize.query('SELECT 1');
    console.log("🔍 MySQL connection test passed.");

    await sequelize.sync({ force: false });
    console.log("📦 MySQL models synchronized.");
    return sequelize;
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error.message);
    return null;
  }
};

export default sequelize;
