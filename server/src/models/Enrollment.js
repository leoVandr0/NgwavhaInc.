import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const Enrollment = sequelize.define('Enrollment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    progress: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    completedLectures: {
        type: DataTypes.JSON, // Array of lecture IDs
        defaultValue: []
    },
    lastAccessedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    certificateUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pricePaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentId: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

export default Enrollment;
