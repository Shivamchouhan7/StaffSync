const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev', {
    expiresIn: '7d',
  });
};

// Helper to generate unique employee ID
const generateEmployeeId = async () => {
  const count = await Employee.countDocuments();
  const nextNum = count + 1001;
  return `EMP-${nextNum}`;
};

// @desc    Register public user (EMPLOYEE ONLY)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'employee',
      department = 'General',
      designation,
      phone = '',
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      isActive: true,
    });

    const employeeId = await generateEmployeeId();

    const employee = await Employee.create({
      user: user._id,
      employeeId,
      department,
      designation: designation || (role === 'hr' ? 'HR Administrator' : role === 'manager' ? 'Manager' : 'Team Member'),
      phone,
    });

    let manager = null;
    if (role === 'manager') {
      manager = await Manager.create({
        user: user._id,
        department,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `Registration successful as ${role === 'hr' ? 'HR' : role.charAt(0).toUpperCase() + role.slice(1)}.`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      employee: {
        _id: employee._id,
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
      },
      manager: manager
        ? {
            _id: manager._id,
            department: manager.department,
          }
        : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Need password explicitly because select: false is on User schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an HR administrator.',
      });
    }

    const token = generateToken(user._id);

    // Fetch associated employee or manager profile
    let profile = null;
    if (user.role === 'employee') {
      profile = await Employee.findOne({ user: user._id }).populate('manager', 'name email');
    } else if (user.role === 'manager') {
      profile = await Manager.findOne({ user: user._id }).populate('teamMembers', 'name email');
    }

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user & profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'employee') {
      profile = await Employee.findOne({ user: user._id }).populate('manager', 'name email');
    } else if (user.role === 'manager') {
      profile = await Manager.findOne({ user: user._id }).populate('teamMembers', 'name email');
    }

    res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Secure initial setup for first HR administrator
// @route   POST /api/auth/setup-admin
// @access  Public (ONLY when 0 HR administrators exist)
const setupFirstAdmin = async (req, res, next) => {
  try {
    const hrCount = await User.countDocuments({ role: 'hr' });
    if (hrCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'HR Administrator already exists. Public administrator setup is disabled.',
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const hrUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'hr',
      isActive: true,
    });

    const employeeId = await generateEmployeeId();
    await Employee.create({
      user: hrUser._id,
      employeeId,
      department: 'Human Resources',
      designation: 'HR Administrator',
    });

    const token = generateToken(hrUser._id);

    res.status(201).json({
      success: true,
      message: 'Initial HR Administrator setup completed successfully.',
      token,
      user: {
        _id: hrUser._id,
        name: hrUser.name,
        email: hrUser.email,
        role: hrUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  setupFirstAdmin,
  updatePassword,
};
