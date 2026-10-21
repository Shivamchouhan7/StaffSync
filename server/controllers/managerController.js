const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Get all managers (HR only)
// @route   GET /api/managers
// @access  Private/HR
const getManagers = async (req, res, next) => {
  try {
    const managers = await Manager.find()
      .populate('user', 'name email role isActive avatar')
      .populate({
        path: 'teamMembers',
        select: 'name email role isActive',
      });

    res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign team members to a manager (HR only)
// @route   POST /api/managers/:id/assign
// @access  Private/HR
const assignTeamMembers = async (req, res, next) => {
  try {
    const { employeeUserIds } = req.body; // array of User ObjectIds

    if (!Array.isArray(employeeUserIds)) {
      return res.status(400).json({
        success: false,
        message: 'employeeUserIds must be an array of user IDs.',
      });
    }

    const managerRecord = await Manager.findById(req.params.id);
    if (!managerRecord) {
      return res.status(404).json({
        success: false,
        message: 'Manager record not found.',
      });
    }

    // Add employees to manager record teamMembers
    managerRecord.teamMembers = Array.from(
      new Set([...managerRecord.teamMembers.map((id) => id.toString()), ...employeeUserIds])
    );
    await managerRecord.save();

    // Update Employee records to point manager to this manager's user id
    await Employee.updateMany(
      { user: { $in: employeeUserIds } },
      { $set: { manager: managerRecord.user } }
    );

    const updated = await Manager.findById(req.params.id)
      .populate('user', 'name email')
      .populate('teamMembers', 'name email');

    res.status(200).json({
      success: true,
      message: 'Team members assigned successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove team member from manager (HR only)
// @route   POST /api/managers/:id/remove
// @access  Private/HR
const removeTeamMember = async (req, res, next) => {
  try {
    const { employeeUserId } = req.body;

    const managerRecord = await Manager.findById(req.params.id);
    if (!managerRecord) {
      return res.status(404).json({
        success: false,
        message: 'Manager record not found.',
      });
    }

    managerRecord.teamMembers = managerRecord.teamMembers.filter(
      (id) => id.toString() !== employeeUserId.toString()
    );
    await managerRecord.save();

    await Employee.findOneAndUpdate(
      { user: employeeUserId, manager: managerRecord.user },
      { $set: { manager: null } }
    );

    res.status(200).json({
      success: true,
      message: 'Team member removed from manager successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current manager's assigned team members (Manager only)
// @route   GET /api/managers/my-team
// @access  Private/Manager
const getMyTeam = async (req, res, next) => {
  try {
    // Find manager record or find employees assigned directly
    const managerRecord = await Manager.findOne({ user: req.user._id });
    
    // An employee belongs to this manager if:
    // 1) Employee.manager == req.user._id OR
    // 2) user._id in managerRecord.teamMembers
    const teamUserIds = managerRecord ? managerRecord.teamMembers : [];

    const teamEmployees = await Employee.find({
      $or: [
        { manager: req.user._id },
        { user: { $in: teamUserIds } },
      ],
    }).populate('user', 'name email role isActive avatar');

    res.status(200).json({
      success: true,
      data: teamEmployees,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getManagers,
  assignTeamMembers,
  removeTeamMember,
  getMyTeam,
};
