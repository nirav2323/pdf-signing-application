const express = require('express');
const router = express.Router();
const { signup, login, verifyToken } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify', verifyToken);
module.exports = router;
