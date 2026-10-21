const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Notification = require('../models/Notification');

// Helper to get formatted current date YYYY-MM-DD
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Check-in attendance for today (Server-generated timestamp)
// @route   POST /api/attendance/check-in
// @access  Private (Employee/Manager/HR)
const checkIn = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const now = new Date();

    // Check if user already checked in today
    const existing = await Attendance.findOne({
      user: req.user._id,
      date: today,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Attendance has already been marked for today. Duplicate check-ins are not permitted.',
        attendance: existing,
      });
    }

    // Determine status (if checking in after 09:30 AM, mark as late)
    let status = 'present';
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours > 9 || (hours === 9 && minutes > 30)) {
      status = 'late';
    }

    const attendance = await Attendance.create({
      user: req.user._id,
      date: today,
      checkIn: now,
      status,
      notes: req.body.notes || '',
    });

    res.status(201).json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString()}`,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-out attendance for today
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const now = new Date();

    const attendance = await Attendance.findOne({
      user: req.user._id,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today. You must check in before checking out.',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out for today.',
        attendance,
      });
    }

    // Calculate work hours
    const diffMs = now.getTime() - attendance.checkIn.getTime();
    const diffHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    attendance.checkOut = now;
    attendance.workHours = diffHours;

    // If worked less than 4 hours, mark as half_day
    if (diffHours < 4 && attendance.status !== 'late') {
      attendance.status = 'half_day';
    }

    if (req.body.notes) {
      attendance.notes = `${attendance.notes ? attendance.notes + ' | ' : ''}${req.body.notes}`;
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully at ${now.toLocaleTimeString()}. Total work hours: ${diffHours}h`,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's attendance history
// @route   GET /api/attendance/me
// @access  Private
const getMyAttendance = async (req, res, next) => {
  try {
    const { month, year, page = 1, limit = 31 } = req.query;

    const query = { user: req.user._id };

    if (month && year) {
      const monthPadded = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${monthPadded}` };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get today's attendance if exists
    const today = getTodayDateString();
    const todayRecord = await Attendance.findOne({ user: req.user._id, date: today });

    res.status(200).json({
      success: true,
      today: todayRecord,
      data: records,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team attendance history (Manager only)
// @route   GET /api/attendance/team
// @access  Private/Manager
const getTeamAttendance = async (req, res, next) => {
  try {
    const { date, status, page = 1, limit = 20 } = req.query;

    // Get assigned team user IDs
    const managerRecord = await Manager.findOne({ user: req.user._id });
    const teamMembersFromRecord = managerRecord ? managerRecord.teamMembers : [];

    const employeesAssigned = await Employee.find({
      $or: [{ manager: req.user._id }, { user: { $in: teamMembersFromRecord } }],
    }).select('user');

    const teamUserIds = employeesAssigned.map((e) => e.user);

    const query = { user: { $in: teamUserIds } };
    if (date) query.date = date;
    if (status && status !== 'All') query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('user', 'name email role')
      .sort({ date: -1, checkIn: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization-wide attendance (HR only)
// @route   GET /api/attendance
// @access  Private/HR
const getAllAttendance = async (req, res, next) => {
  try {
    const { date, status, department, page = 1, limit = 20 } = req.query;

    const query = {};
    if (date) query.date = date;
    if (status && status !== 'All') query.status = status;

    if (department && department !== 'All') {
      const emps = await Employee.find({ department }).select('user');
      const userIds = emps.map((e) => e.user);
      query.user = { $in: userIds };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('user', 'name email role')
      .sort({ date: -1, checkIn: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
};
