import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'user_id'
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'course_id'
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
        type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'refunded', 'cancelled'),
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
    },
    paynowReference: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'paynow_reference'
    },
    paynowPollUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'paynow_poll_url'
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'paid_at'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    }
});

export default Transaction;
