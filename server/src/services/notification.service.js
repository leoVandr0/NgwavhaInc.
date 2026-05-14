import sgMail from '@sendgrid/mail';
import axios from 'axios';

class NotificationService {
    constructor() {
        this.isSendGridConfigured = false;
        this.isTwilioConfigured = false;
        this.isWhatsAppConfigured = false;
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

        // Initialize Twilio (SMS only)
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
        this.twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        if (twilioSid && twilioAuthToken) {
            import('twilio').then(({ default: twilio }) => {
                this.twilioClient = twilio(twilioSid, twilioAuthToken);
                this.isTwilioConfigured = true;
                console.log('✅ Twilio initialized for SMS notifications');
            }).catch((err) => {
                console.warn('⚠️ Twilio package not found. SMS disabled.', err.message);
            });
        } else {
            console.warn('⚠️ Twilio credentials missing. SMS notifications will be disabled.');
        }

        // Initialize Meta WhatsApp Cloud API
        this.whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        this.whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.whatsappApiVersion = process.env.WHATSAPP_API_VERSION || 'v19.0';

        if (this.whatsappAccessToken && this.whatsappPhoneNumberId) {
            this.isWhatsAppConfigured = true;
            console.log('✅ Meta WhatsApp Cloud API initialized');
        } else {
            console.warn('⚠️ Meta WhatsApp credentials missing. WhatsApp notifications will be disabled.');
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
            await sgMail.send({
                to,
                from: this.fromEmail,
                subject,
                html: htmlContent,
            });
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
            console.log(`[SMS Skipped] To: ${to} | Reason: Twilio Not Configured`);
            return false;
        }

        try {
            await this.twilioClient.messages.create({ body, from: this.twilioPhone, to });
            console.log(`📱 SMS sent to ${to}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send SMS:', error.message);
            return false;
        }
    }

    /**
     * Send a WhatsApp message via Meta Cloud API
     */
    async sendWhatsApp(to, body) {
        if (!this.isWhatsAppConfigured) {
            console.log(`[WhatsApp Skipped] To: ${to} | Reason: Meta WhatsApp Not Configured`);
            return false;
        }

        // Normalize to E.164 — strip spaces/dashes, ensure leading +
        const normalizedTo = to.replace(/[\s\-\(\)]/g, '').replace(/^00/, '+');

        try {
            await axios.post(
                `https://graph.facebook.com/${this.whatsappApiVersion}/${this.whatsappPhoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: normalizedTo,
                    type: 'text',
                    text: { body },
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.whatsappAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log(`💬 WhatsApp sent to ${normalizedTo}`);
            return true;
        } catch (error) {
            const detail = error.response?.data?.error?.message || error.message;
            console.error(`❌ Failed to send WhatsApp to ${normalizedTo}:`, detail);
            return false;
        }
    }

    /**
     * Send notification across all available channels for a user.
     * Uses whatsappNumber for WhatsApp and phoneNumber for SMS (separate fields).
     */
    async sendMultiChannelNotification(user, { subject, emailBody, shortMessage }) {
        const promises = [];

        if (user.email) {
            promises.push(this.sendEmail(user.email, subject, emailBody || shortMessage));
        }

        if (user.whatsappNumber) {
            promises.push(this.sendWhatsApp(user.whatsappNumber, shortMessage));
        }

        if (user.phoneNumber) {
            promises.push(this.sendSMS(user.phoneNumber, shortMessage));
        }

        await Promise.allSettled(promises);
    }

    /**
     * Notify every admin user via email + WhatsApp.
     * Falls back to ADMIN_EMAIL env var if no admin users are found in DB.
     */
    async notifyAdmins({ subject, emailBody, shortMessage }) {
        try {
            // Lazy import to avoid circular deps at module load time
            const { default: User } = await import('../models/User.js');
            const admins = await User.findAll({ where: { role: 'admin' } });

            if (admins.length === 0) {
                // Fall back to env var admin email
                const fallbackEmail = process.env.ADMIN_EMAIL || process.env.RAILWAY_ADMIN_EMAIL;
                if (fallbackEmail) {
                    await this.sendEmail(fallbackEmail, subject, emailBody || shortMessage);
                }
                return;
            }

            await Promise.allSettled(
                admins.map(admin => this.sendMultiChannelNotification(admin, { subject, emailBody, shortMessage }))
            );
        } catch (err) {
            console.error('❌ notifyAdmins error:', err.message);
        }
    }
}

export default new NotificationService();
