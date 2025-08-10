const mongoose = require('mongoose');
const signatureSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true
  },
  signer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  signatureImage: {
    type: String, // base64 or file URL
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  signedAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Signature', signatureSchema);