import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const WishlistItem = sequelize.define('WishlistItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'course_id'
    }
}, {
    tableName: 'wishlist_items',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'course_id']
        }
    ]
});

export default WishlistItem;
