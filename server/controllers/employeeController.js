const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');

// Helper to generate employee ID
const generateEmployeeId = async () => {
  const count = await Employee.countDocuments();
  return `EMP-${1001 + count}`;
};

// @desc    Get all employees with pagination, search, and filters (HR only)
// @route   GET /api/employees
// @access  Private/HR
const getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', status = '' } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter for employee
    const query = {};
    if (department && department !== 'All') {
      query.department = department;
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    let userQuery = {};
    if (search) {
      userQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    // Find users matching search if specified
    if (search) {
      const matchedUsers = await User.find(userQuery).select('_id');
      const userIds = matchedUsers.map((u) => u._id);
      query.$or = [
        { user: { $in: userIds } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('user', 'name email role isActive avatar')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: employees,
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

// @desc    Get single employee details
// @route   GET /api/employees/:id
// @access  Private (HR, assigned Manager, or the Employee themselves)
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'name email role isActive avatar')
      .populate('manager', 'name email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    // Authorization check:
    const isHR = req.user.role === 'hr';
    const isSelf = employee.user._id.toString() === req.user._id.toString();
    let isAssignedManager = false;

    if (req.user.role === 'manager' && employee.manager) {
      isAssignedManager = employee.manager._id.toString() === req.user._id.toString();
    }

    if (!isHR && !isSelf && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this employee record.',
      });
    }

    // Strip sensitive fields (salary) if not HR and not self
    const empObj = employee.toObject();
    if (!isHR) {
      delete empObj.salary;
    }

    res.status(200).json({
      success: true,
      data: empObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new employee / staff account (HR only)
// @route   POST /api/employees
// @access  Private/HR
const createEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'employee',
      department,
      designation,
      salary = 0,
      manager = null,
      phone = '',
      address = {},
      emergencyContact = {},
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
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
      designation,
      salary,
      manager: manager || null,
      phone,
      address,
      emergencyContact,
    });

    // If role is manager, also create Manager record
    if (role === 'manager') {
      await Manager.create({
        user: user._id,
        department,
        teamMembers: [],
      });
    }

    // If employee has a manager assigned, add employee to manager's team
    if (manager) {
      await Manager.findOneAndUpdate(
        { user: manager },
        { $addToSet: { teamMembers: user._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Employee record created successfully.',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee record (HR only)
// @route   PUT /api/employees/:id
// @access  Private/HR
const updateEmployee = async (req, res, next) => {
  try {
    const {
      name,
      department,
      designation,
      salary,
      manager,
      phone,
      address,
      emergencyContact,
      status,
      role,
    } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    const user = await User.findById(employee.user);
    if (user && name) {
      user.name = name;
      if (role && ['employee', 'manager', 'hr'].includes(role)) {
        user.role = role;
      }
      await user.save();
    }

    // Manage team assignment changes
    const previousManager = employee.manager;
    if (manager !== undefined && manager !== (previousManager ? previousManager.toString() : null)) {
      // Remove from old manager team
      if (previousManager) {
        await Manager.findOneAndUpdate(
          { user: previousManager },
          { $pull: { teamMembers: employee.user } }
        );
      }
      // Add to new manager team
      if (manager) {
        await Manager.findOneAndUpdate(
          { user: manager },
          { $addToSet: { teamMembers: employee.user } }
        );
      }
      employee.manager = manager || null;
    }

    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (salary !== undefined) employee.salary = salary;
    if (phone !== undefined) employee.phone = phone;
    if (address) employee.address = { ...employee.address, ...address };
    if (emergencyContact) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
    if (status) employee.status = status;

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee record updated successfully.',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate / Toggle active status of employee (HR only)
// @route   PATCH /api/employees/:id/status
// @access  Private/HR
const toggleEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    const user = await User.findById(employee.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Associated user account not found.',
      });
    }

    // Toggle active
    const newActiveState = !user.isActive;
    user.isActive = newActiveState;
    await user.save();

    employee.status = newActiveState ? 'active' : 'inactive';
    await employee.save();

    res.status(200).json({
      success: true,
      message: `Employee account ${newActiveState ? 'activated' : 'deactivated'} successfully.`,
      isActive: user.isActive,
      status: employee.status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee updates their own permitted profile fields
// @route   PUT /api/employees/me/profile
// @access  Private
const updateMyProfile = async (req, res, next) => {
  try {
    const { phone, address, emergencyContact, name } = req.body;

    const user = await User.findById(req.user._id);
    if (name && name.trim()) {
      user.name = name.trim();
      await user.save();
    }

    let employee = await Employee.findOne({ user: req.user._id });

    // If employee profile does not exist yet (e.g. for initial HR/Manager), create one
    if (!employee) {
      const employeeId = await generateEmployeeId();
      employee = await Employee.create({
        user: req.user._id,
        employeeId,
        department: req.user.role === 'hr' ? 'Human Resources' : 'General',
        designation: req.user.role.toUpperCase(),
      });
    }

    if (phone !== undefined) employee.phone = phone;
    if (address) employee.address = { ...employee.address, ...address };
    if (emergencyContact) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        profile: employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  updateMyProfile,
};
