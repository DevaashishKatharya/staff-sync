const Employee = require('../models/Employee');
const User = require('../models/User');

// Generate next Employee ID (e.g. EMP-1010)
const generateEmployeeId = async () => {
  const lastEmp = await Employee.findOne().sort({ createdAt: -1 });
  if (!lastEmp || !lastEmp.employeeId) return 'EMP-1001';
  const match = lastEmp.employeeId.match(/\d+/);
  if (!match) return 'EMP-1001';
  const nextNum = parseInt(match[0], 10) + 1;
  return `EMP-${nextNum}`;
};

// @desc Get all employees with filtering & search
// @route GET /api/employees
const getAllEmployees = async (req, res, next) => {
  try {
    const { department, status, role, search } = req.query;
    const filter = {};

    if (department && department !== 'All') {
      filter.department = department;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (role && role !== 'All') {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(filter)
      .populate('manager', 'firstName lastName email designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single employee details
// @route GET /api/employees/:id
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('manager', 'firstName lastName email designation phone department')
      .populate('userRef', 'email role lastLogin');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create new employee & auto-provision user credentials
// @route POST /api/employees (HR only)
const createEmployee = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      role = 'employee',
      managerId,
      salary = 60000,
      address,
      emergencyContact,
      skills,
      password = 'password123',
    } = req.body;

    if (!firstName || !lastName || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firstName, lastName, email, department, and designation.',
      });
    }

    const existingEmp = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmp) {
      return res.status(400).json({
        success: false,
        message: `Employee with email ${email} already exists.`,
      });
    }

    const generatedId = await generateEmployeeId();

    const employee = new Employee({
      employeeId: generatedId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      department,
      designation,
      role,
      manager: managerId || null,
      salary: Number(salary),
      address: address || {},
      emergencyContact: emergencyContact || {},
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
      status: 'Active',
    });

    await employee.save();

    // Create linked User authentication credential
    const user = new User({
      email: email.toLowerCase(),
      password,
      role,
      employeeRef: employee._id,
    });
    await user.save();

    employee.userRef = user._id;
    await employee.save();

    res.status(201).json({
      success: true,
      message: `Employee ${employee.fullName} (${employee.employeeId}) created successfully.`,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update employee information
// @route PUT /api/employees/:id
const updateEmployee = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    let employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    // Role check: HR can update all fields. Employee can update phone, address, emergencyContact, skills.
    const isHR = req.user.role === 'hr';
    const isSelf = req.employee && req.employee._id.toString() === employeeId;

    if (!isHR && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to update your own profile.',
      });
    }

    const allowedUpdates = isHR
      ? [
          'firstName',
          'lastName',
          'email',
          'phone',
          'department',
          'designation',
          'role',
          'manager',
          'salary',
          'status',
          'address',
          'emergencyContact',
          'skills',
        ]
      : ['phone', 'address', 'emergencyContact', 'skills'];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'skills' && typeof req.body[field] === 'string') {
          employee[field] = req.body[field].split(',').map((s) => s.trim());
        } else {
          employee[field] = req.body[field];
        }
      }
    });

    await employee.save();

    // If role changed and user exists, sync User model role
    if (isHR && req.body.role && employee.userRef) {
      await User.findByIdAndUpdate(employee.userRef, { role: req.body.role });
    }

    const updated = await Employee.findById(employeeId).populate('manager', 'firstName lastName email designation');

    res.status(200).json({
      success: true,
      message: 'Employee details updated successfully.',
      employee: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete employee (HR only)
// @route DELETE /api/employees/:id
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    // Remove user account as well
    if (employee.userRef) {
      await User.findByIdAndDelete(employee.userRef);
    }
    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Employee ${employee.fullName} (${employee.employeeId}) deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get department statistics summary
// @route GET /api/employees/departments/summary
const getDepartmentsSummary = async (req, res, next) => {
  try {
    const summary = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          totalEmployees: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] },
          },
          avgSalary: { $avg: '$salary' },
        },
      },
      {
        $project: {
          department: '$_id',
          totalEmployees: 1,
          activeCount: 1,
          avgSalary: { $round: ['$avgSalary', 0] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      departments: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartmentsSummary,
};
