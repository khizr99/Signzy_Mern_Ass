const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUserById);

module.exports = router;
