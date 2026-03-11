// src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Referral from '../models/Referral.js';
import logger from '../utils/dbLogger.js';
import PasswordPolicy from '../utils/passwordPolicy.js';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate token (includes role in payload)
const generateToken = (userId, role) => {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret-for-emergency-use-change-in-production';
    if (!jwtSecret) {
        console.error('❌ JWT_SECRET is not defined! Using fallback.');
    }
    console.log('🔑 JWT Secret exists:', !!jwtSecret, 'Length:', jwtSecret?.length);

    return jwt.sign(
        { userId, role },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

export const registerUser = async (req, res) => {
    console.log('\n========== REGISTRATION REQUEST START ==========');
    console.log('1. Received request body:', req.body);

    // Validate JWT secret first
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('❌ CRITICAL: JWT_SECRET is not defined!');
        return res.status(500).json({
            message: 'Server configuration error: JWT secret missing',
            error: 'JWT_SECRET environment variable not set'
        });
    }

    try {
        // Server-side password policy validation for signup
        const { name, email, password, role, notificationPreferences, phoneNumber, whatsappNumber, referralCode } = req.body;
        if (password) {
            const { isValid, errors } = PasswordPolicy.validatePassword(password);
            if (!isValid) {
                return res.status(400).json({ message: errors[0] });
            }
        }
        console.log('2. Extracted fields:', { name, email, role, hasPassword: !!password, hasNotificationPrefs: !!notificationPreferences, hasReferralCode: !!referralCode });

        // Check if user exists
        const normalizedEmail = email.trim().toLowerCase();
        console.log('3. Normalized email:', normalizedEmail);
        console.log('4. Checking if user exists...');

        let user = await User.findOne({ where: { email: normalizedEmail } });
        console.log('5. User lookup result:', user ? 'EXISTS' : 'NOT FOUND');

        if (user) {
            console.log('❌ Registration failed: User already exists');
            let message = 'User with this email already exists.';
            if (user.isGoogleUser && !user.password) {
                message += ' It appears you previously signed in with Google. Please use Google Sign In.';
            } else {
                message += ' Please log in instead.';
            }
            return res.status(400).json({ message });
        }

        // Validate referral code if provided
        let referrer = null;
        if (referralCode) {
            console.log('5a. Validating referral code:', referralCode);
            referrer = await User.findOne({ where: { referralCode: referralCode.trim().toUpperCase() } });
            if (!referrer) {
                console.log('⚠️ Invalid referral code provided');
            } else {
                console.log('✅ Referral code valid. Referrer:', referrer.name);
            }
        }

        // Prepare user data with notification preferences
        // For instructors, require admin approval before they can create courses
        const isInstructor = (role || 'student') === 'instructor';
        
        // Generate unique referral code for the new user
        const newReferralCode = uuidv4().substring(0, 8).toUpperCase();
        console.log('5b. Generated referral code for new user:', newReferralCode);
        
        const userData = {
            name,
            email: normalizedEmail,
            password,
            role: role || 'student',
            isVerified: !isInstructor, // Students are verified by default, instructors need approval
            isApproved: !isInstructor, // Students are approved by default, instructors need admin approval
            referralCode: newReferralCode,
            referralPoints: 0,
            referredBy: referrer ? referrer.id : null,
            notificationPreferences: notificationPreferences || {
                email: true,
                whatsapp: false,
                sms: false,
                push: true,
                inApp: true,
                courseUpdates: true,
                assignmentReminders: true,
                newMessages: true,
                promotionalEmails: false,
                weeklyDigest: false
            },
            phoneNumber: phoneNumber || null,
            whatsappNumber: whatsappNumber || null
        };

        console.log('6. Creating new user in database...', {
            hasNotificationPrefs: !!userData.notificationPreferences,
            hasPhoneNumber: !!userData.phoneNumber,
            hasWhatsappNumber: !!userData.whatsappNumber
        });

        // Create user (password will be hashed by beforeCreate hook)
        user = await User.create(userData);
        console.log('7. ✅ User created successfully. ID:', user.id);

        // Handle referral tracking and award points
        if (referrer) {
            console.log('7a. Creating referral record and awarding points...');
            try {
                // Create referral record
                await Referral.create({
                    referrerId: referrer.id,
                    referredId: user.id,
                    referralCode: referralCode.trim().toUpperCase(),
                    pointsAwarded: 3,
                    status: 'completed'
                });
                
                // Award 3 points to referrer
                await referrer.update({
                    referralPoints: (referrer.referralPoints || 0) + 3
                });
                
                console.log(`✅ Referral recorded! ${referrer.name} earned 3 points. Total: ${referrer.referralPoints + 3}`);
            } catch (referralError) {
                console.error('⚠️ Error processing referral:', referralError.message);
                // Don't fail registration if referral processing fails
            }
        }

        // Notify admins if this is an instructor registration
        if (isInstructor && global.broadcastToAdmins) {
            global.broadcastToAdmins('instructor-application', {
                type: 'instructor_application',
                instructor: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                },
                message: `New instructor application: ${user.name}`,
                timestamp: new Date().toISOString()
            });
        }

        // Generate token
        console.log('8. Generating JWT token...');
        console.log('   - JWT_SECRET exists:', !!process.env.JWT_SECRET);
        console.log('   - JWT_SECRET length:', process.env.JWT_SECRET?.length);
        const token = generateToken(user.id);
        console.log('9. ✅ Token generated. Length:', token?.length);

        // Remove password from response
        console.log('10. Preparing response data...');
        const { password: _, ...responseUserData } = user.dataValues;
        console.log('11. User data prepared. Fields:', Object.keys(responseUserData).join(', '));

        // Broadcast real-time update to admin dashboard
        try {
            if (global.broadcastToAdmins) {
                global.broadcastToAdmins('user-registered', {
                    type: user.role === 'instructor' ? 'new_teacher' : 'new_student',
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        isVerified: user.isVerified || false,
                        isApproved: user.isApproved || false,
                        createdAt: user.createdAt,
                        notificationPreferences: user.notificationPreferences
                    },
                    message: user.role === 'instructor'
                        ? `New instructor registered: ${user.name} - Requires admin approval`
                        : `New student registered: ${user.name}`
                });
            }
        } catch (postRegError) {
            console.error('Post-registration broadcast error:', postRegError);
        }

        // MongoDB logging temporarily disabled to prevent timeouts
        console.log('12. Sending success response (201)...');
        res.status(201).json({
            ...responseUserData,
            token: generateToken(user.id, user.role)
        });
        console.log('13. ✅ Response sent successfully');
        console.log('========== REGISTRATION REQUEST END ==========\n');
    } catch (error) {
        console.error('\n❌ REGISTRATION ERROR CAUGHT:');
        console.error('   Message:', error.message);
        console.error('   Name:', error.name);
        console.error('   Stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
        console.log('========== REGISTRATION REQUEST END (ERROR) ==========\n');
    }
};

