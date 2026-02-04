import { Course, Enrollment, User } from './src/models/index.js';
import CourseContent from './src/models/nosql/CourseContent.js';

const testLearningEndpoint = async () => {
    try {
        const slug = 'complete-python-tutorial-540';
        
        // Step 1: Find course by slug
        const course = await Course.findOne({
            where: { slug },
            include: [{ model: User, as: 'instructor', attributes: ['name', 'avatar'] }]
        });
        
        console.log('Course found:', course ? 'Yes' : 'No');
        
        if (!course) {
            console.log('Course not found');
            process.exit(1);
        }
        
        // Step 2: Find enrollment (simulate user being enrolled)
        const enrollment = await Enrollment.findOne({
            where: {
                userId: 'test-user-id', // This would normally come from req.user.id
                courseId: course.id
            }
        });
        
        console.log('Enrollment found:', enrollment ? 'Yes' : 'No');
        
        if (!enrollment) {
            console.log('User not enrolled - this is expected for the test');
            // Let's create a test enrollment
            const testUser = await User.findOne({ where: { email: 'taryma@gmail.com' } });
            if (testUser) {
                console.log('Found test user:', testUser.name);
                
                const newEnrollment = await Enrollment.create({
                    userId: testUser.id,
                    courseId: course.id,
                    pricePaid: course.price || 0,
                    progress: 0,
                    completedLectures: []
                });
                
                console.log('Created test enrollment:', newEnrollment.id);
                
                // Now test the content lookup
                const content = await CourseContent.findOne({ courseId: course.id });
                console.log('Content found for learning:', content ? 'Yes' : 'No');
                if (content) {
                    console.log('Content ID:', content._id);
                    console.log('Sections:', content.sections.length);
                }
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error testing learning endpoint:', error);
        process.exit(1);
    }
};

testLearningEndpoint();
