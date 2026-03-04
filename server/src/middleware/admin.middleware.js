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

    // Enforce admin role in production by checking the token payload
    const isAdmin = req.user?.role === 'admin';
    // If you want to support an admin flag in the payload, adjust accordingly.
    if (!isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden. Admins only.'
        });
    }
    next();
};

export default {
    protect,
    adminOnly
};