export const loginUser = async (req, res) => {
    console.log('\n========== LOGIN REQUEST START ==========');
    console.log('1. Received request body:', req.body);

    // Validate JWT secret first
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('❌ CRITICAL: JWT_SECRET is not defined!');
        return res.status(500).json({
            message: 'Server configuration error: JWT secret missing',
            error: 'JWT_SECRET environment variable not set'
        });
    }

    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();
        console.log('Attempting login for:', normalizedEmail);

        // Find user
        let user = await User.findOne({ where: { email: normalizedEmail } });
        if (!user) {
            console.log('Login failed: User not found:', normalizedEmail);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('User found:', { id: user.id, email: user.email, hasPassword: !!user.password });

        // If admin user exists without a password (legacy data or missing seed), seed password from env
        if (!user.password) {
            if (user.role === 'admin') {
                const adminPassword = process.env.RAILWAY_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || process.env.railway_admin_password || 'admin123';
                // Remove manual hash; beforeUpdate hook handles it
                await user.update({ password: adminPassword });
                console.log('✅ Admin password seeded from env for login');
            } else {
                console.log('Login failed: User has no password (OAuth user)');
                return res.status(400).json({ message: 'Please use Google Sign In for this account' });
            }
        }

        // Check password
        let isMatch = await user.matchPassword(password);
        // If admin password mismatches, try reseeding from env var once and retry
        if (user.role === 'admin' && !isMatch) {
            try {
                const { seedRailwayAdmin } = await import('../utils/adminSeed.js');
                await seedRailwayAdmin();
            } catch (e) {
                // ignore seed errors here; we'll fall through to invalid credentials
            }
            // Re-fetch fresh user since seed may have updated the password
            const fresh = await User.findOne({ where: { email: normalizedEmail } });
            if (fresh) {
                user = fresh;
                isMatch = await user.matchPassword(password);
            }
        }
        console.log('Login attempt result:', {
            userId: user.id,
            email: user.email,
            role: user.role,
            passwordMatched: isMatch,
            hashLen: user.password?.length,
            inputLen: (password || '').length
        });
        if (!isMatch) {
            console.log('❌ Login failed: Password mismatch for user:', normalizedEmail);
            console.log('   - Role:', user.role);
            console.log('   - IsApproved:', user.isApproved);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if instructor is approved (only block for instructors who haven't been approved)
        if (user.role === 'instructor' && !user.isApproved) {
            console.log('Login blocked: Instructor not approved:', normalizedEmail);
            return res.status(403).json({
                message: 'Your instructor account is pending approval. Please wait for admin to approve your account.',
                code: 'INSTRUCTOR_NOT_APPROVED'
            });
        }

        // Generate token
        const token = generateToken(user.id, user.role);

        // Remove password from response
        const { password: _, ...userData } = user.dataValues;

        try {
            await logger.track({
                userId: user.id,
                action: 'login',
                resourceType: 'user',
                resourceId: user.id,
                req
            });

            logger.info('Auth', `User logged in: ${user.id}`);
        } catch (postLoginError) {
            console.error('Post-login logging error:', postLoginError);
        }

        console.log('Login successful for user:', user.id);
        res.json({
            ...userData,
            token
        });
    } catch (error) {
        console.error('Login error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        logger.error('Auth', `Login error: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        console.log('Avatar upload request:', {
            file: req.file,
            user: req.user?.id,
            body: req.body
        });

        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
                error: 'Please select a file to upload'
            });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            console.log('User not found:', req.user.id);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Build the avatar URL depending on storage backend:
        // multer-s3 (R2) sets req.file.key; local multer sets req.file.filename.
        const isR2 = !!req.file.key;
        const r2PublicDomain = process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || '';
        const avatarUrl = isR2 && r2PublicDomain
            ? `${r2PublicDomain}/${req.file.key}`
            : `/uploads/${req.file.filename}`;

        const oldAvatar = user.avatar;
        // Always store the full displayable URL so the frontend can use it directly.
        user.avatar = avatarUrl;
        await user.save();

        logger.track({
            userId: user.id,
            action: 'upload_avatar',
            resourceType: 'user',
            resourceId: user.id,
            details: { oldAvatar, newAvatar: avatarUrl },
            req
        });

        logger.info('Auth', `Avatar updated for user ${user.id}`);

        res.json({
            success: true,
            url: avatarUrl,
            message: 'Avatar uploaded successfully',
            filename: isR2 ? req.file.key : req.file.filename
        });
    } catch (error) {
        logger.error('Auth', `Avatar upload error: ${error.message}`, {
            stack: error.stack,
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            bio,
            headline,
            website,
            twitter,
            linkedin,
            youtube,
            skills,
            certifications,
            experience,
            avatar
        } = req.body;
        const user = await User.findByPk(req.user.id);

        if (name) user.name = name;
        if (email) user.email = email.trim().toLowerCase();
        if (password) user.password = password;
        if (bio !== undefined) user.bio = bio;
        if (headline !== undefined) user.headline = headline;
        if (website !== undefined) user.website = website;
        if (twitter !== undefined) user.twitter = twitter;
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (youtube !== undefined) user.youtube = youtube;
        if (skills !== undefined) user.skills = skills;
        if (certifications !== undefined) user.certifications = certifications;
        if (experience !== undefined) user.experience = experience;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        // Remove password from response
        const { password: _, ...userData } = user.dataValues;

        res.json(userData);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const googleAuthCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
        }

        // Generate token
        const token = generateToken(req.user.id);

        // Redirect to frontend with token
        // In production, you might want to use a more secure way to pass the token
        res.redirect(`${process.env.CLIENT_URL}/oauth/callback?token=${token}`);
    } catch (error) {
        console.error('Google Auth Callback Error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
};
