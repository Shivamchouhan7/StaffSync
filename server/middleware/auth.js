const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Manager = require('../models/Manager');
const Employee = require('../models/Employee');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.',
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

// Verify if manager has authority over a specific employee
const verifyManagerTeamAccess = async (managerUserId, targetUserId) => {
  // Check if target has manager assigned
  const employee = await Employee.findOne({ user: targetUserId });
  if (employee && employee.manager && employee.manager.toString() === managerUserId.toString()) {
    return true;
  }

  // Check if target is in Manager's teamMembers list
  const managerRecord = await Manager.findOne({ user: managerUserId });
  if (managerRecord && managerRecord.teamMembers.some((m) => m.toString() === targetUserId.toString())) {
    return true;
  }

  return false;
};

module.exports = {
  protect,
  authorize,
  verifyManagerTeamAccess,
};
