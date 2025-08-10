const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { getAllSigners } = require('../controllers/userController');

router.get('/signers', auth, role('uploader'), getAllSigners);
module.exports = router;
