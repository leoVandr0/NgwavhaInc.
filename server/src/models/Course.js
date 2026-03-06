import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';
import slug from 'slug';
import { deleteFile } from '../utils/fileUtils.js';

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    },
    subtitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    estimatedPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'estimated_price'
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    videoPreview: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'video_preview'
    },
    // Preview video metadata for admin review
    previewVideoPath: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'preview_video_path'
    },
    previewVideoDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'preview_video_duration'
    },
    previewStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        field: 'preview_status'
    },
    previewUploadedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'preview_uploaded_at'
    },
    previewUploadedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'preview_uploaded_by'
    },
    previewApprovedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'preview_approved_at'
    },
    previewApprovedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'preview_approved_by'
    },
    previewRejectReason: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'preview_reject_reason'
    },
    level: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'expert', 'all'),
        defaultValue: 'all'
    },
    language: {
        type: DataTypes.STRING,
        defaultValue: 'English'
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived', 'pending', 'rejected'),
        defaultValue: 'pending'
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'published_at'
    },
    totalDuration: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 0,
        field: 'total_duration'
    },
    totalLectures: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_lectures'
    },
    averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        field: 'average_rating'
    },
    ratingsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'ratings_count'
    },
    enrollmentsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'enrollments_count'
    },
    mongoContentId: {
        type: DataTypes.STRING, // Reference to MongoDB document
        allowNull: true,
        field: 'mongo_content_id'
    }
}, {
    hooks: {
        beforeCreate: (course) => {
            if (course.title) {
                course.slug = slug(course.title) + '-' + Math.floor(Math.random() * 1000);
            }
        },
        beforeUpdate: (course) => {
            if (course.changed('title')) {
                course.slug = slug(course.title) + '-' + Math.floor(Math.random() * 1000);
            }
        },
        afterDestroy: (course) => {
            console.log(`🗑️ Cleaning up files for course: ${course.title}`);
            deleteFile(course.thumbnail);
            deleteFile(course.videoPreview);
            deleteFile(course.previewVideoPath);
        }
    }
});

export default Course;
