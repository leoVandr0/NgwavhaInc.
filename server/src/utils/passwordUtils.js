import bcrypt from 'bcryptjs';

/**
 * Validate password strength on backend
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
    const errors = [];

    if (!password || password.length === 0) {
        errors.push('Password is required');
        return { isValid: false, errors };
    }

    // Length check
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 128) {
        errors.push('Password must not exceed 128 characters');
    }

    // Character variety checks
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    // No spaces
    if (/\s/.test(password)) {
        errors.push('Password must not contain spaces');
    }

    // Check for common passwords
    if (isCommonPassword(password)) {
        errors.push('Password is too common or easily guessable');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Check if password is in common password list
 */
const isCommonPassword = (password) => {
    const commonPasswords = [
        '123456', 'password', 'qwerty', 'abc123', '111111', '12345678',
        'password123', 'admin123', 'welcome', 'monkey', 'letmein', 'sunshine',
        'princess', 'dragon', 'baseball', 'football', 'superman', 'trustno1',
        '1234567890', '1234567', '123123', 'welcome123', 'password1', 'hello123'
    ];
    
    const lowerPassword = password.toLowerCase();
    
    // Check exact matches
    if (commonPasswords.includes(lowerPassword)) return true;
    
    // Check for common patterns
    if (commonPasswords.some(pattern => lowerPassword.includes(pattern))) return true;
    
    // Check for sequential patterns
    const sequentialPatterns = [
        'abcdefghijklmnopqrstuvwxyz',
        'zyxwvutsrqponmlkjihgfedcba',
        '0123456789',
        '9876543210'
    ];
    
    for (let pattern of sequentialPatterns) {
        for (let i = 0; i < pattern.length - 3; i++) {
            const sub = pattern.substring(i, i + 4);
            if (lowerPassword.includes(sub)) return true;
        }
    }
    
    // Check for repeated characters
    if (/(.)\1{3,}/.test(password)) return true; // 4+ repeated chars
    
    return false;
};

/**
 * Hash password with bcrypt
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 12)
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password, saltRounds = 12) => {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if match
 */
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Calculate password entropy (measure of randomness)
 * @param {string} password 
 * @returns {number} - Entropy bits
 */
export const calculatePasswordEntropy = (password) => {
    let charset = 0;
    
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/[0-9]/.test(password)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
    
    if (charset === 0) return 0;
    
    const entropy = Math.log2(Math.pow(charset, password.length));
    return Math.round(entropy);
};

/**
 * Check if password meets minimum security requirements for backend
 */
export const meetsMinimumRequirements = (password) => {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password) &&
           /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) &&
           !isCommonPassword(password);
};

export default {
    validatePassword,
    hashPassword,
    comparePassword,
    calculatePasswordEntropy,
    meetsMinimumRequirements
};
