const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'staffsync_jwt_secret_dev_key_2026';

// Verify JWT token in Authorization header
const verifyToken = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).populate('employeeRef');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The token belongs to a user that no longer exists.',
      });
    }

    req.user = user;
    req.employee = user.employeeRef;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message,
    });
  }
};

// Role-based access control middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role || 'Guest'}' is not authorized to access this resource. Required role(s): [${allowedRoles.join(', ')}].`,
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
  JWT_SECRET,
};
