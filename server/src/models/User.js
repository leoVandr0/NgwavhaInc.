import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';
import bcrypt from 'bcryptjs';
import { deleteFile } from '../utils/fileUtils.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true // Allow null for OAuth users
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    isGoogleUser: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    role: {
        type: DataTypes.ENUM('student', 'instructor', 'admin'),
        defaultValue: 'student'
    },
    avatar: {
        type: DataTypes.STRING,
        defaultValue: 'default-avatar.png'
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    headline: {
        type: DataTypes.STRING,
        allowNull: true
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true
    },
    twitter: {
        type: DataTypes.STRING,
        allowNull: true
    },
    linkedin: {
        type: DataTypes.STRING,
        allowNull: true
    },
    youtube: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    instructorStatus: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING',
        comment: 'Instructor application status - PENDING, APPROVED, or REJECTED'
    },
    verificationStatus: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending'
    },
    nationalIDUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    certificatesUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpire: {
        type: DataTypes.DATE,
        allowNull: true
    },
    stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    stripeAccountId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    skills: {
        type: DataTypes.TEXT, // Comma separated or JSON
        allowNull: true
    },
    certifications: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    experience: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Notification preferences
    notificationPreferences: {
        type: DataTypes.JSON,
        defaultValue: {
            email: true,
            whatsapp: false,
            sms: false,
            push: true,
            inApp: true,
            courseUpdates: true,
            assignmentReminders: true,
            newMessages: true,
            promotionalEmails: false,
            weeklyDigest: false
        }
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[+]?[\d\s\-\(\)]+$/ // Basic phone validation
        }
    },
    whatsappNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[+]?[\d\s\-\(\)]+$/ // Basic phone validation
        }
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_approved'
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'approved_at'
    },
    approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'approved_by'
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        afterDestroy: async (user) => {
            console.log(`💣 Cleaning up files for user: ${user.email}`);
            deleteFile(user.avatar);
            deleteFile(user.nationalIDUrl);
            deleteFile(user.certificatesUrl);
        }
    }
});

User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default User;
