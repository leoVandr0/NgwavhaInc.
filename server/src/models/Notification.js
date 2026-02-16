import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('course_update', 'assignment_reminder', 'new_message', 'system_update'),
        allowNull: false,
        defaultValue: 'system_update'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data: {
        type: DataTypes.JSON,
        allowNull: true
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'User',
            key: 'id'
        }
    }
}, {
    tableName: 'Notifications',
    timestamps: true,
    underscored: true
});

// Define associations
Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
    });
    
    Notification.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
    });
};

export default Notification;
