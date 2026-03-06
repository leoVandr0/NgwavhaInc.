import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_published'
    },
    isReported: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_reported'
    },
    reportReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'report_reason'
    },
    status: {
        type: DataTypes.ENUM('approved', 'flagged', 'hidden'),
        defaultValue: 'approved'
    }
});

export default Review;
