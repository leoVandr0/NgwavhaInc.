import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection configuration
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'ngwavha',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    }
);

export const connectMySQL = async () => {
    try {
        await sequelize.authenticate();
        console.log('🗄️  MySQL connection established successfully.');

        // Sync all models (to ensure new columns like skills/certifications are added)
        await sequelize.sync({ alter: true });
        console.log('📦 MySQL models synchronized.');

        return sequelize;
    } catch (error) {
        console.error('❌ Unable to connect to MySQL:', error);
        throw error;
    }
};

export default sequelize;
