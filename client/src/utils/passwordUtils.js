// Password validation and strength calculation utilities

/**
 * Check password strength and return score + feedback
 * @param {string} password - The password to evaluate
 * @returns {Object} - { score: number (0-100), strength: string, requirements: array, isValid: boolean }
 */
export const checkPasswordStrength = (password) => {
    const requirements = {
        minLength: password.length >= 8,
        maxLength: password.length <= 128,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        noSpaces: !/\s/.test(password),
        noCommonPatterns: !isCommonPassword(password)
    };

    let score = 0;
    const feedback = [];

    // Length scoring
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 10;

    // Character variety scoring
    if (requirements.hasUppercase) score += 10;
    if (requirements.hasLowercase) score += 10;
    if (requirements.hasNumber) score += 10;
    if (requirements.hasSpecialChar) score += 15;

    // Bonus for mixed variety
    const variety = [
        requirements.hasUppercase,
        requirements.hasLowercase,
        requirements.hasNumber,
        requirements.hasSpecialChar
    ].filter(Boolean).length;
    
    if (variety >= 3) score += 10;
    if (variety === 4) score += 10;

    // Deductions for weak patterns
    if (!requirements.noCommonPatterns) {
        score -= 20;
        feedback.push('Avoid common passwords and patterns');
    }
    
    if (password.length < 8) {
        feedback.push('Password must be at least 8 characters');
    }

    // Cap score at 100
    score = Math.max(0, Math.min(100, score));

    // Determine strength label
    let strength = 'weak';
    if (score >= 80) strength = 'strong';
    else if (score >= 60) strength = 'good';
    else if (score >= 40) strength = 'fair';

    return {
        score,
        strength,
        requirements,
        isValid: score >= 60 && requirements.minLength && requirements.maxLength,
        feedback: feedback.length > 0 ? feedback : getPositiveFeedback(requirements)
    };
};

/**
 * Check if password contains common patterns
 */
const isCommonPassword = (password) => {
    const commonPatterns = [
        '123456', 'password', 'qwerty', 'abc123', '111111', '12345678',
        'password123', 'admin123', 'welcome', 'monkey', 'letmein', 'sunshine',
        'princess', 'dragon', 'baseball', 'football', 'superman', 'trustno1'
    ];
    
    const lowerPassword = password.toLowerCase();
    
    // Check for common patterns
    if (commonPatterns.some(pattern => lowerPassword.includes(pattern))) {
        return true;
    }
    
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
 * Get positive feedback for good password features
 */
const getPositiveFeedback = (requirements) => {
    const feedback = [];
    if (requirements.hasUppercase && requirements.hasLowercase) {
        feedback.push('Good mix of uppercase and lowercase letters');
    }
    if (requirements.hasNumber) {
        feedback.push('Numbers add good variety');
    }
    if (requirements.hasSpecialChar) {
        feedback.push('Special characters strengthen your password');
    }
    return feedback.length > 0 ? feedback : ['Password meets basic requirements'];
};

/**
 * Validate password for form submission
 */
export const validatePassword = (password) => {
    const errors = [];
    
    if (!password || password.length === 0) {
        errors.push('Password is required');
    } else {
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (password.length > 128) {
            errors.push('Password must not exceed 128 characters');
        }
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
        if (/\s/.test(password)) {
            errors.push('Password must not contain spaces');
        }
        if (isCommonPassword(password)) {
            errors.push('Password is too common or predictable');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Get password requirements list for UI display
 */
export const getPasswordRequirements = () => [
    { label: 'At least 8 characters', key: 'minLength' },
    { label: 'At least one uppercase letter (A-Z)', key: 'hasUppercase' },
    { label: 'At least one lowercase letter (a-z)', key: 'hasLowercase' },
    { label: 'At least one number (0-9)', key: 'hasNumber' },
    { label: 'At least one special character (!@#$%^&*)', key: 'hasSpecialChar' },
    { label: 'No spaces', key: 'noSpaces' },
    { label: 'Not a common password', key: 'noCommonPatterns' }
];

/**
 * Calculate estimated time to crack password
 */
export const calculateCrackTime = (password) => {
    const length = password.length;
    let charset = 0;
    
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/[0-9]/.test(password)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
    
    const combinations = Math.pow(charset, length);
    const guessesPerSecond = 10000000000; // 10 billion guesses per second (high-end GPU)
    const seconds = combinations / guessesPerSecond;
    
    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    if (seconds < 315360000000) return `${Math.round(seconds / 3153600000)} centuries`;
    return 'Millions of years';
};

export default {
    checkPasswordStrength,
    validatePassword,
    getPasswordRequirements,
    calculateCrackTime
};
