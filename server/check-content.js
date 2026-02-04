import mongoose from 'mongoose';
import CourseContent from './src/models/nosql/CourseContent.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ngwavha-inc', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const checkContent = async () => {
    try {
        const courseId = 'b8d70108-436a-4132-9a4c-1ca6d52d1e40';
        
        const content = await CourseContent.findOne({ courseId });
        console.log('Content found:', content ? 'Yes' : 'No');
        
        if (content) {
            console.log('Content ID:', content._id);
            console.log('Sections count:', content.sections.length);
            console.log('First section:', content.sections[0]?.title);
            console.log('Lectures in first section:', content.sections[0]?.lectures?.length);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error checking content:', error);
        process.exit(1);
    }
};

checkContent();
