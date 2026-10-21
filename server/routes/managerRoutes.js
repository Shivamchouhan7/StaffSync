const express = require('express');
const {
  getManagers,
  assignTeamMembers,
  removeTeamMember,
  getMyTeam,
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Manager viewing their own team
router.get('/my-team', protect, authorize('manager'), getMyTeam);

// HR managing managers and teams
router.get('/', protect, authorize('hr'), getManagers);
router.post('/:id/assign', protect, authorize('hr'), assignTeamMembers);
router.post('/:id/remove', protect, authorize('hr'), removeTeamMember);

module.exports = router;
