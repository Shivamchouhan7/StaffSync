const express = require('express');
const { body } = require('express-validator');
const {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  reviewLeaveRequest,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const leaveValidation = [
  body('leaveType')
    .isIn(['annual', 'sick', 'casual', 'maternity', 'paternity', 'unpaid', 'other'])
    .withMessage('Valid leave type is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
  validate,
];

router.post('/', protect, leaveValidation, applyLeave);
router.get('/me', protect, getMyLeaves);
router.get('/team', protect, authorize('manager'), getTeamLeaves);
router.get('/', protect, authorize('hr'), getAllLeaves);
router.patch('/:id/status', protect, authorize('hr', 'manager'), reviewLeaveRequest);
router.delete('/:id', protect, cancelLeave);

module.exports = router;
