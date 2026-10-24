const express = require('express');
const router = express.Router();
const User = require('../models/User');
const seedData = require('../seeds/seedData');

// @desc Seed database with demo data (idempotent, supports ?force=true)
// @route GET /api/seed or POST /api/seed
const handleSeed = async (req, res, next) => {
  try {
    const isForce = req.query.force === 'true' || req.body?.force === true;
    const existingUsers = await User.countDocuments();

    if (existingUsers > 0 && !isForce) {
      return res.status(200).json({
        success: true,
        message: `Database already populated (${existingUsers} users found). Add '?force=true' or { "force": true } to re-seed.`,
        usersCount: existingUsers,
        demoAccounts: [
          { role: 'hr', email: 'hr@staffsync.com', password: 'password123' },
          { role: 'manager', email: 'manager@staffsync.com', password: 'password123' },
          { role: 'employee', email: 'alex.rivera@staffsync.com', password: 'password123' },
        ],
      });
    }

    console.log('[API Seeder] Running database seed...');
    await seedData();

    res.status(200).json({
      success: true,
      message: 'StaffSync database successfully populated with initial HRM demo records!',
      demoAccounts: [
        { role: 'hr', email: 'hr@staffsync.com', password: 'password123' },
        { role: 'manager', email: 'manager@staffsync.com', password: 'password123' },
        { role: 'employee', email: 'alex.rivera@staffsync.com', password: 'password123' },
      ],
    });
  } catch (error) {
    next(error);
  }
};

router.get('/', handleSeed);
router.post('/', handleSeed);

module.exports = router;
