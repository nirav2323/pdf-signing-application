const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { uploadFile } = require('../controllers/fileController');
const multer = require('multer');
const upload = multer();

router.post('/upload', auth, upload.single('file'), uploadFile);
module.exports = router;
