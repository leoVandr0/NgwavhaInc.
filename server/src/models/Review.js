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
        defaultValue: true
    },
    isReported: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    reportReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('approved', 'flagged', 'hidden'),
        defaultValue: 'approved'
    }
});

export default Review;
