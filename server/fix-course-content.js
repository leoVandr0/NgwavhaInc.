import { Course } from './src/models/index.js';

const updateCourseContent = async () => {
    try {
        const courseId = 'b8d70108-436a-4132-9a4c-1ca6d52d1e40';
        const newMongoContentId = '6983281f0aa18775cc01dc34';
        
        const course = await Course.findByPk(courseId);
        if (course) {
            course.mongoContentId = newMongoContentId;
            await course.save();
            console.log('Course content updated successfully');
            console.log('New content ID:', course.mongoContentId);
        } else {
            console.log('Course not found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error updating course:', error);
        process.exit(1);
    }
};

updateCourseContent();
