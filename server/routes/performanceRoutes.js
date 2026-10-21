const express = require('express');
const { body } = require('express-validator');
const {
  createPerformanceReview,
  getTeamPerformance,
  getMyPerformance,
  getAllPerformance,
} = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const reviewValidation = [
  body('user').isMongoId().withMessage('Valid employee user ID is required'),
  body('reviewPeriod').trim().notEmpty().withMessage('Review period is required'),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').trim().notEmpty().withMessage('Feedback is required'),
  validate,
];

router.post('/', protect, authorize('hr', 'manager'), reviewValidation, createPerformanceReview);
router.get('/me', protect, getMyPerformance);
router.get('/team', protect, authorize('manager'), getTeamPerformance);
router.get('/', protect, authorize('hr'), getAllPerformance);

module.exports = router;
