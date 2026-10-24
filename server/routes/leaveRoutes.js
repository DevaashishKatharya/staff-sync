const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
} = require('../controllers/leaveController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', applyLeave);
router.get('/my', getMyLeaves);
router.get('/', authorizeRoles('hr', 'manager'), getAllLeaves);
router.put('/:id/review', authorizeRoles('hr', 'manager'), reviewLeave);

module.exports = router;
