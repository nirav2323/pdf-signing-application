const mongoose = require('mongoose');
const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  signedUrl: {
    type: String
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  signer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: { type: String, enum: ['Pending', 'Signed', 'Verified', 'Rejected'], default: 'Pending' },
  signatureFields: [
    {
      x: Number,
      y: Number,
      width:{type:Number, default:200},
      Height:{type:Number, default:100},
      page: Number
    }
  ]
}, { timestamps: true });
module.exports = mongoose.model('Document', documentSchema);