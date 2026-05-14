import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const Complaint = sequelize.define('Complaint', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('course_quality', 'instructor_conduct', 'technical_issue', 'payment', 'other'),
        allowNull: false,
        defaultValue: 'other'
    },
    status: {
        type: DataTypes.ENUM('open', 'in_review', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'open'
    },
    relatedCourseId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Courses', key: 'id' }
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Complaints',
    timestamps: true,
    underscored: true
});

Complaint.associate = (models) => {
    Complaint.belongsTo(models.User, { foreignKey: 'userId', as: 'submittedBy' });
    Complaint.belongsTo(models.Course, { foreignKey: 'relatedCourseId', as: 'relatedCourse' });
};

export default Complaint;
