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
        defaultValue: [],
        field: 'completed_lectures'
    },
    lastAccessedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'last_accessed_at'
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_completed'
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completed_at'
    },
    certificateUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'certificate_url'
    },
    pricePaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'price_paid'
    },
    paymentId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'payment_id'
    },
    isArchived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_archived'
    }
});

export default Enrollment;
