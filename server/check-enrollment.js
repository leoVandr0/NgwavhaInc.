import { Course, Enrollment, User } from './src/models/index.js';

const checkEnrollment = async () => {
    try {
        const courseId = 'b8d70108-436a-4132-9a4c-1ca6d52d1e40';
        
        // Get all enrollments for this course
        const enrollments = await Enrollment.findAll({
            where: { courseId },
            include: [{ model: User, as: 'student', attributes: ['name', 'email'] }]
        });
        
        console.log('Enrollments found:', enrollments.length);
        
        enrollments.forEach((enrollment, index) => {
            console.log(`${index + 1}. User: ${enrollment.student.name} (${enrollment.student.email})`);
            console.log(`   Progress: ${enrollment.progress}%`);
            console.log(`   Completed Lectures: ${enrollment.completedLectures?.length || 0}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error checking enrollment:', error);
        process.exit(1);
    }
};

checkEnrollment();
