import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
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
  }
);

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
