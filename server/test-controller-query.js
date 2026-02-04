import mongoose from 'mongoose';
import CourseContent from './src/models/nosql/CourseContent.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ngwavha-inc', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const testControllerQuery = async () => {
    try {
        const courseId = 'b8d70108-436a-4132-9a4c-1ca6d52d1e40';
        
        // This is the exact query the controller uses
        const content = await CourseContent.findOne({ courseId }).lean();
        
        console.log('Controller query result:');
        console.log('Content found:', content ? 'Yes' : 'No');
        
        if (content) {
            console.log('Content ID:', content._id);
            console.log('Sections count:', content.sections.length);
            console.log('Updated:', content.updatedAt);
            
            if (content.sections.length > 0) {
                console.log('First section:', content.sections[0].title);
                console.log('First lecture:', content.sections[0].lectures[0]?.title);
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error testing query:', error);
        process.exit(1);
    }
};

testControllerQuery();
