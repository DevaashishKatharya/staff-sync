const Employee = require('../models/Employee');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const TrainingProgram = require('../models/TrainingProgram');
const { formatDateStr } = require('./attendanceController');

// @desc Get HR Dashboard aggregated KPIs & metrics
// @route GET /api/reports/hr-metrics
const getHRDashboardMetrics = async (req, res, next) => {
  try {
    const todayStr = formatDateStr();

    // Headcount stats
    const totalEmployees = await Employee.countDocuments({ status: { $ne: 'Inactive' } });
    const activeEmployees = await Employee.countDocuments({ status: 'Active' });
    const onLeaveEmployees = await Employee.countDocuments({ status: 'On Leave' });

    // Today's attendance
    const todayAttendance = await Attendance.find({ date: todayStr });
    const presentToday = todayAttendance.filter((a) => ['Present', 'Late'].includes(a.status)).length;
    const lateToday = todayAttendance.filter((a) => a.status === 'Late').length;
    const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

    // Leave stats
    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'Pending' });
    const approvedLeavesThisMonth = await LeaveRequest.countDocuments({
      status: 'Approved',
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    });

    // Department breakdown
    const departmentBreakdown = await Employee.aggregate([
      { $match: { status: { $ne: 'Inactive' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // Recent 5 leave requests
    const recentLeaves = await LeaveRequest.find()
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent announcements
    const recentAnnouncements = await Announcement.find()
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(3);

    // Training summary
    const totalTrainings = await TrainingProgram.countDocuments();

    res.status(200).json({
      success: true,
      metrics: {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        presentToday,
        lateToday,
        attendanceRate,
        pendingLeaves,
        approvedLeavesThisMonth,
        totalTrainings,
      },
      departmentBreakdown,
      recentLeaves,
      recentAnnouncements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Manager Dashboard metrics for team oversight
// @route GET /api/reports/manager-metrics
const getManagerDashboardMetrics = async (req, res, next) => {
  try {
    const todayStr = formatDateStr();
    const managerEmpId = req.employee ? req.employee._id : null;
    const managerDept = req.employee ? req.employee.department : 'Engineering';

    // Team members: either managed by this manager or in same department
    const teamMembers = await Employee.find({
      $or: [{ manager: managerEmpId }, { department: managerDept }],
      status: { $ne: 'Inactive' },
    }).select('firstName lastName employeeId designation email status department avatar');

    const teamMemberIds = teamMembers.map((m) => m._id);

    // Pending leaves for this team
    const pendingLeaves = await LeaveRequest.find({
      employee: { $in: teamMemberIds },
      status: 'Pending',
    })
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort({ createdAt: -1 });

    // Team attendance today
    const teamAttendanceToday = await Attendance.find({
      employee: { $in: teamMemberIds },
      date: todayStr,
    });

    const presentCount = teamAttendanceToday.filter((a) => ['Present', 'Late'].includes(a.status)).length;

    // Training programs created by or involving team
    const teamTrainings = await TrainingProgram.find({
      $or: [{ createdBy: managerEmpId }, { 'enrolledEmployees.employee': { $in: teamMemberIds } }],
    })
      .populate('enrolledEmployees.employee', 'firstName lastName employeeId department')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      metrics: {
        teamSize: teamMembers.length,
        teamPresentToday: presentCount,
        teamAttendanceRate:
          teamMembers.length > 0 ? Math.round((presentCount / teamMembers.length) * 100) : 0,
        pendingLeavesCount: pendingLeaves.length,
        activeTrainingsCount: teamTrainings.length,
      },
      pendingLeaves,
      teamMembers,
      teamTrainings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Employee Dashboard personal metrics
// @route GET /api/reports/employee-metrics
const getEmployeeDashboardMetrics = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found.',
      });
    }

    const todayStr = formatDateStr();
    const empId = req.employee._id;

    // Today's attendance punch
    const todayAttendance = await Attendance.findOne({
      employee: empId,
      date: todayStr,
    });

    // Leaves stats
    const leaves = await LeaveRequest.find({ employee: empId });
    const approvedDays = leaves
      .filter((l) => l.status === 'Approved')
      .reduce((acc, curr) => acc + curr.daysCount, 0);

    const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

    // Assigned training programs
    const enrolledTrainings = await TrainingProgram.find({
      'enrolledEmployees.employee': empId,
    }).populate('createdBy', 'firstName lastName');

    const formattedTrainings = enrolledTrainings.map((p) => {
      const myEnrollment = p.enrolledEmployees.find((e) => e.employee.toString() === empId.toString());
      return {
        _id: p._id,
        title: p.title,
        category: p.category,
        instructor: p.instructor,
        duration: p.duration,
        startDate: p.startDate,
        endDate: p.endDate,
        myProgress: myEnrollment ? myEnrollment.progress : 0,
        myStatus: myEnrollment ? myEnrollment.status : 'Not Started',
      };
    });

    // Recent announcements
    const announcements = await Announcement.find({
      $or: [{ targetDepartment: 'All' }, { targetDepartment: req.employee.department }],
    })
      .populate('author', 'firstName lastName designation')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      metrics: {
        totalLeavesTaken: approvedDays,
        allocatedAnnualAllowance: 24,
        remainingLeaveBalance: Math.max(0, 24 - approvedDays),
        pendingLeavesCount: pendingLeaves.length,
        enrolledTrainingsCount: enrolledTrainings.length,
        completedTrainingsCount: formattedTrainings.filter((t) => t.myStatus === 'Completed').length,
      },
      todayAttendance,
      recentLeaves: leaves.slice(0, 5),
      trainings: formattedTrainings,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHRDashboardMetrics,
  getManagerDashboardMetrics,
  getEmployeeDashboardMetrics,
};
