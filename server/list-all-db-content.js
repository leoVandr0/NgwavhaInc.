import mongoose from 'mongoose';
import CourseContent from './src/models/nosql/CourseContent.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ngwavha-inc', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const listAllContentInDB = async () => {
    try {
        // Find ALL content documents
        const allContent = await CourseContent.find({});
        
        console.log('ALL content documents in database:');
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
        console.error('Error listing all content:', error);
        process.exit(1);
    }
};

listAllContentInDB();
