import sgMail from '@sendgrid/mail';

class NotificationService {
    constructor() {
        this.isSendGridConfigured = false;
        this.isTwilioConfigured = false;
        this.twilioClient = null;

        // Initialize SendGrid
        const sgApiKey = process.env.SENDGRID_API_KEY;
        this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@ngwavha.co.zw';

        if (sgApiKey) {
            sgMail.setApiKey(sgApiKey);
            this.isSendGridConfigured = true;
            console.log('✅ SendGrid initialized for email notifications');
        } else {
            console.warn('⚠️ SendGrid API key missing. Email notifications will be disabled.');
        }

        // Initialize Twilio (optional – only loaded when credentials are present)
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
        this.twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        this.twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;

        if (twilioSid && twilioAuthToken) {
            // Dynamic import so the server doesn't crash if twilio isn't installed
            import('twilio').then(({ default: twilio }) => {
                this.twilioClient = twilio(twilioSid, twilioAuthToken);
                this.isTwilioConfigured = true;
                console.log('✅ Twilio initialized for SMS/WhatsApp notifications');
            }).catch((err) => {
                console.warn('⚠️ Twilio package not found. SMS/WhatsApp disabled.', err.message);
            });
        } else {
            console.warn('⚠️ Twilio credentials missing. SMS/WhatsApp notifications will be disabled.');
        }
    }


    /**
     * Send an Email via SendGrid
     */
    async sendEmail(to, subject, htmlContent) {
        if (!this.isSendGridConfigured) {
            console.log(`[Email Skipped] To: ${to} | Subject: ${subject} | Reason: SendGrid Not Configured`);
            return false;
        }

        try {
            const msg = {
                to,
                from: this.fromEmail,
                subject,
                html: htmlContent,
            };
            await sgMail.send(msg);
            console.log(`📧 Email sent to ${to}: ${subject}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send email:', error.response ? error.response.body : error.message);
            return false;
        }
    }

    /**
     * Send an SMS via Twilio
     */
    async sendSMS(to, body) {
        if (!this.isTwilioConfigured || !this.twilioPhone) {
            console.log(`[SMS Skipped] To: ${to} | Reason: Twilio Not Configured or Missing Phone Number`);
            return false;
        }

        try {
            await this.twilioClient.messages.create({
                body,
                from: this.twilioPhone,
                to
            });
            console.log(`📱 SMS sent to ${to}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send SMS:', error.message);
            return false;
        }
    }

    /**
     * Send a WhatsApp Message via Twilio
     */
    async sendWhatsApp(to, body) {
        if (!this.isTwilioConfigured || !this.twilioWhatsApp) {
            console.log(`[WhatsApp Skipped] To: ${to} | Reason: Twilio Not Configured or Missing WhatsApp Number`);
            return false;
        }

        try {
            // Twilio requires 'whatsapp:' prefix for the 'to' and 'from' numbers
            const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
            const formattedFrom = this.twilioWhatsApp.startsWith('whatsapp:') ? this.twilioWhatsApp : `whatsapp:${this.twilioWhatsApp}`;

            await this.twilioClient.messages.create({
                body,
                from: formattedFrom,
                to: formattedTo
            });
            console.log(`💬 WhatsApp sent to ${formattedTo}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send WhatsApp:', error.message);
            return false;
        }
    }

    /**
     * Helper to send notification to all available channels for a user
     */
    async sendMultiChannelNotification(user, { subject, emailBody, shortMessage }) {
        const promises = [];

        // 1. Email (always try if they have an email)
        if (user.email) {
            promises.push(this.sendEmail(user.email, subject, emailBody || shortMessage));
        }

        // 2. Mobile Channels
        // Note: For WhatsApp, the user's phone must be registered/verified in the Twilio Sandbox if you're in testing mode
        if (user.phoneNumber) {
            // Optional: User preferences can be used here. For now, try WhatsApp first as an example, or both
            promises.push(this.sendWhatsApp(user.phoneNumber, shortMessage));
            promises.push(this.sendSMS(user.phoneNumber, shortMessage));
        }

        await Promise.allSettled(promises);
    }
}

// Singleton export
export default new NotificationService();
