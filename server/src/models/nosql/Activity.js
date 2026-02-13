import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    userId: {
        type: String, // Matches MySQL User ID
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        index: true // e.g., 'login', 'course_view', 'lesson_complete'
    },
    resourceType: {
        type: String, // e.g., 'course', 'user', 'session'
        required: true
    },
    resourceId: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for fetching user activity chronologically
activitySchema.index({ userId: 1, timestamp: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
