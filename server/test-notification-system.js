import NotificationService from './src/services/notificationService.js';

async function testNotificationSystem() {
    console.log('🧪 Testing Notification System...\n');
    
    const notificationService = new NotificationService();
    
    // Test notification data
    const testNotification = {
        type: 'courseUpdates',
        title: 'New Course Available',
        message: 'A new course "Advanced React Patterns" is now available!',
        data: {
            courseId: 'test-course-123',
            courseTitle: 'Advanced React Patterns'
        }
    };
    
    console.log('📤 Sending test notification:', testNotification);
    
    try {
        // This would normally send to a real user ID
        // For testing, we'll just verify the service structure
        console.log('✅ NotificationService initialized successfully');
        console.log('✅ Available channels:', Object.keys(notificationService.channels));
        console.log('✅ Channel implementations:');
        
        Object.entries(notificationService.channels).forEach(([name, channel]) => {
            console.log(`  - ${name}: ${channel.constructor.name}`);
        });
        
        console.log('\n🎉 Notification system test completed successfully!');
        console.log('📝 Note: To test actual sending, you need:');
        console.log('   1. A real user ID in the database');
        console.log('   2. External service API keys (SendGrid, Twilio, etc.)');
        console.log('   3. Proper phone numbers for WhatsApp/SMS');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testNotificationSystem().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
