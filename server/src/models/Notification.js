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
        allowNull: true, // null for broadcast notifications
        references: {
            model: 'User',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('course_update', 'assignment_reminder', 'new_message', 'system_update', 'broadcast'),
        allowNull: false,
        defaultValue: 'system_update'
    },
    notificationType: {
        type: DataTypes.ENUM('private', 'broadcast'),
        allowNull: false,
        defaultValue: 'private'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
    },
    targetAudience: {
        type: DataTypes.ENUM('all', 'students', 'instructors', 'admins'),
        allowNull: true,
        defaultValue: null
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
    acknowledged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
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
