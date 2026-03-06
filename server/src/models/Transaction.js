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
        allowNull: true,
        field: 'stripe_payment_intent_id'
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
        defaultValue: 'card',
        field: 'payment_method'
    },
    receiptUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'receipt_url'
    }
});

export default Transaction;
