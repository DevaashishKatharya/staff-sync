const TrainingProgram = require('../models/TrainingProgram');
const Employee = require('../models/Employee');

// @desc Get all training programs
// @route GET /api/training
const getAllPrograms = async (req, res, next) => {
  try {
    const { category, status, department } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (department && department !== 'All') filter.department = department;

    const programs = await TrainingProgram.find(filter)
      .populate('createdBy', 'firstName lastName designation role')
      .populate('enrolledEmployees.employee', 'firstName lastName employeeId department designation email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: programs.length,
      programs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single training program
// @route GET /api/training/:id
const getProgramById = async (req, res, next) => {
  try {
    const program = await TrainingProgram.findById(req.params.id)
      .populate('createdBy', 'firstName lastName designation role email')
      .populate('enrolledEmployees.employee', 'firstName lastName employeeId department designation email');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.',
      });
    }

    res.status(200).json({
      success: true,
      program,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create training program (Manager or HR)
// @route POST /api/training
const createProgram = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      instructor,
      department = 'All',
      duration = '8 Hours',
      startDate,
      endDate,
      assignedEmployeeIds = [],
    } = req.body;

    if (!title || !description || !instructor || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, instructor, startDate, and endDate.',
      });
    }

    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'Creator profile not found.',
      });
    }

    // Build enrolled list
    const enrolledEmployees = Array.isArray(assignedEmployeeIds)
      ? assignedEmployeeIds.map((empId) => ({
          employee: empId,
          enrolledAt: new Date(),
          progress: 0,
          status: 'Not Started',
        }))
      : [];

    const program = new TrainingProgram({
      title,
      description,
      category: category || 'Engineering & Tech',
      instructor,
      department,
      duration,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: req.employee._id,
      enrolledEmployees,
    });

    await program.save();

    const populated = await TrainingProgram.findById(program._id)
      .populate('createdBy', 'firstName lastName designation role')
      .populate('enrolledEmployees.employee', 'firstName lastName employeeId department designation email');

    res.status(201).json({
      success: true,
      message: 'Training program created and assigned successfully.',
      program: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Assign employees to an existing training program (Manager or HR)
// @route POST /api/training/:id/assign
const assignEmployees = async (req, res, next) => {
  try {
    const { employeeIds } = req.body; // array of IDs
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of employeeIds to enroll.',
      });
    }

    const program = await TrainingProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.',
      });
    }

    const existingIds = program.enrolledEmployees.map((e) => e.employee.toString());

    employeeIds.forEach((empId) => {
      if (!existingIds.includes(empId.toString())) {
        program.enrolledEmployees.push({
          employee: empId,
          enrolledAt: new Date(),
          progress: 0,
          status: 'Not Started',
        });
      }
    });

    await program.save();

    const updated = await TrainingProgram.findById(program._id)
      .populate('createdBy', 'firstName lastName designation')
      .populate('enrolledEmployees.employee', 'firstName lastName employeeId department designation email');

    res.status(200).json({
      success: true,
      message: 'Employees enrolled successfully.',
      program: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update employee progress in training program
// @route PUT /api/training/:id/progress
const updateProgress = async (req, res, next) => {
  try {
    const { employeeId, progress } = req.body;
    const targetEmployeeId = employeeId || (req.employee ? req.employee._id.toString() : null);

    if (!targetEmployeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required.',
      });
    }

    const numericProgress = Math.min(100, Math.max(0, Number(progress) || 0));

    const program = await TrainingProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.',
      });
    }

    const enrollment = program.enrolledEmployees.find(
      (e) => e.employee.toString() === targetEmployeeId.toString()
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Employee is not enrolled in this training program.',
      });
    }

    enrollment.progress = numericProgress;
    if (numericProgress === 100) {
      enrollment.status = 'Completed';
      enrollment.completedAt = new Date();
    } else if (numericProgress > 0) {
      enrollment.status = 'In Progress';
    } else {
      enrollment.status = 'Not Started';
    }

    await program.save();

    res.status(200).json({
      success: true,
      message: `Progress updated to ${numericProgress}%.`,
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPrograms,
  getProgramById,
  createProgram,
  assignEmployees,
  updateProgress,
};
