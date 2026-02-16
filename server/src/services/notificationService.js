import User from '../models/User.js';

class NotificationService {
    constructor() {
        this.channels = {
            email: new EmailChannel(),
            whatsapp: new WhatsAppChannel(),
            sms: new SMSChannel(),
            push: new PushChannel(),
            inApp: new InAppChannel()
        };
    }

    async sendNotification(userId, notification) {
        try {
            // Get user with notification preferences
            const user = await User.findByPk(userId);
            if (!user) {
                console.error('User not found for notification:', userId);
                return { success: false, error: 'User not found' };
            }

            const preferences = user.notificationPreferences || {};
            const results = [];

            // Send through enabled channels
            for (const [channelName, channel] of Object.entries(this.channels)) {
                if (this.shouldSendNotification(channelName, notification.type, preferences)) {
                    try {
                        const result = await channel.send(user, notification);
                        results.push({
                            channel: channelName,
                            success: result.success,
                            error: result.error,
                            messageId: result.messageId
                        });
                    } catch (error) {
                        console.error(`Failed to send ${channelName} notification:`, error);
                        results.push({
                            channel: channelName,
                            success: false,
                            error: error.message
                        });
                    }
                }
            }

            // Log notification attempt
            await this.logNotificationAttempt(userId, notification, results);
            
            return {
                success: true,
                results,
                channelsSent: results.filter(r => r.success).length
            };
        } catch (error) {
            console.error('Notification service error:', error);
            return { success: false, error: error.message };
        }
    }

    shouldSendNotification(channel, notificationType, preferences) {
        // Check if channel is enabled
        if (!preferences[channel]) {
            return false;
        }

        // Check if notification type is enabled for this channel
        const typePreferences = {
            email: ['courseUpdates', 'assignmentReminders', 'newMessages', 'promotionalEmails', 'weeklyDigest'],
            whatsapp: ['courseUpdates', 'assignmentReminders', 'newMessages'],
            sms: ['courseUpdates', 'assignmentReminders', 'newMessages'],
            push: ['courseUpdates', 'assignmentReminders', 'newMessages'],
            inApp: ['courseUpdates', 'assignmentReminders', 'newMessages']
        };

        return typePreferences[channel]?.includes(notificationType) || false;
    }

    async logNotificationAttempt(userId, notification, results) {
        try {
            // This would log to a notifications table in a real implementation
            console.log(`Notification logged for user ${userId}:`, {
                type: notification.type,
                title: notification.title,
                channels: results.map(r => r.channel),
                successCount: results.filter(r => r.success).length,
                failureCount: results.filter(r => !r.success).length
            });
        } catch (error) {
            console.error('Failed to log notification attempt:', error);
        }
    }

    async updateNotificationPreferences(userId, preferences) {
        try {
            await User.update(
                { notificationPreferences: preferences },
                { where: { id: userId } }
            );
            return { success: true };
        } catch (error) {
            console.error('Failed to update notification preferences:', error);
            return { success: false, error: error.message };
        }
    }
}

// Email Channel Implementation
class EmailChannel {
    async send(user, notification) {
        try {
            // This would integrate with SendGrid or similar service
            console.log(`📧 Email notification sent to ${user.email}:`, notification.title);
            
            // Simulate email sending
            return {
                success: true,
                messageId: `email_${Date.now()}_${user.id}`,
                channel: 'email'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// WhatsApp Channel Implementation  
class WhatsAppChannel {
    async send(user, notification) {
        try {
            if (!user.whatsappNumber) {
                return { success: false, error: 'WhatsApp number not provided' };
            }

            // This would integrate with WhatsApp Business API
            console.log(`💬 WhatsApp notification sent to ${user.whatsappNumber}:`, notification.title);
            
            return {
                success: true,
                messageId: `whatsapp_${Date.now()}_${user.id}`,
                channel: 'whatsapp'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// SMS Channel Implementation
class SMSChannel {
    async send(user, notification) {
        try {
            if (!user.phoneNumber) {
                return { success: false, error: 'Phone number not provided' };
            }

            // This would integrate with Twilio or similar service
            console.log(`📱 SMS notification sent to ${user.phoneNumber}:`, notification.title);
            
            return {
                success: true,
                messageId: `sms_${Date.now()}_${user.id}`,
                channel: 'sms'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Push Notification Channel Implementation
class PushChannel {
    async send(user, notification) {
        try {
            // This would integrate with Web Push Protocol or Firebase Cloud Messaging
            console.log(`🔔 Push notification sent to user ${user.id}:`, notification.title);
            
            return {
                success: true,
                messageId: `push_${Date.now()}_${user.id}`,
                channel: 'push'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// In-App Notification Channel Implementation
class InAppChannel {
    async send(user, notification) {
        try {
            // This would store notifications in database for in-app display
            console.log(`📱 In-app notification created for user ${user.id}:`, notification.title);
            
            return {
                success: true,
                messageId: `inapp_${Date.now()}_${user.id}`,
                channel: 'inApp'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default NotificationService;
