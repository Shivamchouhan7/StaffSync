const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get HR Dashboard metrics and analytics
// @route   GET /api/dashboard/hr
// @access  Private/HR
const getHRStats = async (req, res, next) => {
  try {
    const today = getTodayDateString();

    const [
      totalEmployees,
      totalManagers,
      activeEmployees,
      pendingLeaves,
      todayAttendance,
      announcementsCount,
      activeTrainingsCount,
      departmentStats,
    ] = await Promise.all([
      Employee.countDocuments(),
      Manager.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      Leave.countDocuments({ status: 'pending' }),
      Attendance.find({ date: today }),
      Announcement.countDocuments(),
      Training.countDocuments({ status: { $in: ['upcoming', 'in_progress'] } }),
      Employee.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Attendance breakdown for today
    const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
    const lateCount = todayAttendance.filter((a) => a.status === 'late').length;
    const halfDayCount = todayAttendance.filter((a) => a.status === 'half_day').length;
    const absentCount = Math.max(0, activeEmployees - todayAttendance.length);

    // Recent 5 pending leave requests
    const recentLeaves = await Leave.find({ status: 'pending' })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent announcements
    const recentAnnouncements = await Announcement.find()
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        totalManagers,
        activeEmployees,
        pendingLeaves,
        announcementsCount,
        activeTrainingsCount,
        attendance: {
          totalMarked: todayAttendance.length,
          present: presentCount,
          late: lateCount,
          halfDay: halfDayCount,
          absent: absentCount,
        },
      },
      departmentDistribution: departmentStats.map((d) => ({
        department: d._id || 'Unassigned',
        count: d.count,
      })),
      recentLeaves,
      recentAnnouncements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Manager Dashboard metrics
// @route   GET /api/dashboard/manager
// @access  Private/Manager
const getManagerStats = async (req, res, next) => {
  try {
    const today = getTodayDateString();

    const managerRecord = await Manager.findOne({ user: req.user._id });
    const teamUserIdsFromRecord = managerRecord ? managerRecord.teamMembers : [];

    const employeesAssigned = await Employee.find({
      $or: [{ manager: req.user._id }, { user: { $in: teamUserIdsFromRecord } }],
    }).populate('user', 'name email role isActive avatar');

    const memberUserIds = employeesAssigned.map((e) => e.user._id);

    const [todayAttendance, teamPendingLeaves, teamTrainings] = await Promise.all([
      Attendance.find({ date: today, user: { $in: memberUserIds } }).populate('user', 'name email'),
      Leave.find({ user: { $in: memberUserIds }, status: 'pending' }).populate('user', 'name email'),
      Training.find({
        $or: [
          { createdBy: req.user._id },
          { 'enrolledUsers.user': { $in: memberUserIds } },
        ],
      }).limit(5),
    ]);

    const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
    const lateCount = todayAttendance.filter((a) => a.status === 'late').length;
    const absentCount = Math.max(0, employeesAssigned.length - todayAttendance.length);

    res.status(200).json({
      success: true,
      stats: {
        teamSize: employeesAssigned.length,
        todayAttendanceCount: todayAttendance.length,
        pendingLeavesCount: teamPendingLeaves.length,
        trainingsCount: teamTrainings.length,
        attendance: {
          present: presentCount,
          late: lateCount,
          absent: absentCount,
        },
      },
      teamMembers: employeesAssigned,
      teamPendingLeaves,
      todayAttendance,
      teamTrainings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee Dashboard metrics
// @route   GET /api/dashboard/employee
// @access  Private
const getEmployeeStats = async (req, res, next) => {
  try {
    const today = getTodayDateString();

    const [todayAttendance, recentLeaves, activeAnnouncements, upcomingTrainings] =
      await Promise.all([
        Attendance.findOne({ user: req.user._id, date: today }),
        Leave.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
        Announcement.find({ targetRole: { $in: ['all', 'employee'] } })
          .sort({ isPinned: -1, createdAt: -1 })
          .limit(4),
        Training.find({
          status: { $in: ['upcoming', 'in_progress'] },
        }).limit(4),
      ]);

    // Count leaves approved this year
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const approvedLeavesCount = await Leave.countDocuments({
      user: req.user._id,
      status: 'approved',
      startDate: { $gte: startOfYear },
    });

    const pendingLeavesCount = recentLeaves.filter((l) => l.status === 'pending').length;

    // Monthly attendance count
    const currentMonthPrefix = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const monthlyAttendanceCount = await Attendance.countDocuments({
      user: req.user._id,
      date: { $regex: `^${currentMonthPrefix}` },
    });

    res.status(200).json({
      success: true,
      todayAttendance,
      stats: {
        monthlyAttendanceDays: monthlyAttendanceCount,
        approvedLeavesThisYear: approvedLeavesCount,
        pendingLeavesCount,
        isCheckedInToday: !!todayAttendance,
        isCheckedOutToday: !!(todayAttendance && todayAttendance.checkOut),
      },
      recentLeaves,
      activeAnnouncements,
      upcomingTrainings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHRStats,
  getManagerStats,
  getEmployeeStats,
};
