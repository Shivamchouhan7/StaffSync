const express = require('express');
const { body } = require('express-validator');
const {
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  enrollTraining,
  updateEnrollment,
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const trainingValidation = [
  body('title').trim().notEmpty().withMessage('Training title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('trainer').trim().notEmpty().withMessage('Trainer name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  validate,
];

router.get('/', protect, getTrainings);
router.get('/:id', protect, getTrainingById);
router.post('/', protect, authorize('hr', 'manager'), trainingValidation, createTraining);
router.put('/:id', protect, authorize('hr', 'manager'), updateTraining);
router.post('/:id/enroll', protect, enrollTraining);
router.patch('/:id/enrollment/:userId', protect, authorize('hr', 'manager'), updateEnrollment);

module.exports = router;
