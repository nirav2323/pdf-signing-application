const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const {
  signDocument,
  signerDocumentsGrouped,
} = require('../controllers/signerController');

router.post('/sign', auth, role('signer'), signDocument);
router.get('/signer',auth,role('signer'),signerDocumentsGrouped);

module.exports = router;
