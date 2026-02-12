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
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  }
);

export const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log("🗄️ MySQL connection established successfully.");
    await sequelize.sync();
    console.log("📦 MySQL models synchronized.");
    return sequelize;
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error.message);
    return null;
  }
};

export default sequelize;
