import mongoose from 'mongoose';
import CourseContent from './src/models/nosql/CourseContent.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ngwavha-inc', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const deleteEmptyContent = async () => {
    try {
        const courseId = 'b8d70108-436a-4132-9a4c-1ca6d52d1e40';
        
        // Find and delete content with empty sections
        const emptyContent = await CourseContent.findOne({ 
            courseId, 
            'sections.0': { $exists: false } 
        });
        
        if (emptyContent) {
            console.log('Deleting empty content:', emptyContent._id);
            await CourseContent.deleteOne({ _id: emptyContent._id });
            console.log('Empty content deleted');
        } else {
            console.log('No empty content found');
        }
        
        // Check remaining content
        const remainingContent = await CourseContent.find({ courseId });
        console.log('Remaining content documents:', remainingContent.length);
        
        remainingContent.forEach((content, index) => {
            console.log(`Content ${index + 1}: ${content.sections.length} sections`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error deleting content:', error);
        process.exit(1);
    }
};

deleteEmptyContent();
