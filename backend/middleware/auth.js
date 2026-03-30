const jwt = require('jsonwebtoken');

// Verify token
const auth = (req, res, next) => {
    // Check for token in header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const token = authHeader.split(' ')[1];
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_for_abc_mall');
        
        // Add user from payload
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};

// Verify Admin role
const adminAuth = (req, res, next) => {
    auth(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied: Requires Admin role' });
        }
    });
};

// Verify Shop Owner role
const shopOwnerAuth = (req, res, next) => {
    auth(req, res, () => {
        // Both Admin and Shop Owner can potentially access some shop routes, but let's restrict to shop owner for specific routes
        if (req.user && (req.user.role === 'shop_owner' || req.user.role === 'admin')) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied: Requires Shop Owner role' });
        }
    });
};

module.exports = { auth, adminAuth, shopOwnerAuth };
