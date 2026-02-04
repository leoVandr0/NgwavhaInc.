import { Course } from './src/models/index.js';

const checkCourse = async () => {
    try {
        const courseId = 'b8d70108-436a-4132-9a4c-1ca6d52d1e40';
        
        const course = await Course.findByPk(courseId);
        if (course) {
            console.log('Course found:', course.title);
            console.log('mongoContentId:', course.mongoContentId);
        } else {
            console.log('Course not found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error checking course:', error);
        process.exit(1);
    }
};

checkCourse();
