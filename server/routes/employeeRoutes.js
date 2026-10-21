const express = require('express');
const { body } = require('express-validator');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  updateMyProfile,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const employeeValidation = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  validate,
];

// Current user profile update
router.put('/me/profile', protect, updateMyProfile);

// HR operations
router.get('/', protect, authorize('hr'), getEmployees);
router.post('/', protect, authorize('hr'), employeeValidation, createEmployee);
router.get('/:id', protect, getEmployeeById);
router.put('/:id', protect, authorize('hr'), updateEmployee);
router.patch('/:id/status', protect, authorize('hr'), toggleEmployeeStatus);

module.exports = router;
