const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Helper to format date as YYYY-MM-DD
const formatDateStr = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc Punch daily attendance (Check In or Check Out)
// @route POST /api/attendance/punch
const punchAttendance = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found for punch.',
      });
    }

    const todayStr = formatDateStr();
    const now = new Date();
    const { action, location = 'Office', notes = '' } = req.body; // action: 'check-in' or 'check-out'

    let attendance = await Attendance.findOne({
      employee: req.employee._id,
      date: todayStr,
    });

    if (action === 'check-in') {
      if (attendance && attendance.checkIn) {
        return res.status(400).json({
          success: false,
          message: 'You have already checked in today.',
          attendance,
        });
      }

      // Determine if Late (e.g., after 9:30 AM)
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isLate = hours > 9 || (hours === 9 && minutes > 30);
      const status = isLate ? 'Late' : 'Present';

      if (!attendance) {
        attendance = new Attendance({
          employee: req.employee._id,
          date: todayStr,
          checkIn: now,
          status,
          location,
          notes,
        });
      } else {
        attendance.checkIn = now;
        attendance.status = status;
        attendance.location = location;
        if (notes) attendance.notes = notes;
      }

      await attendance.save();

      return res.status(200).json({
        success: true,
        message: `Checked in successfully at ${now.toLocaleTimeString()} (${status}).`,
        attendance,
      });
    } else if (action === 'check-out') {
      if (!attendance || !attendance.checkIn) {
        return res.status(400).json({
          success: false,
          message: 'You must check in before you can check out.',
        });
      }

      if (attendance.checkOut) {
        return res.status(400).json({
          success: false,
          message: 'You have already checked out today.',
          attendance,
        });
      }

      attendance.checkOut = now;
      const diffMs = now.getTime() - new Date(attendance.checkIn).getTime();
      const hoursWorked = Math.max(0.1, Number((diffMs / (1000 * 60 * 60)).toFixed(2)));
      attendance.workHours = hoursWorked;

      if (hoursWorked < 4 && attendance.status !== 'Late') {
        attendance.status = 'Half-day';
      }

      if (notes) attendance.notes = (attendance.notes ? attendance.notes + ' | ' : '') + notes;

      await attendance.save();

      return res.status(200).json({
        success: true,
        message: `Checked out successfully at ${now.toLocaleTimeString()}. Logged ${hoursWorked} hours.`,
        attendance,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'check-in' or 'check-out'.",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Get logged-in employee's attendance history & today's status
// @route GET /api/attendance/my
const getMyAttendance = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found.',
      });
    }

    const todayStr = formatDateStr();
    const todayRecord = await Attendance.findOne({
      employee: req.employee._id,
      date: todayStr,
    });

    const records = await Attendance.find({ employee: req.employee._id })
      .sort({ date: -1 })
      .limit(30);

    const presentDays = records.filter((r) => ['Present', 'Late'].includes(r.status)).length;
    const totalRecorded = records.length || 1;
    const attendanceRate = Math.round((presentDays / totalRecorded) * 100);

    res.status(200).json({
      success: true,
      today: todayRecord,
      stats: {
        totalDaysLogged: records.length,
        presentDays,
        lateDays: records.filter((r) => r.status === 'Late').length,
        attendanceRate,
        averageHours: records.length
          ? (
              records.reduce((acc, r) => acc + (r.workHours || 0), 0) /
              (records.filter((r) => r.workHours > 0).length || 1)
            ).toFixed(1)
          : '0',
      },
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all attendance logs for HR / Manager
// @route GET /api/attendance
const getAllAttendance = async (req, res, next) => {
  try {
    const { date, department, status } = req.query;
    const targetDate = date || formatDateStr();

    let query = { date: targetDate };
    if (status && status !== 'All') {
      query.status = status;
    }

    let records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department designation email avatar')
      .sort({ checkIn: -1 });

    if (department && department !== 'All') {
      records = records.filter(
        (r) => r.employee && r.employee.department === department
      );
    }

    // High level summary for the given date
    const totalEmployees = await Employee.countDocuments({ status: { $ne: 'Inactive' } });
    const presentCount = records.filter((r) => ['Present', 'Late'].includes(r.status)).length;
    const lateCount = records.filter((r) => r.status === 'Late').length;
    const onLeaveCount = records.filter((r) => r.status === 'On Leave').length;
    const absentCount = Math.max(0, totalEmployees - presentCount - onLeaveCount);

    res.status(200).json({
      success: true,
      date: targetDate,
      summary: {
        totalEmployees,
        presentCount,
        lateCount,
        absentCount,
        onLeaveCount,
        attendanceRate: totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0,
      },
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  punchAttendance,
  getMyAttendance,
  getAllAttendance,
  formatDateStr,
};
