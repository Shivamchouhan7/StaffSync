const express = require('express');
const {
  getHRStats,
  getManagerStats,
  getEmployeeStats,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/hr', protect, authorize('hr'), getHRStats);
router.get('/manager', protect, authorize('manager'), getManagerStats);
router.get('/employee', protect, getEmployeeStats);

module.exports = router;
