import User from './User.js';
import Course from './Course.js';
import Category from './Category.js';
import Enrollment from './Enrollment.js';
import Review from './Review.js';
import Transaction from './Transaction.js';
import LiveSession from './LiveSession.js';
import CartItem from './CartItem.js';
import WishlistItem from './WishlistItem.js';
import Assignment from './Assignment.js';
import Referral from './Referral.js';

// User <-> Course (Instructor relationship)
User.hasMany(Course, { foreignKey: 'instructorId', as: 'instructedCourses', onDelete: 'CASCADE', hooks: true });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// User <-> Enrollment (Student relationship)
User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments', onDelete: 'CASCADE', hooks: true });
Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'student' });

// Course <-> Enrollment
Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments', onDelete: 'CASCADE', hooks: true });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Category <-> Course
Category.hasMany(Course, { foreignKey: 'categoryId', as: 'courses' });
Course.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Category Self-reference (Subcategories)
Category.hasMany(Category, { foreignKey: 'parentId', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parentCategory' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews', onDelete: 'CASCADE', hooks: true });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Course <-> Review
Course.hasMany(Review, { foreignKey: 'courseId', as: 'reviews', onDelete: 'CASCADE', hooks: true });
Review.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User <-> Transaction
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE', hooks: true });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Course <-> Transaction (Optional, if buying single course)
Course.hasMany(Transaction, { foreignKey: 'courseId', as: 'transactions', onDelete: 'CASCADE', hooks: true });
Transaction.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User <-> LiveSession
User.hasMany(LiveSession, { foreignKey: 'instructorId', as: 'hostedSessions', onDelete: 'CASCADE', hooks: true });
LiveSession.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// Course <-> LiveSession
Course.hasMany(LiveSession, { foreignKey: 'courseId', as: 'liveSessions', onDelete: 'CASCADE', hooks: true });
LiveSession.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User <-> CartItem
User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems', onDelete: 'CASCADE', hooks: true });
CartItem.belongsTo(User, { foreignKey: 'userId' });

// Course <-> CartItem
Course.hasMany(CartItem, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
CartItem.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User <-> WishlistItem
User.hasMany(WishlistItem, { foreignKey: 'userId', as: 'wishlistItems', onDelete: 'CASCADE', hooks: true });
WishlistItem.belongsTo(User, { foreignKey: 'userId' });

// Course <-> WishlistItem
Course.hasMany(WishlistItem, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
WishlistItem.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course <-> Assignment
Course.hasMany(Assignment, { foreignKey: 'courseId', as: 'assignments', onDelete: 'CASCADE', hooks: true });
Assignment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User <-> Assignment (Instructor)
User.hasMany(Assignment, { foreignKey: 'instructorId', as: 'instructedAssignments', onDelete: 'CASCADE', hooks: true });
Assignment.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// User <-> Referral (as referrer)
User.hasMany(Referral, { foreignKey: 'referrerId', as: 'referralsMade', onDelete: 'CASCADE', hooks: true });
Referral.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });

// User <-> Referral (as referred)
User.hasMany(Referral, { foreignKey: 'referredId', as: 'referralsReceived', onDelete: 'CASCADE', hooks: true });
Referral.belongsTo(User, { foreignKey: 'referredId', as: 'referred' });

export {
    User,
    Course,
    Category,
    Enrollment,
    Review,
    Transaction,
    LiveSession,
    CartItem,
    WishlistItem,
    Assignment,
    Referral
};
