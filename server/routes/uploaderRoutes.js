const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const {
  assignDocument,
  statusDocument,
  uploaderDocumentsGrouped,
} = require('../controllers/uploaderController');

router.post('/assign', auth, role('uploader'), assignDocument);
router.post('/status', auth, role('uploader'), statusDocument);
router.get('/uploader',auth, role('uploader'),uploaderDocumentsGrouped);

module.exports = router;
