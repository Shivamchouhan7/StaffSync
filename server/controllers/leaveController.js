const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper to calculate days between two dates inclusive
const calculateDays = (start, end) => {
  const diffTime = Math.abs(new Date(end) - new Date(start));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid start and end dates.',
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'Leave end date cannot be earlier than start date.',
      });
    }

    const daysCount = calculateDays(start, end);

    const leave = await Leave.create({
      user: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason,
      status: 'pending',
    });

    // Notify assigned manager or HR
    const employee = await Employee.findOne({ user: req.user._id });
    if (employee && employee.manager) {
      await Notification.create({
        recipient: employee.manager,
        title: 'New Leave Request',
        message: `${req.user.name} submitted a ${leaveType} leave request for ${daysCount} day(s).`,
        type: 'leave',
        relatedId: leave._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's leave requests
// @route   GET /api/leaves/me
// @access  Private
const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team leave requests (Manager only)
// @route   GET /api/leaves/team
// @access  Private/Manager
const getTeamLeaves = async (req, res, next) => {
  try {
    const { status } = req.query;

    const managerRecord = await Manager.findOne({ user: req.user._id });
    const teamUserIdsFromRecord = managerRecord ? managerRecord.teamMembers : [];

    const employeesAssigned = await Employee.find({
      $or: [{ manager: req.user._id }, { user: { $in: teamUserIdsFromRecord } }],
    }).select('user');

    const teamUserIds = employeesAssigned.map((e) => e.user);

    const query = { user: { $in: teamUserIds } };
    if (status && status !== 'All') {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('user', 'name email role')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organization leave requests (HR only)
// @route   GET /api/leaves
// @access  Private/HR
const getAllLeaves = async (req, res, next) => {
  try {
    const { status, leaveType } = req.query;

    const query = {};
    if (status && status !== 'All') query.status = status;
    if (leaveType && leaveType !== 'All') query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate('user', 'name email role')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject leave request (HR or assigned Manager)
// @route   PATCH /api/leaves/:id/status
// @access  Private (HR or Manager)
const reviewLeaveRequest = async (req, res, next) => {
  try {
    const { status, reviewNotes = '' } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'.",
      });
    }

    const leave = await Leave.findById(req.params.id).populate('user', 'name email');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.',
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This leave request has already been ${leave.status}.`,
      });
    }

    // Role-based leave approval policy check:
    if (req.user.role === 'manager') {
      // Verify applicant belongs to manager's team
      const emp = await Employee.findOne({ user: leave.user._id });
      const managerRec = await Manager.findOne({ user: req.user._id });
      const isTeamMember =
        (emp && emp.manager && emp.manager.toString() === req.user._id.toString()) ||
        (managerRec && managerRec.teamMembers.some((m) => m.toString() === leave.user._id.toString()));

      if (!isTeamMember) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only approve or reject leave requests for members of your assigned team.',
        });
      }
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewNotes = reviewNotes;
    leave.reviewDate = new Date();

    await leave.save();

    // Create notification for applicant
    await Notification.create({
      recipient: leave.user._id,
      title: `Leave Request ${status.toUpperCase()}`,
      message: `Your ${leave.leaveType} leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} was ${status} by ${req.user.name}.${reviewNotes ? ` Notes: ${reviewNotes}` : ''}`,
      type: 'leave',
      relatedId: leave._id,
    });

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully.`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a pending leave request (Applicant)
// @route   DELETE /api/leaves/:id
// @access  Private
const cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.',
      });
    }

    if (leave.user.toString() !== req.user._id.toString() && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own pending leave requests.',
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave request that has already been ${leave.status}.`,
      });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully.',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  reviewLeaveRequest,
  cancelLeave,
};
