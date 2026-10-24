const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAnnouncements);
router.post('/', authorizeRoles('hr', 'manager'), createAnnouncement);
router.delete('/:id', deleteAnnouncement);

module.exports = router;
