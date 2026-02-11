import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const LiveSession = sequelize.define('LiveSession', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    instructorId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    lectureId: {
        type: DataTypes.STRING, // MongoDB ID of the lecture
        allowNull: true
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 60
    },
    meetingId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'live', 'ended'),
        defaultValue: 'scheduled'
    }
}, {
    timestamps: true
});

export default LiveSession;
