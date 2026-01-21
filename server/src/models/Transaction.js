import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    stripePaymentIntentId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'usd'
    },
    status: {
        type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'card'
    },
    receiptUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

export default Transaction;
