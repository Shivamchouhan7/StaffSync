const express = require('express');
const { body } = require('express-validator');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const announcementValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  validate,
];

router.get('/', protect, getAnnouncements);
router.post('/', protect, authorize('hr'), announcementValidation, createAnnouncement);
router.put('/:id', protect, authorize('hr'), updateAnnouncement);
router.delete('/:id', protect, authorize('hr'), deleteAnnouncement);

module.exports = router;
