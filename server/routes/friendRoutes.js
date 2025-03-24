const express = require('express');
const router = express.Router();
const { sendFriendRequest, getFriendRequests, respondToFriendRequest } = require('../controllers/friendController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/request', verifyToken, sendFriendRequest);
router.get('/requests', verifyToken, getFriendRequests);
router.put('/requests/:requestId', verifyToken, respondToFriendRequest);

module.exports = router;
