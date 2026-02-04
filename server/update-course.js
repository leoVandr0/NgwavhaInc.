import { Course } from './src/models/index.js';

const updateCourse = async () => {
    try {
        const courseId = 'b8d70108-436a-4132-9a4c-1ca6d52d1e40';
        const mongoContentId = '6983281f0aa18775cc01dc34';
        
        await Course.update(
            { mongoContentId: mongoContentId },
            { where: { id: courseId } }
        );
        
        console.log('Course updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error updating course:', error);
        process.exit(1);
    }
};

updateCourse();
