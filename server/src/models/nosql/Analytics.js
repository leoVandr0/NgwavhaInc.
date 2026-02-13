import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    metric: {
        type: String,
        required: true,
        index: true // e.g., 'daily_active_users', 'course_enrollments', 'revenue'
    },
    value: {
        type: Number,
        required: true
    },
    dimension: {
        type: String, // e.g., 'course_id', 'user_id', 'global'
        default: 'global'
    },
    dimensionId: String,
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'total'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
});

// Compound index for efficient metric lookups
analyticsSchema.index({ metric: 1, period: 1, date: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
