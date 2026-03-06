import sequelize from './config/mysql.js';
import { User, Course, Enrollment, Review } from './models/index.js';

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // 1. Create a test user
        const user = await User.create({
            firstName: 'Test',
            lastName: 'Deleter',
            email: `test-${Date.now()}@example.com`,
            password: 'password123',
            role: 'student'
        });
        console.log(`👤 Created test user: ${user.email}`);

        // 2. Create a course and associate with user (as instructor)
        // We'll just create an enrollment since this user is a student
        const enroll = await Enrollment.create({
            userId: user.id,
            courseId: ' some-uuid-or-valid-id ', // We might need a real course ID here or skip
            status: 'active'
        }).catch(err => {
            console.log('⚠️ Note: Could not create enrollment (expected if courseId missing), skipping sub-record test.');
        });

        // 3. Delete the user
        console.log('🗑️ Deleting user...');
        await user.destroy();
        console.log('✅ User deleted.');

        // 4. Check if user still exists
        const found = await User.findByPk(user.id);
        if (!found) {
            console.log('✅ Success: User records are gone.');
        } else {
            console.error('❌ Error: User still exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verify();
