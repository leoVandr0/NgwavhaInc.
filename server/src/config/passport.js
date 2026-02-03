import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { sendEmail, emailTemplates } from './email.js';

const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const { id, displayName, emails, photos } = profile;
                    const email = emails[0].value;
                    const avatar = photos[0]?.value;

                    // Check if user exists with googleId
                    let user = await User.findOne({ where: { googleId: id } });

                    if (user) {
                        return done(null, user);
                    }

                    // Check if user exists with email (link accounts)
                    user = await User.findOne({ where: { email } });

                    if (user) {
                        user.googleId = id;
                        user.isGoogleUser = true;
                        if (!user.avatar || user.avatar === 'default-avatar.png') {
                            user.avatar = avatar;
                        }
                        await user.save();
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        name: displayName,
                        email,
                        googleId: id,
                        isGoogleUser: true,
                        avatar: avatar || 'default-avatar.png',
                        role: 'student', // Default role for OAuth
                        isVerified: true
                    });

                    // Send welcome email via SendGrid
                    try {
                        const template = emailTemplates.welcome(user.name);
                        await sendEmail({
                            to: user.email,
                            subject: template.subject,
                            html: template.html
                        });
                        console.log(`📧 Welcome email sent to new Google user: ${user.email}`);
                    } catch (emailError) {
                        console.error('❌ Failed to send welcome email to Google user:', emailError);
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

export default configurePassport;
