import mongoose from 'mongoose';
import CourseContent from './src/models/nosql/CourseContent.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ngwavha-inc', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const fixDuplicateContent = async () => {
    try {
        const courseId = 'b8d70108-436a-4132-9a4c-1ca6d52d1e40';
        
        // Find all content for this course
        const allContent = await CourseContent.find({ courseId });
        console.log('Found content documents:', allContent.length);
        
        if (allContent.length > 1) {
            // Keep the newest one (with lectures)
            const contentWithLectures = allContent.find(c => c.sections.length > 0);
            const emptyContent = allContent.find(c => c.sections.length === 0);
            
            if (contentWithLectures && emptyContent) {
                console.log('Deleting empty content:', emptyContent._id);
                await CourseContent.deleteOne({ _id: emptyContent._id });
                console.log('Keeping content with lectures:', contentWithLectures._id);
                
                // Update course to point to the correct content
                const { Course } = await import('./src/models/index.js');
                const course = await Course.findByPk(courseId);
                if (course) {
                    course.mongoContentId = contentWithLectures._id.toString();
                    await course.save();
                    console.log('Course updated with correct content ID');
                }
            }
        } else {
            console.log('No duplicate content found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error fixing content:', error);
        process.exit(1);
    }
};

fixDuplicateContent();
