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

// User <-> Course (Instructor relationship)
User.hasMany(Course, { foreignKey: 'instructorId', as: 'instructedCourses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// User <-> Enrollment (Student relationship)
User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'student' });

// Course <-> Enrollment
Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Category <-> Course
Category.hasMany(Course, { foreignKey: 'categoryId', as: 'courses' });
Course.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Category Self-reference (Subcategories)
Category.hasMany(Category, { foreignKey: 'parentId', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parentCategory' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Course <-> Review
Course.hasMany(Review, { foreignKey: 'courseId', as: 'reviews' });
Review.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User <-> Transaction
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Course <-> Transaction (Optional, if buying single course)
Course.hasMany(Transaction, { foreignKey: 'courseId', as: 'transactions' });
Transaction.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User <-> LiveSession
User.hasMany(LiveSession, { foreignKey: 'instructorId', as: 'hostedSessions' });
LiveSession.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// Course <-> LiveSession
Course.hasMany(LiveSession, { foreignKey: 'courseId', as: 'liveSessions' });
LiveSession.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User <-> CartItem
User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

// Course <-> CartItem
Course.hasMany(CartItem, { foreignKey: 'courseId' });
CartItem.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User <-> WishlistItem
User.hasMany(WishlistItem, { foreignKey: 'userId', as: 'wishlistItems' });
WishlistItem.belongsTo(User, { foreignKey: 'userId' });

// Course <-> WishlistItem
Course.hasMany(WishlistItem, { foreignKey: 'courseId' });
WishlistItem.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course <-> Assignment
Course.hasMany(Assignment, { foreignKey: 'courseId', as: 'assignments' });
Assignment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User <-> Assignment (Instructor)
User.hasMany(Assignment, { foreignKey: 'instructorId', as: 'instructedAssignments' });
Assignment.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

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
    Assignment
};
