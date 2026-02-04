import mongoose from 'mongoose';
import CourseContent from './src/models/nosql/CourseContent.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ngwavha-inc', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const listAllContent = async () => {
    try {
        const courseId = 'b8d70108-436a-4132-9a4c-1ca6d52d1e40';
        
        // Find all content for this course
        const allContent = await CourseContent.find({ courseId });
        
        console.log('All content documents for course:');
        allContent.forEach((content, index) => {
            console.log(`\nContent ${index + 1}:`);
            console.log(`  ID: ${content._id}`);
            console.log(`  CourseID: ${content.courseId}`);
            console.log(`  Sections: ${content.sections.length}`);
            console.log(`  Updated: ${content.updatedAt}`);
            
            if (content.sections.length > 0) {
                content.sections.forEach((section, sIndex) => {
                    console.log(`    Section ${sIndex + 1}: ${section.title} (${section.lectures?.length || 0} lectures)`);
                });
            }
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error listing content:', error);
        process.exit(1);
    }
};

listAllContent();
