import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const Referral = sequelize.define('Referral', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    referrerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'referrer_id',
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    referredId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'referred_id',
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    referralCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'referral_code'
    },
    pointsAwarded: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
        field: 'points_awarded'
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'completed',
        allowNull: false
    }
}, {
    tableName: 'Referrals',
    timestamps: true,
    underscored: true
});

export default Referral;
