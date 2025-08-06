const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const multer = require('multer');
const upload = multer();

const {
  uploadDocument,
  getAssignedDocs,
  signDocument,
  verifyDocument,
  getUploaderDocumentsGrouped,
  getSignerDocumentsGrouped,
} = require('../controllers/documentController');

router.post('/upload', auth, role('uploader'), upload.single('file'), uploadDocument);
router.post('/verify', auth, role('uploader'), verifyDocument);
router.get('/uploader',auth, role('uploader'),getUploaderDocumentsGrouped);

router.get('/assigned', auth, role('signer'), getAssignedDocs);
router.post('/sign', auth, role('signer'), signDocument);
router.get('/signer',auth,role('signer'),getSignerDocumentsGrouped);

module.exports = router;
