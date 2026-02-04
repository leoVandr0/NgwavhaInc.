import mongoose from 'mongoose';
import CourseContent from './src/models/nosql/CourseContent.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ngwavha-inc', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const addCourseContent = async () => {
    try {
        const courseId = 'b8d70108-436a-4132-9a4c-1ca6d52d1e40';
        
        const courseContent = {
            courseId: courseId,
            sections: [
                {
                    title: "Introduction to Python",
                    description: "Getting started with Python programming",
                    position: 1,
                    lectures: [
                        {
                            title: "What is Python?",
                            description: "Introduction to Python programming language",
                            videoUrl: "/uploads/video-0560380a-1b31-459c-a939-3ed67baf5b82.mp4",
                            videoDuration: 300,
                            type: "video",
                            position: 1
                        },
                        {
                            title: "Setting up Python Environment",
                            description: "Installing Python and setting up development environment",
                            videoUrl: "/uploads/video-53787abb-d1aa-43f8-b360-3b2280e43b25.mp4",
                            videoDuration: 450,
                            type: "video",
                            position: 2
                        }
                    ]
                },
                {
                    title: "Python Basics",
                    description: "Fundamental concepts of Python",
                    position: 2,
                    lectures: [
                        {
                            title: "Variables and Data Types",
                            description: "Understanding variables and data types in Python",
                            videoUrl: "/uploads/video-56356f98-e104-478c-8037-31ebc8c62d7e.mp4",
                            videoDuration: 600,
                            type: "video",
                            position: 1
                        }
                    ]
                }
            ]
        };

        // Delete existing content if any
        await CourseContent.deleteOne({ courseId });

        // Add new content
        const content = await CourseContent.create(courseContent);
        console.log('Course content added successfully:', content._id);
        
        process.exit(0);
    } catch (error) {
        console.error('Error adding course content:', error);
        process.exit(1);
    }
};

addCourseContent();
