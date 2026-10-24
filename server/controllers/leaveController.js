const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

// Helper to calculate days difference
const calculateDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = Math.abs(e - s);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
};

// @desc Apply for leave (Employee)
// @route POST /api/leaves
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate, endDate, and reason.',
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date.',
      });
    }

    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found for this user account.',
      });
    }

    const daysCount = calculateDays(startDate, endDate);

    const leave = new LeaveRequest({
      employee: req.employee._id,
      leaveType: leaveType || 'Casual Leave',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      daysCount,
      reason,
      status: 'Pending',
    });

    await leave.save();
    const populated = await LeaveRequest.findById(leave._id).populate(
      'employee',
      'firstName lastName employeeId department designation'
    );

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      leave: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get logged in employee's leave records
// @route GET /api/leaves/my
const getMyLeaves = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found.',
      });
    }

    const leaves = await LeaveRequest.find({ employee: req.employee._id })
      .populate('reviewedBy', 'firstName lastName designation')
      .sort({ createdAt: -1 });

    // Calculate balances / summaries
    const approvedDays = leaves
      .filter((l) => l.status === 'Approved')
      .reduce((acc, curr) => acc + curr.daysCount, 0);

    const pendingCount = leaves.filter((l) => l.status === 'Pending').length;

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
      stats: {
        totalLeavesTaken: approvedDays,
        allocatedAnnualAllowance: 24,
        remainingBalance: Math.max(0, 24 - approvedDays),
        pendingApprovals: pendingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all leave requests (HR and Manager)
// @route GET /api/leaves
const getAllLeaves = async (req, res, next) => {
  try {
    const { status, department, employeeId } = req.query;
    let filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (employeeId) {
      filter.employee = employeeId;
    }

    let leaves = await LeaveRequest.find(filter)
      .populate('employee', 'firstName lastName employeeId department designation email phone')
      .populate('reviewedBy', 'firstName lastName designation')
      .sort({ createdAt: -1 });

    // If manager role, they can view team members or all if department matches
    if (department && department !== 'All') {
      leaves = leaves.filter(
        (l) => l.employee && l.employee.department === department
      );
    }

    // High level summary
    const summary = {
      pending: leaves.filter((l) => l.status === 'Pending').length,
      approved: leaves.filter((l) => l.status === 'Approved').length,
      rejected: leaves.filter((l) => l.status === 'Rejected').length,
      total: leaves.length,
    };

    res.status(200).json({
      success: true,
      count: leaves.length,
      summary,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Approve or Reject leave request (HR or Manager)
// @route PUT /api/leaves/:id/review
const reviewLeave = async (req, res, next) => {
  try {
    const { status, reviewerComments } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'.",
      });
    }

    const leave = await LeaveRequest.findById(req.params.id).populate('employee');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.',
      });
    }

    leave.status = status;
    leave.reviewerComments = reviewerComments || '';
    leave.reviewedBy = req.employee ? req.employee._id : null;
    leave.reviewedAt = new Date();

    await leave.save();

    // If approved and the leave dates encompass today, update employee status to 'On Leave'
    const today = new Date();
    if (status === 'Approved' && leave.employee) {
      if (today >= new Date(leave.startDate) && today <= new Date(leave.endDate)) {
        await Employee.findByIdAndUpdate(leave.employee._id, { status: 'On Leave' });
      }
    }

    const updated = await LeaveRequest.findById(leave._id)
      .populate('employee', 'firstName lastName employeeId department designation')
      .populate('reviewedBy', 'firstName lastName designation');

    res.status(200).json({
      success: true,
      message: `Leave request marked as ${status}.`,
      leave: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
};
