import jwt from 'jsonwebtoken';

// Middleware to check if user is authenticated
export const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Invalid token.'
        });
    }
};

// Middleware to check if user is admin
export const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. User not authenticated.'
        });
    }

    // In a real app, you might have an 'admin' role or specific permissions
    // For now, we'll assume any authenticated user can access admin routes
    // In production, you'd check: req.user.role === 'admin' or specific permissions
    next();
};

export default {
    protect,
    adminOnly
};
