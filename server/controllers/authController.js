const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc Login user & return token
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('employeeRef');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employee: user.employeeRef,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current authenticated user profile
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'employeeRef',
      populate: { path: 'manager', select: 'firstName lastName designation email' },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employee: user.employeeRef,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Demo quick login switcher for HR, Manager, and Employee
// @route POST /api/auth/demo-switch
const quickLogin = async (req, res, next) => {
  try {
    const { role } = req.body; // 'hr', 'manager', 'employee'
    let query = {};

    if (role === 'hr') {
      query = { role: 'hr' };
    } else if (role === 'manager') {
      query = { role: 'manager' };
    } else {
      query = { role: 'employee' };
    }

    let user = await User.findOne(query).populate('employeeRef');

    // If no user found and database is completely empty, auto-seed demo records on demand
    if (!user) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Auth] Database is empty. Auto-seeding initial demo data...');
        const seedData = require('../seeds/seedData');
        await seedData();
        user = await User.findOne(query).populate('employeeRef');
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo user with role '${role}' not found. Please ensure database seed data is loaded via /api/seed.`,
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: `Switched to ${role.toUpperCase()} role demo account.`,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employee: user.employeeRef,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  quickLogin,
};
