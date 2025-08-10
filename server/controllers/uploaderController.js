const Document = require('../models/Document');
const User = require('../models/User');
const s3 = require('../utils/s3');

exports.assignDocument = async (req, res) => {
  const {signerId, title, signatureFields, originalUrl} = req.body;

  const signer = await User.findById(signerId);
  if (!signer) return res.status(404).json({ message: 'Signer not found' });
  const doc = await Document.create({
    title,
    originalUrl: originalUrl,
    uploader: req.user.userId,
    signer: signer.id,
    signatureFields: JSON.parse(signatureFields)
  });

  res.json(doc);
};
exports.statusDocument = async (req, res) => {
  const { documentId, status } = req.body;
  try {
    const doc = await Document.findById(documentId);
    if (!doc || doc.uploader.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    doc.status = status;
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.uploaderDocumentsGrouped = async (req, res) => {
  try {
    const documents = await Document.find({ uploader: req.user.userId }).populate('signer', 'name email');

    const grouped = documents.reduce((acc, doc) => {
      const status = doc.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(doc);
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};