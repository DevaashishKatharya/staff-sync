const express = require('express');
const router = express.Router();
const {
  getHRDashboardMetrics,
  getManagerDashboardMetrics,
  getEmployeeDashboardMetrics,
} = require('../controllers/reportController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.get('/hr-metrics', authorizeRoles('hr'), getHRDashboardMetrics);
router.get('/manager-metrics', authorizeRoles('manager', 'hr'), getManagerDashboardMetrics);
router.get('/employee-metrics', getEmployeeDashboardMetrics);

module.exports = router;
