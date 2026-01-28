import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// SendGrid configuration
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Nodemailer SMTP configuration (fallback)
const smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export const sendEmail = async ({ to, subject, html, text }) => {
    const from = {
        email: process.env.EMAIL_FROM || 'noreply@ngwavha.com',
        name: process.env.EMAIL_FROM_NAME || 'Ngwavha',
    };

    try {
        // Try SendGrid first
        if (process.env.SENDGRID_API_KEY) {
            await sgMail.send({
                to,
                from: `${from.name} <${from.email}>`,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, ''),
            });
            console.log(`📧 Email sent to ${to} via SendGrid`);
            return { success: true, provider: 'sendgrid' };
        }

        // Fallback to SMTP
        await smtpTransporter.sendMail({
            from: `${from.name} <${from.email}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''),
        });
        console.log(`📧 Email sent to ${to} via SMTP`);
        return { success: true, provider: 'smtp' };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw error;
    }
};

export const emailTemplates = {
    welcome: (name) => ({
        subject: 'Welcome to Ngwavha! 🎓',
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ea5e9; margin: 0;">Ngwavha</h1>
          <p style="color: #64748b; font-size: 14px;">Learn. Grow. Succeed.</p>
        </div>
        <h2 style="color: #f1f5f9;">Welcome, ${name}! 🎉</h2>
        <p style="line-height: 1.6; color: #cbd5e1;">
          Thank you for joining Ngwavha! You're now part of a community of learners 
          dedicated to growing their skills and achieving their goals.
        </p>
        <div style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); padding: 20px; border-radius: 10px; margin: 30px 0; text-align: center;">
          <a href="${process.env.CLIENT_URL}/courses" style="color: white; text-decoration: none; font-weight: bold; font-size: 16px;">
            Explore Courses →
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 40px;">
          © 2024 Ngwavha. All rights reserved.
        </p>
      </div>
    `,
    }),

    passwordReset: (name, resetUrl) => ({
        subject: 'Reset Your Password - Ngwavha',
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ea5e9; margin: 0;">Ngwavha</h1>
        </div>
        <h2 style="color: #f1f5f9;">Password Reset Request</h2>
        <p style="line-height: 1.6; color: #cbd5e1;">
          Hi ${name}, we received a request to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This link expires in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
    }),

    enrollmentConfirmation: (name, courseName) => ({
        subject: `You're enrolled in ${courseName}! 🎓`,
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ea5e9; margin: 0;">Ngwavha</h1>
        </div>
        <h2 style="color: #f1f5f9;">Enrollment Confirmed! 🎉</h2>
        <p style="line-height: 1.6; color: #cbd5e1;">
          Congratulations ${name}! You're now enrolled in <strong style="color: #0ea5e9;">${courseName}</strong>.
        </p>
        <div style="background: #1e293b; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="color: #94a3b8; margin: 0;">Next Steps:</p>
          <ul style="color: #e2e8f0; padding-left: 20px;">
            <li>Access your course from the dashboard</li>
            <li>Complete lessons at your own pace</li>
            <li>Earn your certificate upon completion</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/my-courses" style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Start Learning
          </a>
        </div>
      </div>
    `,
    }),

    courseCompletion: (name, courseName, certificateUrl) => ({
        subject: `Congratulations! You've completed ${courseName} 🏆`,
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ea5e9; margin: 0;">Ngwavha</h1>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 64px;">🏆</div>
          <h2 style="color: #f1f5f9;">Course Completed!</h2>
        </div>
        <p style="line-height: 1.6; color: #cbd5e1; text-align: center;">
          Amazing work, ${name}! You've successfully completed <strong style="color: #0ea5e9;">${courseName}</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${certificateUrl}" style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Download Certificate
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center;">
          Share your achievement with your network!
        </p>
      </div>
    `,
    }),

    newCourseContent: (name, courseName, contentTitle) => ({
        subject: `New content added to ${courseName}`,
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ea5e9; margin: 0;">Ngwavha</h1>
        </div>
        <h2 style="color: #f1f5f9;">New Content Available! 📚</h2>
        <p style="line-height: 1.6; color: #cbd5e1;">
          Hi ${name}, new content has been added to your course:
        </p>
        <div style="background: #1e293b; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="color: #94a3b8; margin: 0 0 5px;">Course: <strong style="color: #e2e8f0;">${courseName}</strong></p>
          <p style="color: #94a3b8; margin: 0;">New Lesson: <strong style="color: #0ea5e9;">${contentTitle}</strong></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/my-courses" style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Continue Learning
          </a>
        </div>
      </div>
    `,
    }),
};

export default { sendEmail, emailTemplates };
