const express = require('express');
const router = express.Router();
const {
  punchAttendance,
  getMyAttendance,
  getAllAttendance,
} = require('../controllers/attendanceController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.post('/punch', punchAttendance);
router.get('/my', getMyAttendance);
router.get('/', authorizeRoles('hr', 'manager'), getAllAttendance);

module.exports = router;
