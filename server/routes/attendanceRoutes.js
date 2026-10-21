const express = require('express');
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/me', protect, getMyAttendance);
router.get('/team', protect, authorize('manager'), getTeamAttendance);
router.get('/', protect, authorize('hr'), getAllAttendance);

module.exports = router;
