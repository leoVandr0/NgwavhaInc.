import('./src/controllers/student.controller.js')
    .then(() => console.log('✅ student.controller.js OK'))
    .catch(err => {
        console.error('❌ student.controller.js FAILED:', err);
        process.exit(1);
    });

import('./src/controllers/instructor.controller.js')
    .then(() => console.log('✅ instructor.controller.js OK'))
    .catch(err => {
        console.error('❌ instructor.controller.js FAILED:', err);
        process.exit(1);
    });
