const mongoose = require('mongoose');
const documentSchema = new mongoose.Schema({
  title: String,
  s3Key: String,
  s3Url: String,
  signedUrl: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'Signed', 'Verified', 'Rejected'], default: 'Pending' },
  signatureFields: String,
  signedFields: {
    signature: String,
    name: String,
    email: String,
    date: Date
  }
}, { timestamps: true });
module.exports = mongoose.model('Document', documentSchema);