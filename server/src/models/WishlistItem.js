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
        allowNull: false
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    tableName: 'wishlist_items',
    indexes: [
        {
            unique: true,
            fields: ['userId', 'courseId']
        }
    ]
});

export default WishlistItem;
