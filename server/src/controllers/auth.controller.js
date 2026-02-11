// src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

export const registerUser = async (req, res) => {
    console.log('Register request body:', req.body);
    try {
        const { name, email, password, role } = req.body;
        // Check if user exists
        const normalizedEmail = email.trim().toLowerCase();
        let user = await User.findOne({ where: { email: normalizedEmail } });
        if (user) {
            console.log('Registration failed: User already exists:', normalizedEmail);
            let message = 'User with this email already exists.';
            if (user.isGoogleUser && !user.password) {
                message += ' It appears you previously signed in with Google. Please use Google Sign In.';
            } else {
                message += ' Please log in instead.';
            }
            return res.status(400).json({ message });
        }

        // Create user (password will be hashed by the beforeCreate hook)
        console.log('Creating user:', normalizedEmail);
        user = await User.create({
            name,
            email: normalizedEmail,
            password,
            role: role || 'student'
        });

        // Generate token
        const token = generateToken(user.id);

        // Remove password from response
        const { password: _, ...userData } = user.dataValues;

        console.log('User created successfully:', user.id);
        res.status(201).json({
            ...userData,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    console.log('Login request body:', req.body);
    try {
        const { email, password } = req.body;

        // Check if user exists
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ where: { email: normalizedEmail } });
        if (!user) {
            console.log('Login failed: User not found:', normalizedEmail);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log('Login failed: Password mismatch for user:', normalizedEmail);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user.id);

        // Remove password from response
        const { password: _, ...userData } = user.dataValues;

        console.log('Login successful:', user.id);
        res.json({
            ...userData,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
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

        // Update user avatar with the filename
        const oldAvatar = user.avatar;
        user.avatar = req.file.filename;
        await user.save();

        console.log('Avatar uploaded successfully:', {
            userId: user.id,
            oldAvatar,
            newAvatar: req.file.filename
        });

        res.json({
            success: true,
            url: req.file.filename,
            message: 'Avatar uploaded successfully',
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Avatar upload error:', {
            error: error.message,
            stack: error.stack,
            file: req.file,
            user: req.user?.id
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
