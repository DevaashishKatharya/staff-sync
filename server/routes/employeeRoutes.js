const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartmentsSummary,
} = require('../controllers/employeeController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAllEmployees);
router.get('/departments/summary', getDepartmentsSummary);
router.get('/:id', getEmployeeById);
router.post('/', authorizeRoles('hr'), createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', authorizeRoles('hr'), deleteEmployee);

module.exports = router;
