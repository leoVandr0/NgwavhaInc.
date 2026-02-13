import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: ['info', 'warn', 'error', 'debug'],
        default: 'info'
    },
    message: {
        type: String,
        required: true
    },
    context: {
        type: String, // Component or module name
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries and automatic deletion after 30 days
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Log = mongoose.model('Log', logSchema);

export default Log;
