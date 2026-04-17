const express = require('express');
const router = express.Router();
const { addScore, getLeaderboard } = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addScore);
router.get('/leaderboard/:game', getLeaderboard);

module.exports = router;