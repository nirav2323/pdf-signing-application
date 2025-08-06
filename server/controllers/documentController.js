const Document = require('../models/Document');
const User = require('../models/User');
const s3 = require('../utils/s3');

exports.uploadDocument = async (req, res) => {
  const file = req.file;
  const {assignedTo, title, signatureFields} = req.body;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `pdfs/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  const signer = await User.findOne({ email: assignedTo });
  if (!signer) return res.status(404).json({ message: 'Signer not found' });

  const uploaded = await s3.upload(params).promise();
  const doc = await Document.create({
    s3Url: uploaded.Location,
    title,
    s3Key: uploaded.Key,
    uploadedBy: req.user._id,
    assignedTo: signer._id,
    signatureFields: JSON.parse(signatureFields)
  });

  res.json(doc);
};

exports.getAssignedDocs = async (req, res) => {
  try {
    const docs = await Document.find({ assignedTo: req.user._id });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.signDocument = async (req, res) => {
  const { documentId, signature, name } = req.body;
  try {
    const doc = await Document.findById(documentId);
    if (!doc || !doc.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    doc.status = 'Signed';
    doc.signedFields = {
      signature,
      name,
      email: req.user.email,
      date: new Date()
    };
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyDocument = async (req, res) => {
  const { documentId, status } = req.body;
  try {
    const doc = await Document.findById(documentId);
    console.log('doc',doc)
    if (!doc || doc.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    doc.status = status;
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUploaderDocumentsGrouped = async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user._id }).populate('assignedTo', 'name email');

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
exports.getSignerDocumentsGrouped = async (req, res) => {
  try {
    const documents = await Document.find({ assignedTo: req.user.userId }).populate('uploadedBy', 'name email');
    const grouped = documents.reduce((acc, doc) => {
      const status = doc.status || 'Unknown';
      if (!acc[status]) acc[status] = [];
      acc[status].push(doc);
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    console.error('Error in getSignerDocumentsGrouped:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
