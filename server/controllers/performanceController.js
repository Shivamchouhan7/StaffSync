const Performance = require('../models/Performance');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Notification = require('../models/Notification');

// @desc    Create a performance review record (Manager or HR)
// @route   POST /api/performance
// @access  Private (Manager or HR)
const createPerformanceReview = async (req, res, next) => {
  try {
    const {
      user: targetUserId,
      reviewPeriod,
      rating,
      feedback,
      goalsMet = 0,
      totalGoals = 0,
      keyAchievements = [],
      areasOfImprovement = [],
    } = req.body;

    // Check manager authorization if manager
    if (req.user.role === 'manager') {
      const emp = await Employee.findOne({ user: targetUserId });
      const managerRec = await Manager.findOne({ user: req.user._id });
      const isTeamMember =
        (emp && emp.manager && emp.manager.toString() === req.user._id.toString()) ||
        (managerRec && managerRec.teamMembers.some((m) => m.toString() === targetUserId.toString()));

      if (!isTeamMember) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only conduct performance reviews for members of your assigned team.',
        });
      }
    }

    const review = await Performance.create({
      user: targetUserId,
      reviewer: req.user._id,
      reviewPeriod,
      rating,
      feedback,
      goalsMet,
      totalGoals,
      keyAchievements,
      areasOfImprovement,
    });

    // Notify employee
    await Notification.create({
      recipient: targetUserId,
      title: 'New Performance Review',
      message: `A new performance review for ${reviewPeriod} has been published by ${req.user.name}.`,
      type: 'system',
      relatedId: review._id,
    });

    res.status(201).json({
      success: true,
      message: 'Performance review record created successfully.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team performance reviews (Manager only)
// @route   GET /api/performance/team
// @access  Private/Manager
const getTeamPerformance = async (req, res, next) => {
  try {
    const managerRecord = await Manager.findOne({ user: req.user._id });
    const teamUserIds = managerRecord ? managerRecord.teamMembers : [];

    const employeesAssigned = await Employee.find({
      $or: [{ manager: req.user._id }, { user: { $in: teamUserIds } }],
    }).select('user');

    const memberIds = employeesAssigned.map((e) => e.user);

    const reviews = await Performance.find({ user: { $in: memberIds } })
      .populate('user', 'name email role')
      .populate('reviewer', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my performance reviews (Employee / self)
// @route   GET /api/performance/me
// @access  Private
const getMyPerformance = async (req, res, next) => {
  try {
    const reviews = await Performance.find({ user: req.user._id })
      .populate('reviewer', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all performance reviews (HR only)
// @route   GET /api/performance
// @access  Private/HR
const getAllPerformance = async (req, res, next) => {
  try {
    const reviews = await Performance.find()
      .populate('user', 'name email role')
      .populate('reviewer', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPerformanceReview,
  getTeamPerformance,
  getMyPerformance,
  getAllPerformance,
};
