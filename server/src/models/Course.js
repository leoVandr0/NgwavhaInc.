import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';
import slug from 'slug';

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
        allowNull: true
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    videoPreview: {
        type: DataTypes.STRING,
        allowNull: true
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
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    totalDuration: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 0
    },
    totalLectures: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    ratingsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    enrollmentsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    mongoContentId: {
        type: DataTypes.STRING, // Reference to MongoDB document
        allowNull: true
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
        }
    }
});

export default Course;
