import api from './api';

class ActivityService {
    constructor() {
        this.queue = [];
        this.isOnline = navigator.onLine;
        this.flushInterval = null;
        
        // Set up online/offline listeners
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        // Start periodic flush
        this.startPeriodicFlush();
    }

    // Track student activities
    trackActivity(action, resourceType, resourceId, details = {}) {
        const activity = {
            action,
            resourceType,
            resourceId,
            details: {
                ...details,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            }
        };

        // Add to queue
        this.queue.push(activity);

        // Try to send immediately if online
        if (this.isOnline) {
            this.flushQueue();
        }
    }

    // Specific activity tracking methods
    trackLogin() {
        this.trackActivity('login', 'user', 'self', {
            loginTime: new Date().toISOString()
        });
    }

    trackCourseView(courseId, courseTitle) {
        this.trackActivity('course_view', 'course', courseId, {
            courseTitle,
            viewTime: new Date().toISOString()
        });
    }

    trackLessonComplete(lessonId, lessonTitle, courseId, courseTitle) {
        this.trackActivity('lesson_complete', 'lesson', lessonId, {
            lessonTitle,
            courseId,
            courseTitle,
            completionTime: new Date().toISOString()
        });
    }

    trackVideoWatch(videoId, videoTitle, courseId, courseTitle, duration) {
        this.trackActivity('video_watch', 'video', videoId, {
            videoTitle,
            courseId,
            courseTitle,
            duration,
            watchTime: new Date().toISOString()
        });
    }

    trackCourseEnroll(courseId, courseTitle, price) {
        this.trackActivity('course_enroll', 'course', courseId, {
            courseTitle,
            price,
            enrollmentTime: new Date().toISOString()
        });
    }

    trackAssignmentSubmit(assignmentId, assignmentTitle, courseId, courseTitle) {
        this.trackActivity('assignment_submit', 'assignment', assignmentId, {
            assignmentTitle,
            courseId,
            courseTitle,
            submissionTime: new Date().toISOString()
        });
    }

    trackQuizComplete(quizId, quizTitle, score, courseId, courseTitle) {
        this.trackActivity('quiz_complete', 'quiz', quizId, {
            quizTitle,
            score,
            courseId,
            courseTitle,
            completionTime: new Date().toISOString()
        });
    }

    trackCertificateEarned(courseId, courseTitle, certificateUrl) {
        this.trackActivity('certificate_earned', 'certificate', courseId, {
            courseTitle,
            certificateUrl,
            earnedTime: new Date().toISOString()
        });
    }

    // Flush queued activities to server
    async flushQueue() {
        if (!this.isOnline || this.queue.length === 0) {
            return;
        }

        const activitiesToSend = [...this.queue];
        this.queue = [];

        try {
            await api.post('/api/student/activity/batch', {
                activities: activitiesToSend
            });
        } catch (error) {
            console.error('Failed to send activities:', error);
            // Re-add to queue if failed
            this.queue.unshift(...activitiesToSend);
        }
    }

    // Start periodic flush
    startPeriodicFlush() {
        this.flushInterval = setInterval(() => {
            if (this.isOnline && this.queue.length > 0) {
                this.flushQueue();
            }
        }, 30000); // Flush every 30 seconds
    }

    // Stop periodic flush
    stopPeriodicFlush() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
    }

    // Get queue status
    getQueueStatus() {
        return {
            queueLength: this.queue.length,
            isOnline: this.isOnline
        };
    }
}

// Create singleton instance
const activityService = new ActivityService();

export default activityService;
