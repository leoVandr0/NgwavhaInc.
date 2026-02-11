import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    videoUrl: String,
    videoDuration: Number, // in seconds
    videoPublicId: String, // for cloud storage
    type: {
        type: String,
        enum: ['video', 'quiz', 'assignment', 'text', 'live'],
        default: 'video'
    },
    liveSessionId: String, // ID of the LiveSession from MySQL
    content: String, // for text lectures or quiz description
    resources: [{
        title: String,
        url: String,
        type: String // pdf, zip, link
    }],
    isFree: {
        type: Boolean,
        default: false
    },
    position: Number
});

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    position: Number,
    lectures: [lectureSchema]
});

const courseContentSchema = new mongoose.Schema({
    courseId: {
        type: String, // Matches MySQL Course ID
        required: true,
        unique: true,
        index: true
    },
    sections: [sectionSchema],
    totalDuration: Number,
    totalLectures: Number,
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to calculate totals before saving
courseContentSchema.pre('save', function (next) {
    let duration = 0;
    let lectures = 0;

    this.sections.forEach(section => {
        section.lectures.forEach(lecture => {
            lectures++;
            if (lecture.videoDuration) {
                duration += lecture.videoDuration;
            }
        });
    });

    this.totalDuration = duration;
    this.totalLectures = lectures;
    next();
});

const CourseContent = mongoose.model('CourseContent', courseContentSchema);

export default CourseContent;
