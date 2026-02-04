import { Course } from './src/models/index.js';
import CourseContent from './src/models/nosql/CourseContent.js';

const debugController = async () => {
    try {
        const slug = 'complete-python-tutorial-540';
        
        // Step 1: Find course by slug (exact same as controller)
        const course = await Course.findOne({
            where: { slug }
        });
        
        console.log('Step 1 - Course found:', course ? 'Yes' : 'No');
        if (course) {
            console.log('  Course ID:', course.id);
            console.log('  Course Title:', course.title);
            console.log('  mongoContentId:', course.mongoContentId);
        }
        
        // Step 2: Find content by courseId (exact same as controller)
        const content = await CourseContent.findOne({ courseId: course.id }).lean();
        
        console.log('\nStep 2 - Content found:', content ? 'Yes' : 'No');
        if (content) {
            console.log('  Content ID:', content._id);
            console.log('  Sections count:', content.sections.length);
            console.log('  Updated:', content.updatedAt);
        }
        
        // Step 3: What would be returned
        console.log('\nStep 3 - Final result:');
        if (course && content) {
            console.log('  Would return content with ID:', content._id);
            console.log('  Sections in response:', content.sections.length);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error debugging:', error);
        process.exit(1);
    }
};

debugController();
