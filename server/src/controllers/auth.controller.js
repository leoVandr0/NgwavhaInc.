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
            return res.status(400).json({ message: 'User already exists' });
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

export const updateUserProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findByPk(req.user.id);

        if (name) user.name = name;
        if (email) user.email = email.trim().toLowerCase();
        if (password) {
            user.password = password; // Hook will handle hashing
        }

        await user.save();

        // Remove password from response
        const { password: _, ...userData } = user.dataValues;

        res.json(userData);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
