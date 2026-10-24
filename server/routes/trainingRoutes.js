const express = require('express');
const router = express.Router();
const {
  getAllPrograms,
  getProgramById,
  createProgram,
  assignEmployees,
  updateProgress,
} = require('../controllers/trainingController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAllPrograms);
router.get('/:id', getProgramById);
router.post('/', authorizeRoles('hr', 'manager'), createProgram);
router.post('/:id/assign', authorizeRoles('hr', 'manager'), assignEmployees);
router.put('/:id/progress', updateProgress);

module.exports = router;
